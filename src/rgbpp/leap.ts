import {
  BTCTestnetType,
  Collector,
  genBtcJumpCkbVirtualTx,
  getXudtTypeScript,
  serializeScript,
} from "@rgbpp-sdk/ckb";
import { BtcAssetsApi, DataSource, sendRgbppUtxos } from "rgbpp";
import { AbstractWallet, TxResult } from "../helper";
import { signAndSendPsbt } from "../wallet";
import { getRgbppLockArgsList } from "./distribute";
import { bitcoin } from "@rgbpp-sdk/btc";

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
  wallet: AbstractWallet;
}

const leapFromBtcToCKB = async (
  {
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
    wallet,
  }: LeapToCkbParams,
  btcFeeRate?: number,
): Promise<TxResult> => {
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

  const { txId: btcTxId } = await signAndSendPsbt(psbt, wallet, btcService);
  console.log(`BTC ${btcTestnetType} TxId: ${btcTxId}`);

  await btcService.sendRgbppCkbTransaction({
    btc_txid: btcTxId,
    ckb_virtual_result: ckbVirtualTxResult,
  });

  try {
    const interval = setInterval(async () => {
      const { state, failedReason } =
        await btcService.getRgbppTransactionState(btcTxId);
      console.log("state", state);
      if (state === "completed" || state === "failed") {
        clearInterval(interval);
        if (state === "completed") {
          const { txhash: txHash } =
            await btcService.getRgbppTransactionHash(btcTxId);
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
  wallet: AbstractWallet;
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
 * @param {AbstractWallet} params.wallet - Wallet instance used for signing BTC transactions.
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
    wallet,
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

  const res = await leapFromBtcToCKB(
    {
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
      wallet,
      btcService,
    },
    btcFeeRate,
  );

  return res;
};

interface PrepareLeapUnsignedPsbtParams {
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
  btcFeeRate?: number;
}

/**
 * Prepares an unsigned PSBT (Partially Signed Bitcoin Transaction) for leaping RGBPP assets from Bitcoin to CKB.
 * This function is used to estimate transaction fees before finalizing the transaction.
 *
 * @param {PrepareLeapUnsignedPsbtParams} params - Parameters required to generate the unsigned PSBT.
 * @param {string[]} params.rgbppLockArgsList - List of RGBPP lock arguments.
 * @param {string} params.toCkbAddress - The destination CKB address.
 * @param {string} params.xudtTypeArgs - Type arguments for the XUDT type script.
 * @param {bigint} params.transferAmount - The amount of assets to transfer.
 * @param {boolean} params.isMainnet - Indicates whether the operation is on the mainnet.
 * @param {Collector} params.collector - Collector instance used to gather cells for the transaction.
 * @param {BTCTestnetType} [params.btcTestnetType] - Type of BTC testnet (optional).
 * @param {string} params.fromBtcAccount - BTC account from which the assets will be leaped.
 * @param {string} [params.fromBtcAccountPubkey] - Public key of the BTC account (optional).
 * @param {DataSource} params.btcDataSource - Data source for BTC transactions.
 * @param {number} [params.btcFeeRate] - Fee rate for the BTC transaction (optional, default is 30).
 * @returns {Promise<bitcoin.Psbt>} - Promise that resolves to the unsigned PSBT.
 */
export const prepareLeapUnsignedPsbt = async ({
  rgbppLockArgsList,
  toCkbAddress,
  xudtTypeArgs,
  transferAmount,
  isMainnet,
  collector,
  btcTestnetType,
  fromBtcAccount,
  fromBtcAccountPubkey,
  btcDataSource,
  btcFeeRate = 30,
}: PrepareLeapUnsignedPsbtParams): Promise<bitcoin.Psbt> => {
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

  // Generate unsigned PSBT
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

  return psbt;
};
