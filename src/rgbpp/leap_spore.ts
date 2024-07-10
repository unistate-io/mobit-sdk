import {
  BTCTestnetType,
  Collector,
  genLeapSporeFromBtcToCkbVirtualTx,
  getSporeTypeScript,
  Hex,
  serializeScript,
} from "@rgbpp-sdk/ckb";
import { BtcAssetsApi, DataSource, sendRgbppUtxos } from "rgbpp";
import { AbstractWallet, TxResult } from "../helper";
import { signAndSendPsbt } from "../unisat";

interface SporeLeapParams {
  sporeRgbppLockArgs: Hex;
  toCkbAddress: string;
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

const leapSporeFromBtcToCkb = async ({
  sporeRgbppLockArgs,
  toCkbAddress,
  sporeTypeArgs,
  collector,
  isMainnet,
  btcTestnetType,
  fromBtcAddress,
  fromBtcAddressPubkey,
  btcDataSource,
  unisat,
  btcService,
}: SporeLeapParams): Promise<TxResult> => {
  const sporeTypeBytes = serializeScript({
    ...getSporeTypeScript(isMainnet),
    args: sporeTypeArgs,
  });
  const ckbVirtualTxResult = await genLeapSporeFromBtcToCkbVirtualTx({
    collector,
    sporeRgbppLockArgs,
    sporeTypeBytes,
    toCkbAddress,
    isMainnet,
    btcTestnetType,
  });

  const { commitment, ckbRawTx, needPaymasterCell } = ckbVirtualTxResult;
  // Send BTC tx
  const psbt = await sendRgbppUtxos({
    ckbVirtualTx: ckbRawTx,
    commitment,
    tos: [fromBtcAddress],
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
        btcTxId
      );
      console.log("state", state);
      if (state === "completed" || state === "failed") {
        clearInterval(interval);
        if (state === "completed") {
          const { txhash: txHash } = await btcService.getRgbppTransactionHash(
            btcTxId
          );
          console.info(
            `Rgbpp spore has been leaped from BTC to CKB and the related CKB tx hash is ${txHash}`
          );
        } else {
          console.warn(
            `Rgbpp CKB transaction failed and the reason is ${failedReason} `
          );
        }
      }
    }, 30 * 1000);
  } catch (error) {
    console.error(error);
    return {
      error,
      btcTxId,
    };
  }

  return {
    btcTxId,
  };
};

interface SporeLeapCombinedParams {
  toCkbAddress: string;
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

export const leapSporeFromBtcToCkbCombined = async ({
  toCkbAddress,
  sporeTypeArgs,
  collector,
  isMainnet,
  btcTestnetType,
  fromBtcAddress,
  fromBtcAddressPubkey,
  btcDataSource,
  unisat,
  btcService,
}: SporeLeapCombinedParams) => {
  const sporeRgbppLockArgs = await getSporeRgbppLockArgs({
    fromBtcAddress,
    sporeTypeArgs,
    isMainnet,
    btcService,
  });

  const res = await leapSporeFromBtcToCkb({
    sporeRgbppLockArgs,
    toCkbAddress,
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

    if (!data || data.length === 0) {
      throw new Error(
        "No assets found for the given BTC address and type script."
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