import { DataSource } from "@rgbpp-sdk/btc";
import { BTCTestnetType, Collector, RgbppBtcAddressReceiver } from "@rgbpp-sdk/ckb";
import { BtcAssetsApi } from "rgbpp";
import { AbstractWallet, TxResult } from "../helper";
interface RgbppLockArgsListParams {
    xudtTypeArgs: string;
    fromBtcAccount: string;
    isMainnet: boolean;
    btcService: BtcAssetsApi;
}
interface RgbppLockArgsListResponse {
    rgbppLockArgsList: string[];
}
export declare const getRgbppLockArgsList: ({ xudtTypeArgs, fromBtcAccount, isMainnet, btcService, }: RgbppLockArgsListParams) => Promise<RgbppLockArgsListResponse>;
interface RgbppDistributeCombinedParams {
    receivers: RgbppBtcAddressReceiver[];
    xudtTypeArgs: string;
    collector: Collector;
    btcDataSource: DataSource;
    btcTestnetType?: BTCTestnetType;
    isMainnet: boolean;
    fromBtcAccount: string;
    fromBtcAccountPubkey?: string;
    unisat: AbstractWallet;
    filterRgbppArgslist: (argsList: string[]) => Promise<string[]>;
    btcService: BtcAssetsApi;
}
/**
 * Distributes RGBPP assets to multiple receivers.
 *
 * @param {RgbppDistributeCombinedParams} params - The parameters for the distribution.
 * @param {string} params.xudtTypeArgs - The type arguments for the XUDT type script.
 * @param {RgbppBtcAddressReceiver[]} params.receivers - The list of receivers for the RGBPP assets.
 * @param {Collector} params.collector - The collector instance used for generating the CKB virtual transaction.
 * @param {DataSource} params.btcDataSource - The data source for BTC transactions.
 * @param {BTCTestnetType} [params.btcTestnetType] - The type of BTC testnet (optional).
 * @param {boolean} params.isMainnet - Indicates whether the operation is on the mainnet.
 * @param {string} params.fromBtcAccount - The BTC account from which the assets are being distributed.
 * @param {string} [params.fromBtcAccountPubkey] - The public key of the BTC account (optional).
 * @param {AbstractWallet} params.unisat - The Unisat wallet instance used for signing and sending PSBT.
 * @param {(argsList: string[]) => Promise<string[]>} params.filterRgbppArgslist - A function to filter the RGBPP args list.
 * @param {BtcAssetsApi} params.btcService - The BTC assets API service.
 * @param {number} [btcFeeRate] - The fee rate for the BTC transaction (optional).
 * @returns {Promise<TxResult>} - The result of the transaction.
 */
export declare const distributeCombined: ({ xudtTypeArgs, receivers, collector, btcDataSource, btcTestnetType, isMainnet, fromBtcAccount, fromBtcAccountPubkey, unisat, filterRgbppArgslist, btcService, }: RgbppDistributeCombinedParams, btcFeeRate?: number) => Promise<TxResult>;
export {};
