import { BTCTestnetType, Collector, Hex } from "@rgbpp-sdk/ckb";
import { BtcAssetsApi, DataSource } from "rgbpp";
import { AbstractWallet, TxResult } from "../helper";
import { bitcoin } from "@rgbpp-sdk/btc";
/**
 * Parameters required for the combined process of leaping a spore from BTC to CKB.
 */
export interface SporeLeapCombinedParams {
    /** The CKB address to which the spore will be sent. */
    toCkbAddress: string;
    /** The type arguments for the spore. */
    sporeTypeArgs: Hex;
    /** The collector object used for collecting the spore. */
    collector: Collector;
    /** Indicates whether the operation is on the mainnet. */
    isMainnet: boolean;
    /** The type of BTC testnet (optional). */
    btcTestnetType?: BTCTestnetType;
    /** The BTC address from which the spore will be sent. */
    fromBtcAddress: string;
    /** The public key of the BTC address (optional). */
    fromBtcAddressPubkey?: string;
    /** The data source for BTC transactions. */
    btcDataSource: DataSource;
    /** Wallet instance used for signing BTC transactions. */
    wallet: AbstractWallet;
    /** The BTC assets API service. */
    btcService: BtcAssetsApi;
}
/**
 * Combines the process of leaping a spore from BTC to CKB with the necessary parameters.
 *
 * @param {SporeLeapCombinedParams} params - The parameters required for the spore leap process.
 * @param {number} [btcFeeRate=30] - The fee rate for the BTC transaction (default is 30).
 *
 * @param {string} params.toCkbAddress - The CKB address to which the spore will be sent.
 * @param {Hex} params.sporeTypeArgs - The type arguments for the spore.
 * @param {Collector} params.collector - The collector object used for collecting the spore.
 * @param {boolean} params.isMainnet - Indicates whether the operation is on the mainnet.
 * @param {BTCTestnetType} [params.btcTestnetType] - The type of BTC testnet (optional).
 * @param {string} params.fromBtcAddress - The BTC address from which the spore will be sent.
 * @param {string} [params.fromBtcAddressPubkey] - The public key of the BTC address (optional).
 * @param {DataSource} params.btcDataSource - The data source for BTC transactions.
 * @param {AbstractWallet} params.wallet - Wallet instance used for signing BTC transactions.
 * @param {BtcAssetsApi} params.btcService - The BTC assets API service.
 *
 * @returns {Promise<TxResult>} - The result of the transaction, including the BTC transaction ID.
 */
export declare const leapSporeFromBtcToCkbCombined: ({ toCkbAddress, sporeTypeArgs, collector, isMainnet, btcTestnetType, fromBtcAddress, fromBtcAddressPubkey, btcDataSource, wallet, btcService, }: SporeLeapCombinedParams, btcFeeRate?: number) => Promise<TxResult>;
/**
 * Parameters required to generate an unsigned PSBT (Partially Signed Bitcoin Transaction) for leaping a spore from Bitcoin to CKB.
 * This interface is used to estimate transaction fees before finalizing the transaction.
 */
export interface PrepareLeapSporeUnsignedPsbtParams {
    /** RGBPP lock arguments for the spore. */
    sporeRgbppLockArgs: Hex;
    /** The destination CKB address. */
    toCkbAddress: string;
    /** Type arguments for the spore. */
    sporeTypeArgs: Hex;
    /** Collector instance used to gather cells for the transaction. */
    collector: Collector;
    /** Indicates whether the operation is on the mainnet. */
    isMainnet: boolean;
    /** Type of BTC testnet (optional). */
    btcTestnetType?: BTCTestnetType;
    /** BTC address from which the spore will be leaped. */
    fromBtcAddress: string;
    /** Public key of the BTC address (optional). */
    fromBtcAddressPubkey?: string;
    /** Data source for BTC transactions. */
    btcDataSource: DataSource;
    /** Fee rate for the BTC transaction (optional, default is 30). */
    btcFeeRate?: number;
}
/**
 * Prepares an unsigned PSBT (Partially Signed Bitcoin Transaction) for leaping a spore from Bitcoin to CKB.
 * This function is used to estimate transaction fees before finalizing the transaction.
 *
 * @param {PrepareLeapSporeUnsignedPsbtParams} params - Parameters required to generate the unsigned PSBT.
 * @param {Hex} params.sporeRgbppLockArgs - RGBPP lock arguments for the spore.
 * @param {string} params.toCkbAddress - The destination CKB address.
 * @param {Hex} params.sporeTypeArgs - Type arguments for the spore.
 * @param {Collector} params.collector - Collector instance used to gather cells for the transaction.
 * @param {boolean} params.isMainnet - Indicates whether the operation is on the mainnet.
 * @param {BTCTestnetType} [params.btcTestnetType] - Type of BTC testnet (optional).
 * @param {string} params.fromBtcAddress - BTC address from which the spore will be leaped.
 * @param {string} [params.fromBtcAddressPubkey] - Public key of the BTC address (optional).
 * @param {DataSource} params.btcDataSource - Data source for BTC transactions.
 * @param {number} [params.btcFeeRate] - Fee rate for the BTC transaction (optional, default is 30).
 * @returns {Promise<bitcoin.Psbt>} - Promise that resolves to the unsigned PSBT.
 */
export declare const prepareLeapSporeUnsignedPsbt: ({ sporeRgbppLockArgs, toCkbAddress, sporeTypeArgs, collector, isMainnet, btcTestnetType, fromBtcAddress, fromBtcAddressPubkey, btcDataSource, btcFeeRate, }: PrepareLeapSporeUnsignedPsbtParams) => Promise<bitcoin.Psbt>;
//# sourceMappingURL=leap_spore.d.ts.map