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
