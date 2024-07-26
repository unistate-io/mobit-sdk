import { DataSource } from "@rgbpp-sdk/btc";
import { BTCTestnetType, Collector } from "@rgbpp-sdk/ckb";
import { BtcAssetsApi } from "rgbpp";
import { AbstractWallet, TxResult } from "../helper";
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
export declare const transferCombined: ({
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
}: RgbppTransferCombinedParams, btcFeeRate?: number) => Promise<TxResult>;
export {};
