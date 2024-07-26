import * as ccc from "@ckb-ccc/core";
import { DataSource } from "@rgbpp-sdk/btc";
import { BTCTestnetType, Collector, RgbppTokenInfo } from "@rgbpp-sdk/ckb";
import { BtcApiUtxo } from "@rgbpp-sdk/service";
import { BtcAssetsApi } from "rgbpp";
import { AbstractWallet, TxResult } from "../helper";
interface RgbppLauncerCombinedParams {
  rgbppTokenInfo: RgbppTokenInfo;
  collector: Collector;
  isMainnet: boolean;
  btcTestnetType?: BTCTestnetType;
  btcAccount: string;
  btcAccountPubkey?: string;
  btcDataSource: DataSource;
  launchAmount: bigint;
  btcService: BtcAssetsApi;
  ckbAddress: string;
  cccSigner: ccc.Signer;
  filterUtxo: (utxos: BtcApiUtxo[]) => Promise<{
    outIndex: number;
    btcTxId: string;
  }>;
  unisat: AbstractWallet;
}
/**
 * Launches an RGB++ asset by preparing a launch cell and subsequently sending a BTC transaction.
 *
 * @param params - An object containing the necessary parameters for launching the RGB++ asset.
 * @param params.rgbppTokenInfo - Information about the RGB++ token to be launched.
 * @param params.collector - The collector instance used to gather cells.
 * @param params.isMainnet - A boolean indicating whether the operation is on the mainnet.
 * @param params.btcTestnetType - (Optional) The type of BTC testnet to use.
 * @param params.btcAccount - The BTC account address.
 * @param params.btcAccountPubkey - (Optional) The public key of the BTC account.
 * @param params.btcDataSource - The data source for BTC transactions.
 * @param params.launchAmount - The amount of the asset to be launched, represented as a bigint.
 * @param params.btcService - The service instance for interacting with BTC assets.
 * @param params.ckbAddress - The CKB address where the asset will be launched.
 * @param params.cccSigner - The signer instance for CKB transactions.
 * @param params.filterUtxo - A function to filter UTXOs for the BTC transaction.
 * @param params.unisat - The wallet instance for signing and sending BTC transactions.
 * @param ckbFeeRate - (Optional) The fee rate for CKB transactions, represented as a bigint.
 * @param maxFee - (Optional) The maximum fee for the transaction, represented as a bigint. Defaults to MAX_FEE.
 * @param btcFeeRate - (Optional) The fee rate for BTC transactions, represented as a number.
 *
 * @returns A promise that resolves to the transaction result, including the BTC transaction ID and CKB transaction hash.
 */
export declare const launchCombined: (
  {
    rgbppTokenInfo,
    collector,
    isMainnet,
    btcTestnetType,
    btcAccount,
    btcDataSource,
    btcAccountPubkey,
    launchAmount,
    ckbAddress,
    filterUtxo,
    btcService,
    unisat,
    cccSigner,
  }: RgbppLauncerCombinedParams,
  ckbFeeRate?: bigint,
  maxFee?: bigint,
  btcFeeRate?: number,
) => Promise<TxResult>;
export {};
