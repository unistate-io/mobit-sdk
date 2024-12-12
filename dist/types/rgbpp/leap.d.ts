import { BTCTestnetType, Collector } from "@rgbpp-sdk/ckb";
import { BtcAssetsApi, DataSource } from "rgbpp";
import { AbstractWallet, TxResult } from "../helper";
import { bitcoin } from "@rgbpp-sdk/btc";
/**
 * Parameters for combining the leap operation of RGBPP assets from Bitcoin to CKB.
 */
export interface RgbppLeapFromBtcToCkbCombinedParams {
    /** The destination CKB address. */
    toCkbAddress: string;
    /** The arguments for the XUDT type script. */
    xudtTypeArgs: string;
    /** The amount of assets to transfer. */
    transferAmount: bigint;
    /** The collector instance for CKB operations. */
    collector: Collector;
    /** The data source for BTC operations. */
    btcDataSource: DataSource;
    /** The type of BTC testnet (optional). */
    btcTestnetType?: BTCTestnetType;
    /** Indicates if the operation is on mainnet. */
    isMainnet: boolean;
    /** The source BTC account. */
    fromBtcAccount: string;
    /** The public key of the source BTC account. */
    fromBtcAccountPubkey: string;
    /** Wallet instance used for signing BTC transactions. */
    wallet: AbstractWallet;
    /** The BTC assets service instance. */
    btcService: BtcAssetsApi;
}
/**
 * Combines the parameters for leaping RGBPP assets from Bitcoin to CKB and executes the leap operation.
 *
 * @param {RgbppLeapFromBtcToCkbCombinedParams} params - The parameters for the leap operation.
 * @param {string} params.toCkbAddress - The destination CKB address.
 * @param {string} params.xudtTypeArgs - The arguments for the XUDT type script.
 * @param {bigint} params.transferAmount - The amount of assets to transfer.
 * @param {Collector} params.collector - The collector instance for CKB operations.
 * @param {DataSource} params.btcDataSource - The data source for BTC operations.
 * @param {BTCTestnetType} [params.btcTestnetType] - The type of BTC testnet (optional).
 * @param {boolean} params.isMainnet - Indicates if the operation is on mainnet.
 * @param {string} params.fromBtcAccount - The source BTC account.
 * @param {string} [params.fromBtcAccountPubkey] - The public key of the source BTC account.
 * @param {AbstractWallet} params.wallet - Wallet instance used for signing BTC transactions.
 * @param {BtcAssetsApi} params.btcService - The BTC assets service instance.
 * @param {number} [btcFeeRate] - The fee rate for the BTC transaction (optional).
 *
 * @returns {Promise<TxResult>} - The result of the transaction.
 */
export declare const leapFromBtcToCkbCombined: ({ toCkbAddress, xudtTypeArgs, transferAmount, collector, btcDataSource, btcTestnetType, isMainnet, fromBtcAccount, fromBtcAccountPubkey, wallet, btcService, }: RgbppLeapFromBtcToCkbCombinedParams, btcFeeRate?: number) => Promise<TxResult>;
/**
 * Parameters for preparing an unsigned PSBT (Partially Signed Bitcoin Transaction) for leaping RGBPP assets from Bitcoin to CKB.
 */
export interface PrepareLeapUnsignedPsbtParams {
    /** The BTC assets service instance. */
    btcService: BtcAssetsApi;
    /** The destination CKB address. */
    toCkbAddress: string;
    /** Type arguments for the XUDT type script. */
    xudtTypeArgs: string;
    /** The amount of assets to transfer. */
    transferAmount: bigint;
    /** Indicates whether the operation is on the mainnet. */
    isMainnet: boolean;
    /** Collector instance used to gather cells for the transaction. */
    collector: Collector;
    /** Type of BTC testnet (optional). */
    btcTestnetType?: BTCTestnetType;
    /** BTC account from which the assets will be leaped. */
    fromBtcAccount: string;
    /** Public key of the BTC account. */
    fromBtcAccountPubkey: string;
    /** Data source for BTC transactions. */
    btcDataSource: DataSource;
    /** Fee rate for the BTC transaction (optional, default is 30). */
    btcFeeRate?: number;
}
/**
 * Prepares an unsigned PSBT (Partially Signed Bitcoin Transaction) for leaping RGBPP assets from Bitcoin to CKB.
 * This function is used to estimate transaction fees before finalizing the transaction.
 *
 * @param {PrepareLeapUnsignedPsbtParams} params - Parameters required to generate the unsigned PSBT.
 * @param {BtcAssetsApi} params.btcService - The BTC assets service instance.
 * @param {string} params.toCkbAddress - The destination CKB address.
 * @param {string} params.xudtTypeArgs - Type arguments for the XUDT type script.
 * @param {bigint} params.transferAmount - The amount of assets to transfer.
 * @param {boolean} params.isMainnet - Indicates whether the operation is on the mainnet.
 * @param {Collector} params.collector - Collector instance used to gather cells for the transaction.
 * @param {BTCTestnetType} [params.btcTestnetType] - Type of BTC testnet (optional).
 * @param {string} params.fromBtcAccount - BTC account from which the assets will be leaped.
 * @param {string} [params.fromBtcAccountPubkey] - Public key of the BTC account.
 * @param {DataSource} params.btcDataSource - Data source for BTC transactions.
 * @param {number} [params.btcFeeRate] - Fee rate for the BTC transaction (optional, default is 30).
 * @returns {Promise<bitcoin.Psbt>} - Promise that resolves to the unsigned PSBT.
 */
export declare const prepareLeapUnsignedPsbt: ({ btcService, toCkbAddress, xudtTypeArgs, transferAmount, isMainnet, collector, btcTestnetType, fromBtcAccount, fromBtcAccountPubkey, btcDataSource, btcFeeRate, }: PrepareLeapUnsignedPsbtParams) => Promise<bitcoin.Psbt>;
//# sourceMappingURL=leap.d.ts.map