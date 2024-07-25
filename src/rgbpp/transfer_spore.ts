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
}: SporeTransferParams, btcFeeRate: number = 30) => {
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

/**
 * Transfers a spore to a specified BTC address.
 *
 * @param {SporeTransferCombinedParams} params - The parameters for the spore transfer.
 * @param {string} params.toBtcAddress - The recipient's BTC address.
 * @param {Hex} params.sporeTypeArgs - The type arguments for the spore.
 * @param {Collector} params.collector - The collector object.
 * @param {boolean} params.isMainnet - Indicates if the operation is on the mainnet.
 * @param {BTCTestnetType} [params.btcTestnetType] - The type of BTC testnet (optional).
 * @param {string} params.fromBtcAddress - The sender's BTC address.
 * @param {string} [params.fromBtcAddressPubkey] - The sender's BTC address public key (optional).
 * @param {DataSource} params.btcDataSource - The data source for BTC.
 * @param {AbstractWallet} params.unisat - The Unisat wallet object.
 * @param {BtcAssetsApi} params.btcService - The BTC assets API service.
 * @param {number} [btcFeeRate=30] - The fee rate for the BTC transaction (optional, default is 30).
 * @returns {Promise<{ btcTxId: string }>} - The result of the spore transfer, including the BTC transaction ID.
 */
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
}: SporeTransferCombinedParams, btcFeeRate: number = 30) => {
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
