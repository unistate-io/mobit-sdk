import {
  BTCTestnetType,
  Collector,
  genTransferSporeCkbVirtualTx,
  getSporeTypeScript,
  Hex,
  serializeScript,
} from "@rgbpp-sdk/ckb";
import { BtcAssetsApi, DataSource, sendRgbppUtxos } from "rgbpp";
import { AbstractWallet } from "../helper";
import { signAndSendPsbt } from "../unisat";

interface SporeTransferParams {
  sporeRgbppLockArgs: Hex;
  toBtcAddress: string;
  sporeTypeArgs: Hex;
  collector: Collector;
  isMainnet: boolean;
  btcTestnetType?: BTCTestnetType;
  fromBtcAddress: string;
  fromBtcAddressPubkey?: string;
  btcDataSource: DataSource;
  unisat: AbstractWallet;
  btcService: BtcAssetsApi;
}

const transferSpore = async ({
  sporeRgbppLockArgs,
  toBtcAddress,
  sporeTypeArgs,
  collector,
  isMainnet,
  btcTestnetType,
  fromBtcAddress,
  fromBtcAddressPubkey,
  btcDataSource,
  btcService,
  unisat,
}: SporeTransferParams) => {
  const sporeTypeBytes = serializeScript({
    ...getSporeTypeScript(isMainnet),
    args: sporeTypeArgs,
  });

  const ckbVirtualTxResult = await genTransferSporeCkbVirtualTx({
    collector,
    sporeRgbppLockArgs,
    sporeTypeBytes,
    isMainnet,
    btcTestnetType,
  });

  const { commitment, ckbRawTx, needPaymasterCell } = ckbVirtualTxResult;

  // Send BTC tx
  const psbt = await sendRgbppUtxos({
    ckbVirtualTx: ckbRawTx,
    commitment,
    tos: [toBtcAddress],
    needPaymaster: needPaymasterCell,
    ckbCollector: collector,
    from: fromBtcAddress,
    fromPubkey: fromBtcAddressPubkey,
    source: btcDataSource,
    feeRate: 30,
  });

  const { txId: btcTxId } = await signAndSendPsbt(psbt, unisat, btcService);
  console.log("BTC TxId: ", btcTxId);

  await btcService.sendRgbppCkbTransaction({
    btc_txid: btcTxId,
    ckb_virtual_result: ckbVirtualTxResult,
  });

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
            `Rgbpp spore has been transferred on BTC and the related CKB tx hash is ${txHash}`,
          );
        } else {
          console.warn(
            `Rgbpp CKB transaction failed and the reason is ${failedReason} `,
          );
        }
      }
    }, 30 * 1000);
  } catch (error) {
    let processedError: Error;
    if (error instanceof Error) {
      processedError = error;
    } else {
      processedError = new Error(String(error));
    }
    console.error(processedError);
    return {
      error: processedError,
      btcTxId,
    };
  }

  return {
    btcTxId,
  };
};

interface SporeTransferCombinedParams {
  toBtcAddress: string;
  sporeTypeArgs: Hex;
  collector: Collector;
  isMainnet: boolean;
  btcTestnetType?: BTCTestnetType;
  fromBtcAddress: string;
  fromBtcAddressPubkey?: string;
  btcDataSource: DataSource;
  unisat: AbstractWallet;
  btcService: BtcAssetsApi;
}

export const transferSporeCombined = async ({
  toBtcAddress,
  sporeTypeArgs,
  collector,
  isMainnet,
  btcTestnetType,
  fromBtcAddress,
  fromBtcAddressPubkey,
  btcDataSource,
  unisat,
  btcService,
}: SporeTransferCombinedParams) => {
  const sporeRgbppLockArgs = await getSporeRgbppLockArgs({
    fromBtcAddress,
    sporeTypeArgs,
    isMainnet,
    btcService,
  });

  const res = await transferSpore({
    sporeRgbppLockArgs,
    toBtcAddress,
    sporeTypeArgs,
    collector,
    isMainnet,
    btcTestnetType,
    fromBtcAddress,
    fromBtcAddressPubkey,
    btcDataSource,
    unisat,
    btcService,
  });

  return res;
};

interface GetSporeRgbppLockArgsParams {
  fromBtcAddress: string;
  sporeTypeArgs: Hex;
  isMainnet: boolean;
  btcService: BtcAssetsApi;
}

const getSporeRgbppLockArgs = async ({
  fromBtcAddress,
  sporeTypeArgs,
  isMainnet,
  btcService,
}: GetSporeRgbppLockArgsParams): Promise<Hex> => {
  const type_script = JSON.stringify({
    ...getSporeTypeScript(isMainnet),
    args: sporeTypeArgs,
  });

  console.log(type_script);

  try {
    const data = await btcService.getRgbppAssetsByBtcAddress(fromBtcAddress, {
      type_script: encodeURIComponent(type_script),
      no_cache: false,
    });

    console.log(data);

    if (data.length === 0) {
      throw new Error(
        "No assets found for the given BTC address and type script.",
      );
    }
    // Assuming you want to return the sporeRgbppLockArgs based on the response
    const sporeRgbppLockArgs = data.map((asset) => asset.cellOutput.lock.args);

    // Assuming you need to return a single Hex value from the list
    return sporeRgbppLockArgs[0];
  } catch (error) {
    console.error("Error fetching sporeRgbppLockArgs:", error);
    throw error;
  }
};
