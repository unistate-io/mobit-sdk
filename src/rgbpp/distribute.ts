import { BtcAssetsApi } from "rgbpp";
import {
  BTCTestnetType,
  Collector,
  genBtcBatchTransferCkbVirtualTx,
  getXudtTypeScript,
  RgbppBtcAddressReceiver,
  serializeScript,
} from "@rgbpp-sdk/ckb";
import { DataSource, sendRgbppUtxos } from "@rgbpp-sdk/btc";
import { AbstractWallet } from "../helper";
import { signAndSendPsbt } from "../unisat";

interface RgbppLockArgsListParams {
  xudtTypeArgs: string;
  fromBtcAccount: string;
  isMainnet: boolean;
  btcService: BtcAssetsApi;
}

interface RgbppLockArgsListResponse {
  rgbppLockArgsList: string[];
}

const getRgbppLockArgsList = async ({
  xudtTypeArgs,
  fromBtcAccount,
  isMainnet,
  btcService,
}: RgbppLockArgsListParams): Promise<RgbppLockArgsListResponse> => {
  const type_script = encodeURIComponent(
    JSON.stringify({
      "codeHash": getXudtTypeScript(isMainnet).codeHash,
      "args": xudtTypeArgs,
      "hashType": "type",
    }),
  );

  console.log(type_script);

  const data = await btcService.getRgbppAssetsByBtcAddress(fromBtcAccount, {
    type_script,
    no_cache: false,
  });

  console.log(data);

  // Assuming you want to return the rgbppLockArgsList based on the response
  const rgbppLockArgsList = data.map((asset) => asset.cellOutput.lock.args);

  return { rgbppLockArgsList };
};

interface RgbppDistributeParams {
  rgbppLockArgsList: string[];
  receivers: RgbppBtcAddressReceiver[];
  xudtTypeArgs: string;
  collector: Collector;
  btcDataSource: DataSource;
  btcTestnetType?: BTCTestnetType;
  isMainnet: boolean;
  fromBtcAccount: string;
  fromBtcAccountPubkey?: string;
  unisat: AbstractWallet;
  btcService: BtcAssetsApi;
}

const distribute = async ({
  rgbppLockArgsList,
  receivers,
  xudtTypeArgs,
  collector,
  btcDataSource,
  btcTestnetType,
  isMainnet,
  fromBtcAccount,
  fromBtcAccountPubkey,
  unisat,
  btcService,
}: RgbppDistributeParams): Promise<{ btcTxId: string; error?: any }> => {
  const xudtType: CKBComponents.Script = {
    ...getXudtTypeScript(isMainnet),
    args: xudtTypeArgs,
  };

  const ckbVirtualTxResult = await genBtcBatchTransferCkbVirtualTx({
    collector,
    rgbppLockArgsList,
    xudtTypeBytes: serializeScript(xudtType),
    rgbppReceivers: receivers,
    isMainnet,
    btcTestnetType,
  });

  const {
    commitment,
    ckbRawTx,
    needPaymasterCell,
  } = ckbVirtualTxResult;

  // Send BTC tx
  const psbt = await sendRgbppUtxos({
    ckbVirtualTx: ckbRawTx,
    commitment,
    tos: receivers.map((receiver) => receiver.toBtcAddress),
    needPaymaster: needPaymasterCell,
    ckbCollector: collector,
    from: fromBtcAccount,
    fromPubkey: fromBtcAccountPubkey,
    source: btcDataSource,
  });

  const { txId: btcTxId, rawTxHex: btcTxBytes } = await signAndSendPsbt(
    psbt, unisat, btcService
  );

  console.log(`BTC ${btcTestnetType} TxId: ${btcTxId}`);

  await btcService.sendRgbppCkbTransaction({
    btc_txid: btcTxId,
    ckb_virtual_result: ckbVirtualTxResult,
  });

  // TODO： 错误处理，不清楚前端怎么处理会更好一些
  try {
    const interval = setInterval(async () => {
      const { state, failedReason } = await btcService.getRgbppTransactionState(
        btcTxId,
      );
      console.log("state", state);
      if (state === "completed" || state === "failed") {
        clearInterval(interval);
        if (state === "completed") {
          const { txhash: txHash } = await btcService.getRgbppTransactionHash(
            btcTxId,
          );
          console.info(
            `Rgbpp asset has been transferred on BTC and the related CKB tx hash is ${txHash}`,
          );
        } else {
          console.warn(
            `Rgbpp CKB transaction failed and the reason is ${failedReason} `,
          );
        }
      }
    }, 30 * 1000);
  } catch (error) {
    console.error(error);
    return { error, btcTxId };
  }

  return { btcTxId };
};

interface RgbppDistributeCombinedParams {
  receivers: RgbppBtcAddressReceiver[];
  xudtTypeArgs: string;
  collector: Collector;
  btcDataSource: DataSource;
  btcTestnetType?: BTCTestnetType;
  isMainnet: boolean;
  fromBtcAccount: string;
  fromBtcAccountPubkey?: string;
  unisat: AbstractWallet;
  filterRgbppArgslist: (argsList: string[]) => Promise<string[]>;
  btcService: BtcAssetsApi;
}

export const distributeCombined = async ({
  xudtTypeArgs,
  receivers,
  collector,
  btcDataSource,
  btcTestnetType,
  isMainnet,
  fromBtcAccount,
  fromBtcAccountPubkey,
  unisat,
  filterRgbppArgslist,
  btcService,
}: RgbppDistributeCombinedParams): Promise<{ btcTxId: string; error?: any }> => {
  const lockArgsListResponse = await getRgbppLockArgsList({
    xudtTypeArgs,
    fromBtcAccount,
    isMainnet,
    btcService,
  });
  const filteredLockArgsList = await filterRgbppArgslist(
    lockArgsListResponse.rgbppLockArgsList,
  );

  const res =
    await distribute({
      rgbppLockArgsList: filteredLockArgsList,
      receivers,
      xudtTypeArgs,
      collector,
      btcDataSource,
      btcTestnetType,
      isMainnet,
      fromBtcAccount,
      fromBtcAccountPubkey,
      unisat,
      btcService,
    });

  return res;
};
