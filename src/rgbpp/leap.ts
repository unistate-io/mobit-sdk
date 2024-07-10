import { bitcoin } from "@rgbpp-sdk/btc";
import {
  BTCTestnetType,
  Collector,
  genBtcJumpCkbVirtualTx,
  getXudtTypeScript,
  serializeScript,
} from "@rgbpp-sdk/ckb";
import { BtcAssetsApi, DataSource, sendRgbppUtxos } from "rgbpp";
import { signAndSendPsbt } from "../unisat";
import { AbstractWallet, TxResult } from "../helper";

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
  unisat: AbstractWallet
}

export const leapFromBtcToCKB = async (
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
    unisat
  }: LeapToCkbParams,
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
    return { error, btcTxId }
  }

  return { btcTxId };
};
