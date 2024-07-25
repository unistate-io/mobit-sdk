import { Signer } from "@ckb-ccc/core";
import {
  BTCTestnetType,
  buildRgbppLockArgs,
  Collector,
  genLeapSporeFromCkbToBtcRawTx,
  getSporeTypeScript,
  serializeScript,
} from "@rgbpp-sdk/ckb";
import { getAddressCellDeps, signAndSendTransaction } from "../helper";

export interface LeapSporeToBtcParams {
  outIndex: number;
  btcTxId: string;
  sporeTypeArgs: string;
  isMainnet: boolean;
  collector: Collector;
  ckbAddress: string;
  btcTestnetType?: BTCTestnetType;
  cccSigner: Signer;
}

/**
 * Leap a spore from CKB to BTC.
 *
 * @param params - The parameters for leaping a spore from CKB to BTC.
 * @param params.outIndex - The output index of the spore.
 * @param params.btcTxId - The transaction ID of the BTC transaction.
 * @param params.sporeTypeArgs - The type arguments for the spore.
 * @param params.isMainnet - A flag indicating whether the operation is on the mainnet.
 * @param params.collector - The collector instance.
 * @param params.ckbAddress - The CKB address.
 * @param params.btcTestnetType - (Optional) The type of BTC testnet.
 * @param params.cccSigner - The signer instance for CCC.
 * @param feeRate - (Optional) The fee rate for the transaction.
 * @returns A promise that resolves to the transaction hash of the CKB transaction.
 */
export const leapSporeFromCkbToBtc = async (
  {
    outIndex,
    btcTxId,
    sporeTypeArgs,
    isMainnet,
    collector,
    ckbAddress,
    btcTestnetType,
    cccSigner,
  }: LeapSporeToBtcParams,
  feeRate?: bigint,
): Promise<string> => {
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
    `Rgbpp spore has been jumped from CKB to BTC and CKB tx hash is ${txHash}`,
  );

  return txHash;
};
