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
}: SporeLeapParams, btcFeeRate: number = 30): Promise<TxResult> => {
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
    feeRate: btcFeeRate,
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
            `Rgbpp spore has been leaped from BTC to CKB and the related CKB tx hash is ${txHash}`,
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
    throw error;
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

/**
 * Combines the process of leaping a spore from BTC to CKB with the necessary parameters.
 *
 * @param {SporeLeapCombinedParams} params - The parameters required for the spore leap process.
 * @param {number} [btcFeeRate=30] - The fee rate for the BTC transaction (default is 30).
 *
 * @param {string} params.toCkbAddress - The CKB address to which the spore will be sent.
 * @param {Hex} params.sporeTypeArgs - The type arguments for the spore.
 * @param {Collector} params.collector - The collector object used for collecting the spore.
 * @param {boolean} params.isMainnet - Indicates whether the operation is on the mainnet.
 * @param {BTCTestnetType} [params.btcTestnetType] - The type of BTC testnet (optional).
 * @param {string} params.fromBtcAddress - The BTC address from which the spore will be sent.
 * @param {string} [params.fromBtcAddressPubkey] - The public key of the BTC address (optional).
 * @param {DataSource} params.btcDataSource - The data source for BTC transactions.
 * @param {AbstractWallet} params.unisat - The Unisat wallet instance.
 * @param {BtcAssetsApi} params.btcService - The BTC assets API service.
 *
 * @returns {Promise<TxResult>} - The result of the transaction, including the BTC transaction ID.
 */
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
}: SporeLeapCombinedParams, btcFeeRate: number = 30) => {
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
  }, btcFeeRate);

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
