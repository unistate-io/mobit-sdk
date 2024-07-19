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
}: LeapToBtcParams): Promise<string> => {
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
