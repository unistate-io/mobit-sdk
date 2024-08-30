import { BTCTestnetType, Collector, Hex } from "@rgbpp-sdk/ckb";
import { BtcAssetsApi, DataSource } from "rgbpp";
import { AbstractWallet } from "../helper";
import { bitcoin } from "@rgbpp-sdk/btc";
/**
 * Interface for parameters required to transfer a spore combined.
 */
export interface SporeTransferCombinedParams {
    /** The recipient's BTC address. */
    toBtcAddress: string;
    /** Type arguments for the spore. */
    sporeTypeArgs: Hex;
    /** Collector instance used to gather cells for the transaction. */
    collector: Collector;
    /** Indicates whether the operation is on the mainnet. */
    isMainnet: boolean;
    /** Type of BTC testnet (optional). */
    btcTestnetType?: BTCTestnetType;
    /** BTC address from which the spore will be transferred. */
    fromBtcAddress: string;
    /** Public key of the BTC address. */
    fromBtcAddressPubkey: string;
    /** Data source for BTC transactions. */
    btcDataSource: DataSource;
    /** Wallet instance used for signing BTC transactions. */
    wallet: AbstractWallet;
    /** The BTC assets API service. */
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
 * @param {string} [params.fromBtcAddressPubkey] - The sender's BTC address public key.
 * @param {DataSource} params.btcDataSource - The data source for BTC.
 * @param {AbstractWallet} params.wallet - Wallet instance used for signing BTC transactions.
 * @param {BtcAssetsApi} params.btcService - The BTC assets API service.
 * @param {number} [btcFeeRate=30] - The fee rate for the BTC transaction (optional, default is 30).
 * @returns {Promise<{ btcTxId: string }>} - The result of the spore transfer, including the BTC transaction ID.
 */
export declare const transferSporeCombined: ({ toBtcAddress, sporeTypeArgs, collector, isMainnet, btcTestnetType, fromBtcAddress, fromBtcAddressPubkey, btcDataSource, wallet, btcService, }: SporeTransferCombinedParams, btcFeeRate?: number) => Promise<{
    btcTxId: string;
}>;
/**
 * Interface for parameters required to get spore RGBPP lock arguments.
 */
export interface GetSporeRgbppLockArgsParams {
    /** The BTC address from which the spore will be transferred. */
    fromBtcAddress: string;
    /** Type arguments for the spore. */
    sporeTypeArgs: Hex;
    /** Indicates whether the operation is on the mainnet. */
    isMainnet: boolean;
    /** The BTC assets API service. */
    btcService: BtcAssetsApi;
}
/**
 * Retrieves the spore RGBPP lock arguments based on the provided parameters.
 * @param {GetSporeRgbppLockArgsParams} params - The parameters for retrieving the spore RGBPP lock arguments.
 * @param {string} params.fromBtcAddress - The BTC address from which the spore will be transferred.
 * @param {Hex} params.sporeTypeArgs - Type arguments for the spore.
 * @param {boolean} params.isMainnet - Indicates whether the operation is on the mainnet.
 * @param {BtcAssetsApi} params.btcService - The BTC assets API service.
 * @returns {Promise<Hex>} - A promise that resolves to the spore RGBPP lock arguments.
 */
export declare const getSporeRgbppLockArgs: ({ fromBtcAddress, sporeTypeArgs, isMainnet, btcService, }: GetSporeRgbppLockArgsParams) => Promise<Hex>;
/**
 * Interface for parameters required to prepare an unsigned PSBT for transferring a spore.
 */
export interface PrepareTransferSporeUnsignedPsbtParams {
    /** The recipient's BTC address. */
    toBtcAddress: string;
    /** Type arguments for the spore. */
    sporeTypeArgs: Hex;
    /** Collector instance used to gather cells for the transaction. */
    collector: Collector;
    /** Indicates whether the operation is on the mainnet. */
    isMainnet: boolean;
    /** Type of BTC testnet (optional). */
    btcTestnetType?: BTCTestnetType;
    /** BTC address from which the spore will be transferred. */
    fromBtcAddress: string;
    /** Public key of the BTC address. */
    fromBtcAddressPubkey: string;
    /** The BTC assets API service. */
    btcService: BtcAssetsApi;
    /** Data source for BTC transactions. */
    btcDataSource: DataSource;
    /** Fee rate for the BTC transaction (optional, default is 30). */
    btcFeeRate?: number;
}
/**
 * Prepares an unsigned PSBT (Partially Signed Bitcoin Transaction) for transferring a spore.
 * This function is used to estimate transaction fees before finalizing the transaction.
 *
 * @param {PrepareTransferSporeUnsignedPsbtParams} params - Parameters required to generate the unsigned PSBT.
 * @param {string} params.toBtcAddress - The recipient's BTC address.
 * @param {Hex} params.sporeTypeArgs - Type arguments for the spore.
 * @param {Collector} params.collector - Collector instance used to gather cells for the transaction.
 * @param {boolean} params.isMainnet - Indicates whether the operation is on the mainnet.
 * @param {BTCTestnetType} [params.btcTestnetType] - Type of BTC testnet (optional).
 * @param {string} params.fromBtcAddress - BTC address from which the spore will be transferred.
 * @param {string} [params.fromBtcAddressPubkey] - Public key of the BTC address.
 * @param {DataSource} params.btcDataSource - Data source for BTC transactions.
 * @param {number} [params.btcFeeRate] - Fee rate for the BTC transaction (optional, default is 30).
 * @param {BtcAssetsApi} params.btcService - The BTC assets API service.
 * @returns {Promise<bitcoin.Psbt>} - Promise that resolves to the unsigned PSBT.
 */
export declare const prepareTransferSporeUnsignedPsbt: ({ toBtcAddress, sporeTypeArgs, collector, isMainnet, btcTestnetType, fromBtcAddress, fromBtcAddressPubkey, btcDataSource, btcService, btcFeeRate, }: PrepareTransferSporeUnsignedPsbtParams) => Promise<bitcoin.Psbt>;
//# sourceMappingURL=transfer_spore.d.ts.map