import {
  BTCTestnetType,
  Collector,
  genBtcJumpCkbVirtualTx,
  getXudtTypeScript,
  serializeScript,
} from "@rgbpp-sdk/ckb";
import { BtcAssetsApi, DataSource, sendRgbppUtxos } from "rgbpp";
import { AbstractWallet, TxResult } from "../helper";
import { signAndSendPsbt } from "../unisat";
import { getRgbppLockArgsList } from "./distribute";

interface LeapToCkbParams {
  rgbppLockArgsList: string[];
  toCkbAddress: string;
  xudtTypeArgs: string;
  transferAmount: bigint;
  isMainnet: boolean;
  collector: Collector;
  btcTestnetType?: BTCTestnetType;
  fromBtcAccount: string;
  fromBtcAccountPubkey?: string;
  btcDataSource: DataSource;
  btcService: BtcAssetsApi;
  unisat: AbstractWallet;
}

export const leapFromBtcToCKB = async ({
  rgbppLockArgsList,
  toCkbAddress,
  xudtTypeArgs,
  transferAmount,
  isMainnet,
  collector,
  btcTestnetType,
  fromBtcAccountPubkey,
  fromBtcAccount,
  btcDataSource,
  btcService,
  unisat,
}: LeapToCkbParams, btcFeeRate?: number): Promise<TxResult> => {
  const xudtType: CKBComponents.Script = {
    ...getXudtTypeScript(isMainnet),
    args: xudtTypeArgs,
  };

  const ckbVirtualTxResult = await genBtcJumpCkbVirtualTx({
    collector,
    rgbppLockArgsList,
    xudtTypeBytes: serializeScript(xudtType),
    transferAmount,
    toCkbAddress,
    isMainnet,
    btcTestnetType,
  });

  const { commitment, ckbRawTx } = ckbVirtualTxResult;

  // Send BTC tx
  const psbt = await sendRgbppUtxos({
    ckbVirtualTx: ckbRawTx,
    commitment,
    tos: [fromBtcAccount],
    ckbCollector: collector,
    from: fromBtcAccount,
    fromPubkey: fromBtcAccountPubkey,
    source: btcDataSource,
    feeRate: btcFeeRate,
  });

  const { txId: btcTxId } = await signAndSendPsbt(psbt, unisat, btcService);
  console.log(`BTC ${btcTestnetType} TxId: ${btcTxId}`);

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
            `Rgbpp asset has been jumped from BTC to CKB and the related CKB tx hash is ${txHash}`,
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

  return { btcTxId };
};

interface RgbppLeapFromBtcToCkbCombinedParams {
  toCkbAddress: string;
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

/**
 * Combines the parameters for leaping RGBPP assets from Bitcoin to CKB and executes the leap operation.
 *
 * @param {RgbppLeapFromBtcToCkbCombinedParams} params - The parameters for the leap operation.
 * @param {string} params.toCkbAddress - The destination CKB address.
 * @param {string} params.xudtTypeArgs - The arguments for the XUDT type script.
 * @param {bigint} params.transferAmount - The amount of assets to transfer.
 * @param {Collector} params.collector - The collector instance for CKB operations.
 * @param {DataSource} params.btcDataSource - The data source for BTC operations.
 * @param {BTCTestnetType} [params.btcTestnetType] - The type of BTC testnet (optional).
 * @param {boolean} params.isMainnet - Indicates if the operation is on mainnet.
 * @param {string} params.fromBtcAccount - The source BTC account.
 * @param {string} [params.fromBtcAccountPubkey] - The public key of the source BTC account (optional).
 * @param {AbstractWallet} params.unisat - The Unisat wallet instance.
 * @param {BtcAssetsApi} params.btcService - The BTC assets service instance.
 * @param {number} [btcFeeRate] - The fee rate for the BTC transaction (optional).
 *
 * @returns {Promise<TxResult>} - The result of the transaction.
 */
export const leapFromBtcToCkbCombined = async (
  {
    toCkbAddress,
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
  }: RgbppLeapFromBtcToCkbCombinedParams,
  btcFeeRate?: number,
): Promise<TxResult> => {
  const lockArgsListResponse = await getRgbppLockArgsList({
    xudtTypeArgs,
    fromBtcAccount,
    isMainnet,
    btcService,
  });

  const res = await leapFromBtcToCKB({
    rgbppLockArgsList: lockArgsListResponse.rgbppLockArgsList,
    toCkbAddress,
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
  }, btcFeeRate);

  return res;
};
