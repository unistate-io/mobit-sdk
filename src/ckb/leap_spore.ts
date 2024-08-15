import {
  BTCTestnetType,
  buildRgbppLockArgs,
  Collector,
  genLeapSporeFromCkbToBtcRawTx,
  getSporeTypeScript,
  serializeScript,
} from "@rgbpp-sdk/ckb";
import { getAddressCellDeps } from "../helper";

export interface LeapSporeToBtcTransactionParams {
  outIndex: number;
  btcTxId: string;
  sporeTypeArgs: string;
  isMainnet: boolean;
  collector: Collector;
  ckbAddress: string;
  btcTestnetType?: BTCTestnetType;
}

/**
 * Leap a spore from CKB to BTC.
 *
 * @param {LeapSporeToBtcTransactionParams} params - The parameters for leaping a spore from CKB to BTC.
 * @param {number} params.outIndex - The output index of the spore.
 * @param {string} params.btcTxId - The transaction ID of the BTC transaction.
 * @param {string} params.sporeTypeArgs - The type arguments for the spore.
 * @param {boolean} params.isMainnet - A flag indicating whether the operation is on the mainnet.
 * @param {Collector} params.collector - The collector instance.
 * @param {string} params.ckbAddress - The CKB address.
 * @param {BTCTestnetType} [params.btcTestnetType] - (Optional) The type of BTC testnet.
 * @param {bigint} [feeRate] - (Optional) The fee rate for the transaction.
 * @param {number} [witnessLockPlaceholderSize] - (Optional) The size of the witness lock placeholder.
 * @returns {Promise<CKBComponents.RawTransactionToSign>} A promise that resolves to the unsigned raw transaction to sign.
 */
export const leapSporeFromCkbToBtcTransaction = async (
  {
    outIndex,
    btcTxId,
    sporeTypeArgs,
    isMainnet,
    collector,
    ckbAddress,
    btcTestnetType,
  }: LeapSporeToBtcTransactionParams,
  feeRate?: bigint,
  witnessLockPlaceholderSize?: number,
): Promise<CKBComponents.RawTransactionToSign> => {
  const toRgbppLockArgs = buildRgbppLockArgs(outIndex, btcTxId);

  const sporeType: CKBComponents.Script = {
    ...getSporeTypeScript(isMainnet),
    args: sporeTypeArgs,
  };

  const ckbRawTx = await genLeapSporeFromCkbToBtcRawTx({
    collector,
    fromCkbAddress: ckbAddress,
    toRgbppLockArgs,
    sporeTypeBytes: serializeScript(sporeType),
    isMainnet,
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
