import { Signer } from "@ckb-ccc/core";
import {
  BTCTestnetType,
  buildRgbppLockArgs,
  Collector,
  genCkbJumpBtcVirtualTx,
  getXudtTypeScript,
  serializeScript,
} from "@rgbpp-sdk/ckb";
import { getAddressCellDeps, signAndSendTransaction } from "../helper";

export interface LeapToBtcParams {
  outIndex: number;
  btcTxId: string;
  xudtTypeArgs: string;
  transferAmount: bigint;
  isMainnet: boolean;
  collector: Collector;
  ckbAddress: string;
  btcTestnetType?: BTCTestnetType;
  cccSigner: Signer;
}

/**
 * Leap from CKB to BTC
 *
 * This function facilitates the transfer of assets from the CKB (Nervos Network) blockchain to the BTC (Bitcoin) blockchain.
 * It constructs the necessary arguments and transactions to move the specified amount of assets, identified by their type arguments,
 * from a CKB address to a BTC transaction. The function also handles the signing and sending of the transaction.
 *
 * @param {LeapToBtcParams} params - The parameters required for the leap operation.
 * @param {number} params.outIndex - The output index in the BTC transaction.
 * @param {string} params.btcTxId - The transaction ID of the BTC transaction.
 * @param {string} params.xudtTypeArgs - The type arguments for the XUDT (User Defined Token) on CKB.
 * @param {bigint} params.transferAmount - The amount of assets to transfer.
 * @param {boolean} params.isMainnet - Indicates whether the operation is on the mainnet.
 * @param {Collector} params.collector - The collector instance used for collecting cells.
 * @param {string} params.ckbAddress - The CKB address from which the assets are being transferred.
 * @param {BTCTestnetType} [params.btcTestnetType] - The type of BTC testnet, if applicable.
 * @param {Signer} params.cccSigner - The signer instance used for signing the transaction.
 * @param {bigint} [feeRate] - The fee rate for the transaction, optional.
 *
 * @returns {Promise<string>} - The transaction hash of the CKB transaction.
 */
export const leapFromCkbToBtc = async ({
  outIndex,
  btcTxId,
  xudtTypeArgs,
  transferAmount,
  isMainnet,
  collector,
  ckbAddress,
  btcTestnetType,
  cccSigner,
}: LeapToBtcParams, feeRate?: bigint): Promise<string> => {
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

  const { txHash } = await signAndSendTransaction(
    unsignedTx,
    collector,
    cccSigner,
  );

  console.info(
    `Rgbpp asset has been jumped from CKB to BTC and CKB tx hash is ${txHash}`,
  );

  return txHash;
};
