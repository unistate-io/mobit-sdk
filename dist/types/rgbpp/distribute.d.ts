import { bitcoin, DataSource } from "@rgbpp-sdk/btc";
import { BTCTestnetType, Collector, RgbppBtcAddressReceiver } from "@rgbpp-sdk/ckb";
import { BtcAssetsApi } from "rgbpp";
import { AbstractWallet, TxResult } from "../helper";
interface RgbppLockArgsListParams {
    xudtType: CKBComponents.Script;
    fromBtcAccount: string;
    isMainnet: boolean;
    btcService: BtcAssetsApi;
}
interface RgbppLockArgsListResponse {
    rgbppLockArgsList: string[];
}
export declare const getRgbppLockArgsList: ({ xudtType, fromBtcAccount, isMainnet, btcService, }: RgbppLockArgsListParams) => Promise<RgbppLockArgsListResponse>;
/**
 * Interface for parameters required to distribute RGBPP assets combined.
 */
export interface RgbppDistributeCombinedParams {
    /**
     * List of receivers for the RGBPP assets.
     */
    receivers: RgbppBtcAddressReceiver[];
    /**
     * Type script for the XUDT type.
     */
    xudtType: CKBComponents.Script;
    /**
     * Collector instance used to gather cells for the transaction.
     */
    collector: Collector;
    /**
     * Data source for BTC transactions.
     */
    btcDataSource: DataSource;
    /**
     * Type of BTC testnet (optional).
     */
    btcTestnetType?: BTCTestnetType;
    /**
     * Indicates whether the operation is on the mainnet.
     */
    isMainnet: boolean;
    /**
     * BTC account from which the assets will be distributed.
     */
    fromBtcAccount: string;
    /**
     * Public key of the BTC account.
     */
    fromBtcAccountPubkey: string;
    /**
     * Wallet instance used for signing BTC transactions.
     */
    wallet: AbstractWallet;
    /**
     * Function to filter the RGBPP args list.
     */
    filterRgbppArgslist: (argsList: string[]) => Promise<string[]>;
    /**
     * BTC assets API service.
     */
    btcService: BtcAssetsApi;
}
/**
 * Distributes RGBPP assets to multiple receivers.
 *
 * @param {RgbppDistributeCombinedParams} params - The parameters for the distribution.
 * @param {RgbppBtcAddressReceiver[]} params.receivers - The list of receivers for the RGBPP assets.
 * @param {CKBComponents.Script} params.xudtType - The type script for the XUDT type.
 * @param {Collector} params.collector - The collector instance used for generating the CKB virtual transaction.
 * @param {DataSource} params.btcDataSource - The data source for BTC transactions.
 * @param {BTCTestnetType} [params.btcTestnetType] - The type of BTC testnet (optional).
 * @param {boolean} params.isMainnet - Indicates whether the operation is on the mainnet.
 * @param {string} params.fromBtcAccount - The BTC account from which the assets are being distributed.
 * @param {string} [params.fromBtcAccountPubkey] - The public key of the BTC account.
 * @param {AbstractWallet} params.wallet - Wallet instance used for signing BTC transactions.
 * @param {(argsList: string[]) => Promise<string[]>} params.filterRgbppArgslist - A function to filter the RGBPP args list.
 * @param {BtcAssetsApi} params.btcService - The BTC assets API service.
 * @param {number} [btcFeeRate] - The fee rate for the BTC transaction (optional).
 * @returns {Promise<TxResult>} - The result of the transaction.
 */
export declare const distributeCombined: ({ xudtType, receivers, collector, btcDataSource, btcTestnetType, isMainnet, fromBtcAccount, fromBtcAccountPubkey, wallet, filterRgbppArgslist, btcService, }: RgbppDistributeCombinedParams, btcFeeRate?: number) => Promise<TxResult>;
/**
 * Interface for parameters required to prepare an unsigned PSBT for distributing RGBPP assets.
 */
export interface PrepareDistributeUnsignedPsbtParams {
    /**
     * List of receivers for the RGBPP assets.
     */
    receivers: RgbppBtcAddressReceiver[];
    /**
     * Type script for the XUDT type.
     */
    xudtType: CKBComponents.Script;
    /**
     * Collector instance used to gather cells for the transaction.
     */
    collector: Collector;
    /**
     * Data source for BTC transactions.
     */
    btcDataSource: DataSource;
    /**
     * Type of BTC testnet (optional).
     */
    btcTestnetType?: BTCTestnetType;
    /**
     * Indicates whether the operation is on the mainnet.
     */
    isMainnet: boolean;
    /**
     * BTC account from which the assets will be distributed.
     */
    fromBtcAccount: string;
    /**
     * Public key of the BTC account.
     */
    fromBtcAccountPubkey: string;
    /**
     * Fee rate for the BTC transaction (optional, default is 30).
     */
    btcFeeRate?: number;
    /**
     * BTC assets API service.
     */
    btcService: BtcAssetsApi;
    /**
     * Function to filter the RGBPP args list.
     */
    filterRgbppArgslist: (argsList: string[]) => Promise<string[]>;
}
/**
 * Prepares an unsigned PSBT (Partially Signed Bitcoin Transaction) for distributing RGBPP assets.
 * This function is used to estimate transaction fees before finalizing the transaction.
 *
 * @param {PrepareDistributeUnsignedPsbtParams} params - Parameters required to generate the unsigned PSBT.
 * @param {RgbppBtcAddressReceiver[]} params.receivers - List of receivers for the RGBPP assets.
 * @param {CKBComponents.Script} params.xudtType - Type script for the XUDT type.
 * @param {Collector} params.collector - Collector instance used to gather cells for the transaction.
 * @param {DataSource} params.btcDataSource - Data source for BTC transactions.
 * @param {BTCTestnetType} [params.btcTestnetType] - Type of BTC testnet (optional).
 * @param {boolean} params.isMainnet - Indicates whether the operation is on the mainnet.
 * @param {string} params.fromBtcAccount - BTC account from which the assets will be distributed.
 * @param {string} [params.fromBtcAccountPubkey] - Public key of the BTC account.
 * @param {number} [params.btcFeeRate] - Fee rate for the BTC transaction (optional, default is 30).
 * @param {BtcAssetsApi} params.btcService - The BTC assets API service.
 * @param {(argsList: string[]) => Promise<string[]>} params.filterRgbppArgslist - A function to filter the RGBPP args list.
 * @returns {Promise<bitcoin.Psbt>} - Promise that resolves to the unsigned PSBT.
 */
export declare const prepareDistributeUnsignedPsbt: ({ receivers, xudtType, collector, btcDataSource, btcTestnetType, isMainnet, fromBtcAccount, fromBtcAccountPubkey, btcFeeRate, btcService, filterRgbppArgslist, }: PrepareDistributeUnsignedPsbtParams) => Promise<bitcoin.Psbt>;
export {};
//# sourceMappingURL=distribute.d.ts.map