import {
  BTCTestnetType,
  buildRgbppLockArgs,
  Collector,
  genCkbJumpBtcVirtualTx,
  getXudtTypeScript,
  serializeScript,
} from "@rgbpp-sdk/ckb";
import { getAddressCellDeps } from "../helper";

/**
 * Interface for parameters required for the leap from CKB to BTC transaction.
 */
export interface LeapToBtcTransactionParams {
  /**
   * The output index in the BTC transaction.
   */
  outIndex: number;
  /**
   * The transaction ID of the BTC transaction.
   */
  btcTxId: string;
  /**
   * The type arguments for the XUDT (User Defined Token) on CKB.
   */
  xudtTypeArgs: string;
  /**
   * The amount of assets to transfer.
   */
  transferAmount: bigint;
  /**
   * Indicates whether the operation is on the mainnet.
   */
  isMainnet: boolean;
  /**
   * The collector instance used for collecting cells.
   */
  collector: Collector;
  /**
   * The CKB address from which the assets are being transferred.
   */
  ckbAddress: string;
  /**
   * The type of BTC testnet, if applicable.
   */
  btcTestnetType?: BTCTestnetType;
}

/**
 * Leap from CKB to BTC
 *
 * This function facilitates the transfer of assets from the CKB (Nervos Network) blockchain to the BTC (Bitcoin) blockchain.
 * It constructs the necessary arguments and transactions to move the specified amount of assets, identified by their type arguments,
 * from a CKB address to a BTC transaction. The function also handles the signing and sending of the transaction.
 *
 * @param {LeapToBtcTransactionParams} params - The parameters required for the leap operation.
 * @param {number} params.outIndex - The output index in the BTC transaction.
 * @param {string} params.btcTxId - The transaction ID of the BTC transaction.
 * @param {string} params.xudtTypeArgs - The type arguments for the XUDT (User Defined Token) on CKB.
 * @param {bigint} params.transferAmount - The amount of assets to transfer.
 * @param {boolean} params.isMainnet - Indicates whether the operation is on the mainnet.
 * @param {Collector} params.collector - The collector instance used for collecting cells.
 * @param {string} params.ckbAddress - The CKB address from which the assets are being transferred.
 * @param {BTCTestnetType} [params.btcTestnetType] - The type of BTC testnet, if applicable.
 * @param {bigint} [feeRate] - The fee rate for the transaction, optional.
 * @param {number} [witnessLockPlaceholderSize] - The size of the witness lock placeholder, optional.
 *
 * @returns {Promise<CKBComponents.RawTransactionToSign>} - The unsigned raw transaction to sign.
 */
export const leapFromCkbToBtcTransaction = async (
  {
    outIndex,
    btcTxId,
    xudtTypeArgs,
    transferAmount,
    isMainnet,
    collector,
    ckbAddress,
    btcTestnetType,
  }: LeapToBtcTransactionParams,
  feeRate?: bigint,
  witnessLockPlaceholderSize?: number,
): Promise<CKBComponents.RawTransactionToSign> => {
  const toRgbppLockArgs = buildRgbppLockArgs(outIndex, btcTxId);

  const xudtType: CKBComponents.Script = {
    ...getXudtTypeScript(isMainnet),
    args: xudtTypeArgs,
  };

  const ckbRawTx = await genCkbJumpBtcVirtualTx({
    collector,
    fromCkbAddress: ckbAddress,
    toRgbppLockArgs,
    xudtTypeBytes: serializeScript(xudtType),
    transferAmount,
    btcTestnetType,
    ckbFeeRate: feeRate,
    witnessLockPlaceholderSize,
  });

  const emptyWitness = { lock: "", inputType: "", outputType: "" };
  const unsignedTx: CKBComponents.RawTransactionToSign = {
    ...ckbRawTx,
    cellDeps: [
      ...ckbRawTx.cellDeps,
      ...(await getAddressCellDeps(isMainnet, [ckbAddress])),
    ],
    witnesses: [emptyWitness, ...ckbRawTx.witnesses.slice(1)],
  };

  return unsignedTx;
};
