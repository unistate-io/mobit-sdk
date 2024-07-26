import { BTCTestnetType, Collector, Hex } from "@rgbpp-sdk/ckb";
import { BtcAssetsApi, DataSource } from "rgbpp";
import { AbstractWallet } from "../helper";
interface SporeTransferCombinedParams {
  toBtcAddress: string;
  sporeTypeArgs: Hex;
  collector: Collector;
  isMainnet: boolean;
  btcTestnetType?: BTCTestnetType;
  fromBtcAddress: string;
  fromBtcAddressPubkey?: string;
  btcDataSource: DataSource;
  unisat: AbstractWallet;
  btcService: BtcAssetsApi;
}
/**
 * Transfers a spore to a specified BTC address.
 *
 * @param {SporeTransferCombinedParams} params - The parameters for the spore transfer.
 * @param {string} params.toBtcAddress - The recipient's BTC address.
 * @param {Hex} params.sporeTypeArgs - The type arguments for the spore.
 * @param {Collector} params.collector - The collector object.
 * @param {boolean} params.isMainnet - Indicates if the operation is on the mainnet.
 * @param {BTCTestnetType} [params.btcTestnetType] - The type of BTC testnet (optional).
 * @param {string} params.fromBtcAddress - The sender's BTC address.
 * @param {string} [params.fromBtcAddressPubkey] - The sender's BTC address public key (optional).
 * @param {DataSource} params.btcDataSource - The data source for BTC.
 * @param {AbstractWallet} params.unisat - The Unisat wallet object.
 * @param {BtcAssetsApi} params.btcService - The BTC assets API service.
 * @param {number} [btcFeeRate=30] - The fee rate for the BTC transaction (optional, default is 30).
 * @returns {Promise<{ btcTxId: string }>} - The result of the spore transfer, including the BTC transaction ID.
 */
export declare const transferSporeCombined: (
  {
    toBtcAddress,
    sporeTypeArgs,
    collector,
    isMainnet,
    btcTestnetType,
    fromBtcAddress,
    fromBtcAddressPubkey,
    btcDataSource,
    unisat,
    btcService,
  }: SporeTransferCombinedParams,
  btcFeeRate?: number,
) => Promise<
  {
    error: Error;
    btcTxId: string;
  } | {
    btcTxId: string;
    error?: undefined;
  }
>;
export {};
