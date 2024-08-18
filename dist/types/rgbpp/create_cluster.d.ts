import * as ccc from "@ckb-ccc/core";
import { BTCTestnetType, Collector, RawClusterData } from "@rgbpp-sdk/ckb";
import { BtcApiUtxo } from "@rgbpp-sdk/service";
import { BtcAssetsApi, DataSource } from "rgbpp";
import { AbstractWallet, TxResult } from "../helper";
import { bitcoin } from "@rgbpp-sdk/btc";
/**
 * Parameters required to create a combined cluster.
 */
export interface createClusterCombinedParams {
    /**
     * CKB address where the cluster cell will be created.
     */
    ckbAddress: string;
    /**
     * Raw data required to create the cluster.
     */
    clusterData: RawClusterData;
    /**
     * Collector instance used to gather cells for the transaction.
     */
    collector: Collector;
    /**
     * Indicates whether the operation is on the mainnet.
     */
    isMainnet: boolean;
    /**
     * Type of BTC testnet (optional).
     */
    btcTestnetType?: BTCTestnetType;
    /**
     * BTC account from which the transaction will be initiated.
     */
    fromBtcAccount: string;
    /**
     * Public key of the BTC account (optional).
     */
    fromBtcAccountPubkey?: string;
    /**
     * Data source for BTC transactions.
     */
    btcDataSource: DataSource;
    /**
     * Wallet instance used for signing BTC transactions.
     */
    wallet: AbstractWallet;
    /**
     * BTC service instance for interacting with BTC assets.
     */
    btcService: BtcAssetsApi;
    /**
     * Function to filter UTXOs for the BTC transaction.
     */
    filterUtxo: (utxos: BtcApiUtxo[]) => Promise<{
        outIndex: number;
        btcTxId: string;
    }>;
    /**
     * Signer instance for signing CKB transactions.
     */
    cccSigner: ccc.Signer;
}
/**
 * Creates a cluster cell on the CKB network and initiates a corresponding BTC transaction.
 *
 * @param {createClusterCombinedParams} params - Parameters required to create the cluster.
 * @param {string} params.ckbAddress - CKB address where the cluster cell will be created.
 * @param {RawClusterData} params.clusterData - Raw data required to create the cluster.
 * @param {Collector} params.collector - Collector instance used to gather cells for the transaction.
 * @param {boolean} params.isMainnet - Indicates whether the operation is on the mainnet.
 * @param {BTCTestnetType} [params.btcTestnetType] - Type of BTC testnet (optional).
 * @param {string} params.fromBtcAccount - BTC account from which the transaction will be initiated.
 * @param {string} [params.fromBtcAccountPubkey] - Public key of the BTC account (optional).
 * @param {DataSource} params.btcDataSource - Data source for BTC transactions.
 * @param {AbstractWallet} params.wallet - Wallet instance used for signing BTC transactions.
 * @param {BtcAssetsApi} params.btcService - BTC service instance for interacting with BTC assets.
 * @param {(utxos: BtcApiUtxo[]) => Promise<{ outIndex: number; btcTxId: string }>} params.filterUtxo - Function to filter UTXOs for the BTC transaction.
 * @param {ccc.Signer} params.cccSigner - Signer instance for signing CKB transactions.
 * @param {bigint} [ckbFeeRate] - Fee rate for the CKB transaction (optional).
 * @param {bigint} [maxFee=MAX_FEE] - Maximum fee for the CKB transaction (default is MAX_FEE).
 * @param {number} [btcFeeRate=30] - Fee rate for the BTC transaction (default is 30).
 * @returns {Promise<TxResult>} - Promise that resolves to the transaction result.
 */
export declare const createClusterCombined: ({ ckbAddress, clusterData, collector, isMainnet, btcTestnetType, fromBtcAccount, fromBtcAccountPubkey, btcDataSource, wallet, btcService, filterUtxo, cccSigner, }: createClusterCombinedParams, ckbFeeRate?: bigint, maxFee?: bigint, btcFeeRate?: number, witnessLockPlaceholderSize?: number) => Promise<TxResult>;
/**
 * Parameters required to prepare a cluster cell transaction.
 */
export interface PrepareClusterCellTransactionParams {
    /**
     * CKB address where the cluster cell will be created.
     */
    ckbAddress: string;
    /**
     * Raw data required to create the cluster.
     */
    clusterData: RawClusterData;
    /**
     * Collector instance used to gather cells for the transaction.
     */
    collector: Collector;
    /**
     * Indicates whether the operation is on the mainnet.
     */
    isMainnet: boolean;
    /**
     * Type of BTC testnet (optional).
     */
    btcTestnetType?: BTCTestnetType;
    /**
     * Output index of the BTC transaction.
     */
    outIndex: number;
    /**
     * ID of the BTC transaction.
     */
    btcTxId: string;
}
/**
 * Prepares a cluster cell on the CKB network by creating a transaction.
 *
 * @param {PrepareClusterCellTransactionParams} params - Parameters required to prepare the cluster cell.
 * @param {string} params.ckbAddress - CKB address where the cluster cell will be created.
 * @param {RawClusterData} params.clusterData - Raw data required to create the cluster.
 * @param {Collector} params.collector - Collector instance used to gather cells for the transaction.
 * @param {boolean} params.isMainnet - Indicates whether the operation is on the mainnet.
 * @param {BTCTestnetType} [params.btcTestnetType] - Type of BTC testnet (optional).
 * @param {number} params.outIndex - Output index of the BTC transaction.
 * @param {string} params.btcTxId - ID of the BTC transaction.
 * @param {bigint} [maxFee=MAX_FEE] - Maximum fee for the CKB transaction (default is MAX_FEE).
 * @param {bigint} [ckbFeeRate] - Fee rate for the CKB transaction (optional).
 * @param {number} [witnessLockPlaceholderSize] - Size of the witness lock placeholder (optional).
 * @returns {Promise<CKBComponents.RawTransactionToSign>} - Promise that resolves to the prepared CKB transaction.
 * --------------------------------------------
 * **Note: Example of fetching and filtering UTXOs:**
 * ```typescript
 * const { outIndex, btcTxId } = await fetchAndFilterUtxos(
 *   btcAccount,
 *   filterUtxo,
 *   btcService,
 * );
 * ```
 * This example demonstrates how to obtain the necessary parameters (`outIndex` and `btcTxId`) by fetching and filtering UTXOs.
 */
export declare const prepareClusterCellTransaction: ({ ckbAddress, clusterData, collector, isMainnet, btcTestnetType, outIndex, btcTxId, }: PrepareClusterCellTransactionParams, maxFee?: bigint, ckbFeeRate?: bigint, witnessLockPlaceholderSize?: number) => Promise<CKBComponents.RawTransactionToSign>;
/**
 * Parameters required to generate an unsigned PSBT (Partially Signed Bitcoin Transaction) for creating a cluster.
 * This interface is used to estimate transaction fees before finalizing the transaction.
 */
export interface PrepareCreateClusterUnsignedPsbtParams {
    /**
     * Collector instance used to gather cells for the transaction.
     */
    collector: Collector;
    /**
     * Raw data required to create the cluster.
     */
    clusterData: RawClusterData;
    /**
     * Indicates whether the operation is on the mainnet.
     */
    isMainnet: boolean;
    /**
     * Type of BTC testnet (optional).
     */
    btcTestnetType?: BTCTestnetType;
    /**
     * BTC account from which the transaction will be initiated.
     */
    fromBtcAccount: string;
    /**
     * Public key of the BTC account (optional).
     */
    fromBtcAccountPubkey?: string;
    /**
     * Data source for BTC transactions.
     */
    btcDataSource: DataSource;
    /**
     * Output index of the BTC transaction.
     */
    outIndex: number;
    /**
     * ID of the BTC transaction.
     */
    btcTxId: string;
    /**
     * Fee rate for the BTC transaction (optional, default is 30).
     */
    btcFeeRate?: number;
}
/**
 * Generates an unsigned PSBT (Partially Signed Bitcoin Transaction) for creating a cluster.
 * This function is used to estimate transaction fees before finalizing the transaction.
 *
 * @param {PrepareCreateClusterUnsignedPsbtParams} params - Parameters required to generate the unsigned PSBT.
 * @param {Collector} params.collector - Collector instance used to gather cells for the transaction.
 * @param {RawClusterData} params.clusterData - Raw data required to create the cluster.
 * @param {boolean} params.isMainnet - Indicates whether the operation is on the mainnet.
 * @param {BTCTestnetType} [params.btcTestnetType] - Type of BTC testnet (optional).
 * @param {string} params.fromBtcAccount - BTC account from which the transaction will be initiated.
 * @param {string} [params.fromBtcAccountPubkey] - Public key of the BTC account (optional).
 * @param {DataSource} params.btcDataSource - Data source for BTC transactions.
 * @param {number} params.outIndex - Output index of the BTC transaction.
 * @param {string} params.btcTxId - ID of the BTC transaction.
 * @param {number} [params.btcFeeRate] - Fee rate for the BTC transaction (optional, default is 30).
 * @returns {Promise<bitcoin.Psbt>} - Promise that resolves to the unsigned PSBT in base64 format.
 * --------------------------------------------
 * **Note: Example of fetching and filtering UTXOs:**
 * ```typescript
 * const { outIndex, btcTxId } = await fetchAndFilterUtxos(
 *   btcAccount,
 *   filterUtxo,
 *   btcService,
 * );
 * ```
 * This example demonstrates how to obtain the necessary parameters (`outIndex` and `btcTxId`) by fetching and filtering UTXOs.
 */
export declare const prepareCreateClusterUnsignedPsbt: ({ collector, clusterData, isMainnet, btcTestnetType, fromBtcAccount, fromBtcAccountPubkey, btcDataSource, outIndex, btcTxId, btcFeeRate, }: PrepareCreateClusterUnsignedPsbtParams) => Promise<bitcoin.Psbt>;
//# sourceMappingURL=create_cluster.d.ts.map