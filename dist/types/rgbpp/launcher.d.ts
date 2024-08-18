import * as ccc from "@ckb-ccc/core";
import { bitcoin, DataSource } from "@rgbpp-sdk/btc";
import { BTCTestnetType, Collector, RgbppTokenInfo } from "@rgbpp-sdk/ckb";
import { BtcApiUtxo } from "@rgbpp-sdk/service";
import { BtcAssetsApi } from "rgbpp";
import { AbstractWallet, TxResult } from "../helper";
/**
 * Parameters required for launching an RGB++ asset combined with CKB transaction preparation.
 */
export interface RgbppLauncerCombinedParams {
    /** Information about the RGB++ token to be launched. */
    rgbppTokenInfo: RgbppTokenInfo;
    /** Collector instance used to gather cells for the transaction. */
    collector: Collector;
    /** Indicates whether the operation is on the mainnet. */
    isMainnet: boolean;
    /** (Optional) Type of BTC testnet to use. */
    btcTestnetType?: BTCTestnetType;
    /** BTC account address. */
    btcAccount: string;
    /** (Optional) Public key of the BTC account. */
    btcAccountPubkey?: string;
    /** Data source for BTC transactions. */
    btcDataSource: DataSource;
    /** Amount of the asset to be launched, represented as a bigint. */
    launchAmount: bigint;
    /** Service instance for interacting with BTC assets. */
    btcService: BtcAssetsApi;
    /** CKB address where the asset will be launched. */
    ckbAddress: string;
    /** Signer instance for CKB transactions. */
    cccSigner: ccc.Signer;
    /** Function to filter UTXOs for the BTC transaction. */
    filterUtxo: (utxos: BtcApiUtxo[]) => Promise<{
        outIndex: number;
        btcTxId: string;
    }>;
    /** Wallet instance used for signing BTC transactions. */
    wallet: AbstractWallet;
}
/**
 * Launches an RGB++ asset by preparing a launch cell and subsequently sending a BTC transaction.
 *
 * @param params - An object containing the necessary parameters for launching the RGB++ asset.
 * @param {RgbppTokenInfo} params.rgbppTokenInfo - Information about the RGB++ token to be launched.
 * @param {Collector} params.collector - The collector instance used to gather cells.
 * @param {boolean} params.isMainnet - A boolean indicating whether the operation is on the mainnet.
 * @param {BTCTestnetType} [params.btcTestnetType] - (Optional) The type of BTC testnet to use.
 * @param {string} params.btcAccount - The BTC account address.
 * @param {string} [params.btcAccountPubkey] - (Optional) The public key of the BTC account.
 * @param {DataSource} params.btcDataSource - The data source for BTC transactions.
 * @param {bigint} params.launchAmount - The amount of the asset to be launched, represented as a bigint.
 * @param {BtcAssetsApi} params.btcService - The service instance for interacting with BTC assets.
 * @param {string} params.ckbAddress - The CKB address where the asset will be launched.
 * @param {ccc.Signer} params.cccSigner - The signer instance for CKB transactions.
 * @param {(utxos: BtcApiUtxo[]) => Promise<{ outIndex: number; btcTxId: string }>} params.filterUtxo - A function to filter UTXOs for the BTC transaction.
 * @param {AbstractWallet} params.wallet - Wallet instance used for signing BTC transactions.
 * @param {bigint} [ckbFeeRate] - (Optional) The fee rate for CKB transactions, represented as a bigint.
 * @param {bigint} [maxFee=MAX_FEE] - (Optional) The maximum fee for the transaction, represented as a bigint. Defaults to MAX_FEE.
 * @param {number} [btcFeeRate] - (Optional) The fee rate for BTC transactions, represented as a number.
 * @param {number} [witnessLockPlaceholderSize] - (Optional) The size of the witness lock placeholder.
 *
 * @returns A promise that resolves to the transaction result, including the BTC transaction ID and CKB transaction hash.
 */
export declare const launchCombined: ({ rgbppTokenInfo, collector, isMainnet, btcTestnetType, btcAccount, btcDataSource, btcAccountPubkey, launchAmount, ckbAddress, filterUtxo, btcService, wallet, cccSigner, }: RgbppLauncerCombinedParams, ckbFeeRate?: bigint, maxFee?: bigint, btcFeeRate?: number, witnessLockPlaceholderSize?: number) => Promise<TxResult>;
/**
 * Parameters required for preparing a launch cell transaction on the CKB network.
 */
export interface PrepareLaunchCellTransactionParams {
    /** CKB address where the launch cell will be created. */
    ckbAddress: string;
    /** Information about the RGB++ token to be launched. */
    rgbppTokenInfo: RgbppTokenInfo;
    /** Collector instance used to gather cells for the transaction. */
    collector: Collector;
    /** Indicates whether the operation is on the mainnet. */
    isMainnet: boolean;
    /** Type of BTC testnet (optional). */
    btcTestnetType?: BTCTestnetType;
    /** Output index of the BTC transaction. */
    outIndex: number;
    /** ID of the BTC transaction. */
    btcTxId: string;
}
/**
 * Prepares a launch cell on the CKB network by creating a transaction.
 *
 * @param {PrepareLaunchCellTransactionParams} params - Parameters required to prepare the launch cell.
 * @param {string} params.ckbAddress - CKB address where the launch cell will be created.
 * @param {RgbppTokenInfo} params.rgbppTokenInfo - Information about the RGB++ token to be launched.
 * @param {Collector} params.collector - Collector instance used to gather cells for the transaction.
 * @param {boolean} params.isMainnet - Indicates whether the operation is on the mainnet.
 * @param {BTCTestnetType} [params.btcTestnetType] - Type of BTC testnet (optional).
 * @param {number} params.outIndex - Output index of the BTC transaction.
 * @param {string} params.btcTxId - ID of the BTC transaction.
 * @param {bigint} [maxFee=MAX_FEE] - Maximum fee for the CKB transaction (default is MAX_FEE).
 * @param {bigint} [ckbFeeRate] - Fee rate for the CKB transaction (optional).
 * @param {number} [witnessLockPlaceholderSize] - Size of the witness lock placeholder (optional).
 * @returns {Promise<CKBComponents.RawTransactionToSign>} - Promise that resolves to the prepared CKB transaction.
 *
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
export declare const prepareLaunchCellTransaction: ({ ckbAddress, rgbppTokenInfo, collector, isMainnet, btcTestnetType, outIndex, btcTxId, }: PrepareLaunchCellTransactionParams, maxFee?: bigint, ckbFeeRate?: bigint, witnessLockPlaceholderSize?: number) => Promise<CKBComponents.RawTransactionToSign>;
/**
 * Parameters required for generating an unsigned PSBT for launching an RGB++ asset.
 */
export interface PrepareLauncherUnsignedPsbtParams {
    /** Information about the RGB++ token to be launched. */
    rgbppTokenInfo: RgbppTokenInfo;
    /** Instance used to collect cells for the transaction. */
    collector: Collector;
    /** Indicates if the operation is on the mainnet. */
    isMainnet: boolean;
    /** (Optional) Type of BTC testnet to use. */
    btcTestnetType?: BTCTestnetType;
    /** Address of the BTC account. */
    btcAccount: string;
    /** (Optional) Public key of the BTC account. */
    btcAccountPubkey?: string;
    /** Source for BTC transaction data. */
    btcDataSource: DataSource;
    /** Amount of the asset to be launched, as a bigint. */
    launchAmount: bigint;
    /** Output index of the BTC transaction. */
    outIndex: number;
    /** ID of the BTC transaction. */
    btcTxId: string;
}
/**
 * Generates an unsigned PSBT for launching an RGB++ asset.
 *
 * @param {PrepareLauncherUnsignedPsbtParams} params - Parameters required for generating the unsigned PSBT.
 * @param {RgbppTokenInfo} params.rgbppTokenInfo - Details about the RGB++ token to be launched.
 * @param {Collector} params.collector - Instance used to collect cells for the transaction.
 * @param {boolean} params.isMainnet - Indicates if the operation is on the mainnet.
 * @param {BTCTestnetType} [params.btcTestnetType] - (Optional) Type of BTC testnet to use.
 * @param {string} params.btcAccount - Address of the BTC account.
 * @param {string} [params.btcAccountPubkey] - (Optional) Public key of the BTC account.
 * @param {DataSource} params.btcDataSource - Source for BTC transaction data.
 * @param {bigint} params.launchAmount - Amount of the asset to be launched, as a bigint.
 * @param {number} params.outIndex - Output index of the BTC transaction.
 * @param {string} params.btcTxId - ID of the BTC transaction.
 * @param {number} [btcFeeRate] - (Optional) Fee rate for BTC transactions, as a number.
 *
 * @returns {Promise<bitcoin.Psbt>} A promise resolving to the unsigned PSBT.
 *
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
export declare const prepareLauncherUnsignedPsbt: ({ rgbppTokenInfo, collector, isMainnet, btcTestnetType, btcAccount, btcDataSource, btcAccountPubkey, launchAmount, outIndex, btcTxId, }: PrepareLauncherUnsignedPsbtParams, btcFeeRate?: number) => Promise<bitcoin.Psbt>;
/**
 * Fetches the necessary UTXOs and filters them to get the output index and BTC transaction ID.
 *
 * @param {string} btcAccount - The BTC account address.
 * @param {Function} filterUtxo - The function used to filter UTXOs.
 * @param {BtcAssetsApi} btcService - The service instance for interacting with BTC assets.
 * @returns {Promise<{ outIndex: number, btcTxId: string }>} - A promise that resolves to an object containing the output index and BTC transaction ID.
 */
export declare const fetchAndFilterUtxos: (btcAccount: string, filterUtxo: (utxos: BtcApiUtxo[]) => Promise<{
    outIndex: number;
    btcTxId: string;
}>, btcService: BtcAssetsApi) => Promise<{
    outIndex: number;
    btcTxId: string;
}>;
//# sourceMappingURL=launcher.d.ts.map