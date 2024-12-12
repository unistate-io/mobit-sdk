import { bitcoin, DataSource } from "@rgbpp-sdk/btc";
import { BTCTestnetType, Collector } from "@rgbpp-sdk/ckb";
import { BtcAssetsApi } from "rgbpp";
import { AbstractWallet, TxResult } from "../helper";
/**
 * Parameters for combining the steps of getting the RGBPP lock arguments list and transferring RGBPP assets.
 */
export interface RgbppTransferCombinedParams {
    /** The Bitcoin address to which the assets will be transferred. */
    toBtcAddress: string;
    /** The type arguments for the XUDT script. */
    xudtTypeArgs: string;
    /** The amount of assets to transfer, represented as a bigint. */
    transferAmount: bigint;
    /** The collector instance used for collecting assets. */
    collector: Collector;
    /** The data source for Bitcoin transactions. */
    btcDataSource: DataSource;
    /** (Optional) The type of Bitcoin testnet to use. */
    btcTestnetType?: BTCTestnetType;
    /** A boolean indicating whether the operation is on the mainnet. */
    isMainnet: boolean;
    /** The Bitcoin account from which the assets will be transferred. */
    fromBtcAccount: string;
    /** The public key of the Bitcoin account. */
    fromBtcAccountPubkey: string;
    /** Wallet instance used for signing BTC transactions. */
    wallet: AbstractWallet;
    /** The service instance for interacting with Bitcoin assets. */
    btcService: BtcAssetsApi;
}
/**
 * Combines the steps of getting the RGBPP lock arguments list and transferring RGBPP assets.
 *
 * @param {RgbppTransferCombinedParams} params - Parameters for the transfer operation.
 * @param {string} params.toBtcAddress - The Bitcoin address to which the assets will be transferred.
 * @param {string} params.xudtTypeArgs - The type arguments for the XUDT script.
 * @param {bigint} params.transferAmount - The amount of assets to transfer, represented as a bigint.
 * @param {Collector} params.collector - The collector instance used for collecting assets.
 * @param {DataSource} params.btcDataSource - The data source for Bitcoin transactions.
 * @param {BTCTestnetType} [params.btcTestnetType] - (Optional) The type of Bitcoin testnet to use.
 * @param {boolean} params.isMainnet - A boolean indicating whether the operation is on the mainnet.
 * @param {string} params.fromBtcAccount - The Bitcoin account from which the assets will be transferred.
 * @param {string} [params.fromBtcAccountPubkey] - The public key of the Bitcoin account.
 * @param {AbstractWallet} params.wallet - Wallet instance used for signing BTC transactions.
 * @param {BtcAssetsApi} params.btcService - The service instance for interacting with Bitcoin assets.
 * @param {number} [btcFeeRate] - (Optional) The fee rate to use for the Bitcoin transaction.
 * @returns {Promise<TxResult>} A promise that resolves to the transaction result.
 */
export declare const transferCombined: ({ toBtcAddress, xudtTypeArgs, transferAmount, collector, btcDataSource, btcTestnetType, isMainnet, fromBtcAccount, fromBtcAccountPubkey, wallet, btcService, }: RgbppTransferCombinedParams, btcFeeRate?: number) => Promise<TxResult>;
/**
 * Parameters required to generate an unsigned PSBT (Partially Signed Bitcoin Transaction) for transferring RGBPP assets.
 * This interface is used to estimate transaction fees before finalizing the transaction.
 */
export interface PrepareTransferUnsignedPsbtParams {
    /** The recipient's BTC address. */
    toBtcAddress: string;
    /** Type arguments for the XUDT script. */
    xudtTypeArgs: string;
    /** The amount of assets to transfer. */
    transferAmount: bigint;
    /** Collector instance used to gather cells for the transaction. */
    collector: Collector;
    /** Data source for BTC transactions. */
    btcDataSource: DataSource;
    /** Type of BTC testnet (optional). */
    btcTestnetType?: BTCTestnetType;
    /** Indicates whether the operation is on the mainnet. */
    isMainnet: boolean;
    /** BTC account from which the assets will be transferred. */
    fromBtcAccount: string;
    /** Public key of the BTC account. */
    fromBtcAccountPubkey: string;
    /** Fee rate for the BTC transaction (optional, default is 30). */
    btcFeeRate?: number;
    /** The service instance for interacting with Bitcoin assets. */
    btcService: BtcAssetsApi;
}
/**
 * Prepares an unsigned PSBT (Partially Signed Bitcoin Transaction) for transferring RGBPP assets.
 * This function is used to estimate transaction fees before finalizing the transaction.
 *
 * @param {PrepareTransferUnsignedPsbtParams} params - Parameters required to generate the unsigned PSBT.
 * @param {string} params.toBtcAddress - The recipient's BTC address.
 * @param {string} params.xudtTypeArgs - Type arguments for the XUDT script.
 * @param {bigint} params.transferAmount - The amount of assets to transfer.
 * @param {Collector} params.collector - Collector instance used to gather cells for the transaction.
 * @param {DataSource} params.btcDataSource - Data source for BTC transactions.
 * @param {BTCTestnetType} [params.btcTestnetType] - Type of BTC testnet (optional).
 * @param {boolean} params.isMainnet - Indicates whether the operation is on the mainnet.
 * @param {string} params.fromBtcAccount - BTC account from which the assets will be transferred.
 * @param {string} [params.fromBtcAccountPubkey] - Public key of the BTC account.
 * @param {number} [params.btcFeeRate] - Fee rate for the BTC transaction (optional, default is 30).
 * @param {BtcAssetsApi} params.btcService - The service instance for interacting with Bitcoin assets.
 * @returns {Promise<bitcoin.Psbt>} - Promise that resolves to the unsigned PSBT.
 */
export declare const prepareTransferUnsignedPsbt: ({ btcService, toBtcAddress, xudtTypeArgs, transferAmount, collector, btcDataSource, btcTestnetType, isMainnet, fromBtcAccount, fromBtcAccountPubkey, btcFeeRate, }: PrepareTransferUnsignedPsbtParams) => Promise<bitcoin.Psbt>;
//# sourceMappingURL=transfer.d.ts.map