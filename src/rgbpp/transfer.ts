import { BtcAssetsApi, buildRgbppTransferTx } from "rgbpp";
import { BTCTestnetType, Collector, getXudtTypeScript } from "@rgbpp-sdk/ckb";
import { bitcoin, DataSource } from "@rgbpp-sdk/btc";
import { signAndSendPsbt } from "../unisat";
import { AbstractWallet } from "../helper";

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
  const type_script = JSON.stringify({
    ...getXudtTypeScript(isMainnet),
    "args": xudtTypeArgs,
  });

  console.log(type_script);

  const data = await btcService.getRgbppAssetsByBtcAddress(fromBtcAccount, {
    type_script: encodeURIComponent(
      type_script
    ),
    no_cache: false,
  });

  console.log(data);

  // Assuming you want to return the rgbppLockArgsList based on the response
  const rgbppLockArgsList = data.map((asset) => asset.cellOutput.lock.args);

  return { rgbppLockArgsList };
};

interface RgbppTransferParams {
  rgbppLockArgsList: string[];
  toBtcAddress: string;
  xudtTypeArgs: string;
  transferAmount: bigint;
  collector: Collector;
  btcDataSource: DataSource;
  btcTestnetType?: BTCTestnetType;
  isMainnet: boolean;
  fromBtcAccount: string;
  fromBtcAccountPubkey?: string;
  unisat: AbstractWallet;
  btcService: BtcAssetsApi;
}

const transfer = async ({
  rgbppLockArgsList,
  toBtcAddress,
  xudtTypeArgs,
  transferAmount,
  collector,
  btcDataSource,
  btcTestnetType,
  isMainnet,
  fromBtcAccount,
  fromBtcAccountPubkey,
  unisat,
  btcService,
}: RgbppTransferParams) => {
  const { ckbVirtualTxResult, btcPsbtHex } = await buildRgbppTransferTx({
    ckb: {
      collector,
      xudtTypeArgs,
      rgbppLockArgsList,
      transferAmount,
    },
    btc: {
      fromAddress: fromBtcAccount,
      toAddress: toBtcAddress,
      fromPubkey: fromBtcAccountPubkey,
      dataSource: btcDataSource,
      testnetType: btcTestnetType,
    },
    isMainnet,
  });
  console.log(btcPsbtHex);

  // Send BTC tx
  const psbt = bitcoin.Psbt.fromHex(btcPsbtHex);
  const { txId: btcTxId } = await signAndSendPsbt(
    psbt,
    unisat,
    btcService,
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
  }
};

interface RgbppTransferCombinedParams {
  toBtcAddress: string;
  xudtTypeArgs: string;
  transferAmount: bigint;
  collector: Collector;
  btcDataSource: DataSource;
  btcTestnetType?: BTCTestnetType;
  isMainnet: boolean;
  fromBtcAccount: string;
  fromBtcAccountPubkey?: string;
  unisat: AbstractWallet;
  btcService: BtcAssetsApi;
}

export const transferCombined = async ({
  toBtcAddress,
  xudtTypeArgs,
  transferAmount,
  collector,
  btcDataSource,
  btcTestnetType,
  isMainnet,
  fromBtcAccount,
  fromBtcAccountPubkey,
  unisat,
  btcService,
}: RgbppTransferCombinedParams) => {
  const lockArgsListResponse = await getRgbppLockArgsList({
    xudtTypeArgs,
    fromBtcAccount,
    isMainnet,
    btcService,
  });

  await transfer({
    rgbppLockArgsList: lockArgsListResponse.rgbppLockArgsList,
    toBtcAddress,
    xudtTypeArgs,
    transferAmount,
    collector,
    btcDataSource,
    btcTestnetType,
    isMainnet,
    fromBtcAccount,
    fromBtcAccountPubkey,
    unisat,
    btcService,
  });
};
