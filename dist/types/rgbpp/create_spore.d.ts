import * as ccc from "@ckb-ccc/core";
import { BTCTestnetType, Collector, Hex, RawSporeData } from "@rgbpp-sdk/ckb";
import { BtcAssetsApi, DataSource } from "rgbpp";
import { AbstractWallet, TxResult } from "../helper";
import { bitcoin } from "@rgbpp-sdk/btc";
/**
 * Parameters for creating spores combined with the given parameters.
 */
export interface SporeCreateCombinedParams {
    /**
     * The arguments for the cluster type script.
     */
    clusterTypeScriptArgs: string;
    /**
     * The list of receivers with their BTC addresses and spore data.
     */
    receivers: {
        /**
         * The BTC address of the receiver.
         */
        toBtcAddress: string;
        /**
         * The raw spore data.
         */
        sporeData: RawSporeData;
    }[];
    /**
     * The collector instance.
     */
    collector: Collector;
    /**
     * Indicates if the operation is on mainnet.
     */
    isMainnet: boolean;
    /**
     * The type of BTC testnet (optional).
     */
    btcTestnetType?: BTCTestnetType;
    /**
     * The BTC account from which the spores are being created.
     */
    fromBtcAccount: string;
    /**
     * The public key of the BTC account.
     */
    fromBtcAccountPubkey: string;
    /**
     * The data source for BTC.
     */
    btcDataSource: DataSource;
    /**
     * Wallet instance used for signing BTC transactions.
     */
    wallet: AbstractWallet;
    /**
     * The CKB address.
     */
    ckbAddress: string;
    /**
     * The BTC assets API service.
     */
    btcService: BtcAssetsApi;
    /**
     * The CCC signer instance.
     */
    cccSigner: ccc.Signer;
}
/**
 * Creates spores combined with the given parameters.
 *
 * @param {SporeCreateCombinedParams} params - The parameters for creating spores.
 * @param {string} params.clusterTypeScriptArgs - The arguments for the cluster type script.
 * @param {Array<{ toBtcAddress: string, sporeData: RawSporeData }>} params.receivers - The list of receivers with their BTC addresses and spore data.
 * @param {Collector} params.collector - The collector instance.
 * @param {boolean} params.isMainnet - Indicates if the operation is on mainnet.
 * @param {BTCTestnetType} [params.btcTestnetType] - The type of BTC testnet (optional).
 * @param {string} params.fromBtcAccount - The BTC account from which the spores are being created.
 * @param {string} [params.fromBtcAccountPubkey] - The public key of the BTC account.
 * @param {DataSource} params.btcDataSource - The data source for BTC.
 * @param {AbstractWallet} params.wallet - Wallet instance used for signing BTC transactions.
 * @param {string} params.ckbAddress - The CKB address.
 * @param {BtcAssetsApi} params.btcService - The BTC assets API service.
 * @param {ccc.Signer} params.cccSigner - The CCC signer instance.
 * @param {number} [btcFeeRate=120] - The fee rate for BTC transactions (default is 120).
 * @returns {Promise<TxResult>} - The result of the transaction.
 */
export declare const createSporesCombined: ({ clusterTypeScriptArgs, receivers, collector, isMainnet, btcTestnetType, fromBtcAccount, fromBtcAccountPubkey, btcDataSource, wallet, btcService, ckbAddress, cccSigner, }: SporeCreateCombinedParams, btcFeeRate?: number, ckbFeeRate?: bigint) => Promise<TxResult>;
/**
 * Parameters for preparing an unsigned CKB transaction for creating spores.
 */
export interface PrepareCreateSporeUnsignedTransactionParams {
    /**
     * The arguments for the cluster RGBPP lock.
     * Note: This should be generated using the `fetchAndValidateAssets` function.
     * Example:
     * ```typescript
     * const clusterRgbppLockArgs = await fetchAndValidateAssets(
     *   fromBtcAccount,
     *   clusterTypeScriptArgs,
     *   isMainnet,
     *   btcService,
     * );
     * ```
     */
    clusterRgbppLockArgs: Hex;
    /**
     * The list of receivers with their BTC addresses and spore data.
     */
    receivers: {
        /**
         * The BTC address of the receiver.
         */
        toBtcAddress: string;
        /**
         * The raw spore data.
         */
        sporeData: RawSporeData;
    }[];
    /**
     * The collector instance.
     */
    collector: Collector;
    /**
     * Indicates if the operation is on mainnet.
     */
    isMainnet: boolean;
    /**
     * The type of BTC testnet (optional).
     */
    btcTestnetType?: BTCTestnetType;
    /**
     * The CKB address.
     */
    ckbAddress: string;
    /**
     * The fee rate for CKB transactions (optional).
     */
    ckbFeeRate?: bigint;
}
/**
 * Prepares an unsigned CKB transaction for creating spores.
 *
 * @param {PrepareCreateSporeUnsignedTransactionParams} params - The parameters for preparing the unsigned CKB transaction.
 * @param {Hex} params.clusterRgbppLockArgs - The arguments for the cluster RGBPP lock.
 * @param {Array<{ toBtcAddress: string, sporeData: RawSporeData }>} params.receivers - The list of receivers with their BTC addresses and spore data.
 * @param {Collector} params.collector - The collector instance.
 * @param {boolean} params.isMainnet - Indicates if the operation is on mainnet.
 * @param {BTCTestnetType} [params.btcTestnetType] - The type of BTC testnet (optional).
 * @param {string} params.ckbAddress - The CKB address.
 * @param {bigint} [params.ckbFeeRate] - The fee rate for CKB transactions (optional).
 * @param {number} [params.witnessLockPlaceholderSize] - The size of the witness lock placeholder (optional). This parameter is used to estimate the transaction size when the witness lock placeholder size is known.
 * @returns {Promise<CKBComponents.RawTransactionToSign>} - The unsigned CKB transaction.
 * --------------------------------------------------------------------------------
 * Note: This example demonstrates how to fetch the corresponding parameters using the `fetchAndValidateAssets` function.
 * Example:
 * ```typescript
 * const clusterRgbppLockArgs = await fetchAndValidateAssets(
 *   fromBtcAccount,
 *   clusterTypeScriptArgs,
 *   isMainnet,
 *   btcService,
 * );
 * ```
 */
export declare const prepareCreateSporeUnsignedTransaction: ({ clusterRgbppLockArgs, receivers, collector, isMainnet, btcTestnetType, ckbAddress, ckbFeeRate, }: PrepareCreateSporeUnsignedTransactionParams) => Promise<CKBComponents.RawTransactionToSign>;
/**
 * Parameters for preparing an unsigned BTC transaction for creating spores.
 */
export interface PrepareCreateSporeUnsignedPsbtParams {
    /**
     * The arguments for the cluster RGBPP lock.
     * Note: This should be generated using the `fetchAndValidateAssets` function.
     * Example:
     * ```typescript
     * const clusterRgbppLockArgs = await fetchAndValidateAssets(
     *   fromBtcAccount,
     *   clusterTypeScriptArgs,
     *   isMainnet,
     *   btcService,
     * );
     * ```
     */
    clusterRgbppLockArgs: Hex;
    /**
     * The list of receivers with their BTC addresses and spore data.
     */
    receivers: {
        /**
         * The BTC address of the receiver.
         */
        toBtcAddress: string;
        /**
         * The raw spore data.
         */
        sporeData: RawSporeData;
    }[];
    /**
     * The collector instance.
     */
    collector: Collector;
    /**
     * Indicates if the operation is on mainnet.
     */
    isMainnet: boolean;
    /**
     * The type of BTC testnet (optional).
     */
    btcTestnetType?: BTCTestnetType;
    /**
     * The BTC account from which the spores are being created.
     */
    fromBtcAccount: string;
    /**
     * The public key of the BTC account.
     */
    fromBtcAccountPubkey: string;
    /**
     * The data source for BTC.
     */
    btcDataSource: DataSource;
    /**
     * The fee rate for BTC transactions (optional).
     */
    btcFeeRate?: number;
}
/**
 * Prepares an unsigned BTC transaction for creating spores.
 *
 * @param {PrepareCreateSporeUnsignedPsbtParams} params - The parameters for preparing the unsigned BTC transaction.
 * @param {Hex} params.clusterRgbppLockArgs - The arguments for the cluster RGBPP lock.
 * @param {Array<{ toBtcAddress: string, sporeData: RawSporeData }>} params.receivers - The list of receivers with their BTC addresses and spore data.
 * @param {Collector} params.collector - The collector instance.
 * @param {boolean} params.isMainnet - Indicates if the operation is on mainnet.
 * @param {BTCTestnetType} [params.btcTestnetType] - The type of BTC testnet (optional).
 * @param {string} params.fromBtcAccount - The BTC account from which the spores are being created.
 * @param {string} [params.fromBtcAccountPubkey] - The public key of the BTC account.
 * @param {DataSource} params.btcDataSource - The data source for BTC.
 * @param {number} [params.btcFeeRate] - The fee rate for BTC transactions (optional).
 * @returns {Promise<bitcoin.Psbt>} - The unsigned BTC transaction in PSBT format.
 *
 * --------------------------------------------------------------------------------
 * Note: This example demonstrates how to fetch the corresponding parameters using the `fetchAndValidateAssets` function.
 * Example:
 * ```typescript
 * const clusterRgbppLockArgs = await fetchAndValidateAssets(
 *   fromBtcAccount,
 *   clusterTypeScriptArgs,
 *   isMainnet,
 *   btcService,
 * );
 * ```
 */
export declare const prepareCreateSporeUnsignedPsbt: ({ clusterRgbppLockArgs, receivers, collector, isMainnet, btcTestnetType, fromBtcAccount, fromBtcAccountPubkey, btcDataSource, btcFeeRate, }: PrepareCreateSporeUnsignedPsbtParams) => Promise<bitcoin.Psbt>;
/**
 * Fetches RGBPP assets for a given BTC address and type script args, and validates the result.
 *
 * @param {string} fromBtcAccount - The BTC account from which the assets are being fetched.
 * @param {string} clusterTypeScriptArgs - The arguments for the cluster type script.
 * @param {boolean} isMainnet - Indicates if the operation is on mainnet.
 * @param {BtcAssetsApi} btcService - The BTC assets API service.
 * @returns {Promise<string>} - The cluster RGBPP lock args.
 * @throws {Error} - Throws an error if no assets are found for the given BTC address and type script args.
 */
export declare const fetchAndValidateAssets: (fromBtcAccount: string, clusterTypeScriptArgs: string, isMainnet: boolean, btcService: BtcAssetsApi) => Promise<string>;
//# sourceMappingURL=create_spore.d.ts.map