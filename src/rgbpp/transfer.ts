import { bitcoin, DataSource } from "@rgbpp-sdk/btc";
import { BTCTestnetType, Collector, getXudtTypeScript } from "@rgbpp-sdk/ckb";
import { BtcAssetsApi, buildRgbppTransferTx } from "rgbpp";
import { AbstractWallet, TxResult } from "../helper";
import { signAndSendPsbt } from "../unisat";

interface RgbppLockArgsListParams {
  xudtTypeArgs: string;
  fromBtcAccount: string;
  isMainnet: boolean;
  btcService: BtcAssetsApi;
}

interface RgbppLockArgsListResponse {
  rgbppLockArgsList: string[];
}

const getRgbppLockArgsList = async ({
  xudtTypeArgs,
  fromBtcAccount,
  isMainnet,
  btcService,
}: RgbppLockArgsListParams): Promise<RgbppLockArgsListResponse> => {
  const type_script = JSON.stringify({
    ...getXudtTypeScript(isMainnet),
    args: xudtTypeArgs,
  });

  console.log(type_script);

  const data = await btcService.getRgbppAssetsByBtcAddress(fromBtcAccount, {
    type_script: encodeURIComponent(type_script),
    no_cache: false,
  });

  console.log(data);

  // Assuming you want to return the rgbppLockArgsList based on the response
  const rgbppLockArgsList = data.map((asset) => asset.cellOutput.lock.args);

  return { rgbppLockArgsList };
};

interface RgbppTransferParams {
  rgbppLockArgsList: string[];
  toBtcAddress: string;
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

const transfer = async ({
  rgbppLockArgsList,
  toBtcAddress,
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
}: RgbppTransferParams, btcFeeRate?: number): Promise<TxResult> => {
  const { ckbVirtualTxResult, btcPsbtHex } = await buildRgbppTransferTx({
    ckb: {
      collector,
      xudtTypeArgs,
      rgbppLockArgsList,
      transferAmount,
    },
    btc: {
      fromAddress: fromBtcAccount,
      toAddress: toBtcAddress,
      fromPubkey: fromBtcAccountPubkey,
      dataSource: btcDataSource,
      testnetType: btcTestnetType,
      feeRate: btcFeeRate,
    },
    isMainnet,
  });
  console.log(btcPsbtHex);

  // Send BTC tx
  const psbt = bitcoin.Psbt.fromHex(btcPsbtHex);
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
            `Rgbpp asset has been transferred on BTC and the related CKB tx hash is ${txHash}`,
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

interface RgbppTransferCombinedParams {
  toBtcAddress: string;
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
 * Combines the steps of getting the RGBPP lock arguments list and transferring RGBPP assets.
 *
 * @param toBtcAddress - The Bitcoin address to which the assets will be transferred.
 * @param xudtTypeArgs - The type arguments for the XUDT script.
 * @param transferAmount - The amount of assets to transfer, represented as a bigint.
 * @param collector - The collector instance used for collecting assets.
 * @param btcDataSource - The data source for Bitcoin transactions.
 * @param btcTestnetType - (Optional) The type of Bitcoin testnet to use.
 * @param isMainnet - A boolean indicating whether the operation is on the mainnet.
 * @param fromBtcAccount - The Bitcoin account from which the assets will be transferred.
 * @param fromBtcAccountPubkey - (Optional) The public key of the Bitcoin account.
 * @param unisat - The Unisat wallet instance used for signing and sending transactions.
 * @param btcService - The service instance for interacting with Bitcoin assets.
 * @param btcFeeRate - (Optional) The fee rate to use for the Bitcoin transaction.
 * @returns A promise that resolves to the transaction result.
 */
export const transferCombined = async ({
  toBtcAddress,
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
}: RgbppTransferCombinedParams, btcFeeRate?: number): Promise<TxResult> => {
  const lockArgsListResponse = await getRgbppLockArgsList({
    xudtTypeArgs,
    fromBtcAccount,
    isMainnet,
    btcService,
  });

  const res = await transfer({
    rgbppLockArgsList: lockArgsListResponse.rgbppLockArgsList,
    toBtcAddress,
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
