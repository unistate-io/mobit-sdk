import { bitcoin } from '@rgbpp-sdk/btc';
import { BtcApiTransaction } from '@rgbpp-sdk/service';
import { BtcApiUtxo } from '@rgbpp-sdk/service';
import { BtcAssetsApi } from 'rgbpp';
import { BTCTestnetType } from '@rgbpp-sdk/ckb';
import { ccc } from '@ckb-ccc/core';
import * as ccc_2 from '@ckb-ccc/core';
import { Collector } from '@rgbpp-sdk/ckb';
import { DataSource } from 'rgbpp';
import { DataSource as DataSource_2 } from '@rgbpp-sdk/btc';
import { Hex } from '@rgbpp-sdk/ckb';
import { NetworkType } from 'rgbpp';
import { RawClusterData } from '@rgbpp-sdk/ckb';
import { RawSporeData } from '@rgbpp-sdk/ckb';
import { RgbppBtcAddressReceiver } from '@rgbpp-sdk/ckb';
import { RgbppTokenInfo } from '@rgbpp-sdk/ckb';

/**
 * AbstractWallet interface defines the contract for a wallet that can sign PSBTs (Partially Signed Bitcoin Transactions).
 */
export declare interface AbstractWallet {
    /**
     * Signs a PSBT (Partially Signed Bitcoin Transaction) given its hexadecimal representation.
     * @param psbtHex - The hexadecimal string representation of the PSBT to be signed.
     * @returns A promise that resolves to the signed PSBT in hexadecimal format.
     */
    signPsbt(psbtHex: string): Promise<string>;
}

/**
 * Represents the details of assets, including XUDT cells and spore actions.
 */
declare interface AssetDetails {
    /**
     * An array of processed XUDT cells.
     */
    xudtCells: ProcessedXudtCell[];
    /**
     * An array of spore actions.
     */
    sporeActions: SporeAction[];
}

/**
 * Represents the balance information of an address.
 */
declare interface Balance {
    /**
     * The address.
     */
    address: string;
    /**
     * The total satoshi amount.
     */
    total_satoshi: number;
    /**
     * The pending satoshi amount.
     */
    pending_satoshi: number;
    /**
     * The satoshi amount.
     */
    satoshi: number;
    /**
     * The available satoshi amount.
     */
    available_satoshi: number;
    /**
     * The dust satoshi amount.
     */
    dust_satoshi: number;
    /**
     * The RGBPP satoshi amount.
     */
    rgbpp_satoshi: number;
    /**
     * The count of UTXOs.
     */
    utxo_count: number;
}

/**
 * BtcHelper class provides utility methods for interacting with the Bitcoin network, including managing data sources and services.
 */
export declare class BtcHelper {
    /**
     * The data source used for interacting with the Bitcoin network.
     */
    btcDataSource: DataSource;
    /**
     * Optional parameter specifying the type of Bitcoin testnet.
     */
    btcTestnetType?: BTCTestnetType;
    /**
     * The service used for managing Bitcoin assets.
     */
    btcService: BtcAssetsApi;
    /**
     * The wallet instance used for signing transactions.
     */
    wallet: AbstractWallet;
    /**
     * The type of network the helper is interacting with.
     */
    networkType: NetworkType;
    /**
     * Constructs a new BtcHelper instance.
     * @param {AbstractWallet} wallet - An instance of a wallet that implements the AbstractWallet interface.
     * @param {NetworkType} networkType - The type of network (e.g., Mainnet, Testnet) the helper will interact with.
     * @param {BTCTestnetType} btcTestnetType - Optional parameter specifying the type of Bitcoin testnet (e.g., Signet, Testnet3).
     */
    constructor(wallet: AbstractWallet, networkType: NetworkType, btcTestnetType?: BTCTestnetType);
}

/**
 * CkbHelper class provides utility methods for interacting with the CKB (Nervos Network) blockchain.
 */
export declare class CkbHelper {
    /**
     * The collector instance used for collecting data from the CKB blockchain.
     */
    collector: Collector;
    /**
     * A boolean indicating whether the helper is interacting with the mainnet.
     */
    isMainnet: boolean;
    /**
     * Constructs a new CkbHelper instance.
     * @param {boolean} isMainnet - A boolean indicating whether the helper is interacting with the mainnet or testnet.
     */
    constructor(isMainnet: boolean);
}

/**
 * Represents information about a cluster.
 */
declare interface ClusterInfo {
    /**
     * The description of the cluster.
     */
    cluster_description: string;
    /**
     * The name of the cluster.
     */
    cluster_name: string;
    /**
     * The creation timestamp of the cluster.
     */
    created_at: string;
    /**
     * The unique identifier of the cluster.
     */
    id: string;
    /**
     * Indicates whether the cluster has been burned.
     */
    is_burned: boolean;
    /**
     * The mutant identifier of the cluster.
     */
    mutant_id: string;
    /**
     * The owner address of the cluster.
     */
    owner_address: string;
    /**
     * The last updated timestamp of the cluster.
     */
    updated_at: string;
    /**
     * Information about the address associated with the type ID.
     */
    addressByTypeId: {
        /**
         * The script arguments associated with the address.
         */
        script_args: string;
        /**
         * The script code hash associated with the address.
         */
        script_code_hash: string;
        /**
         * The script hash type.
         */
        script_hash_type: number;
    };
}

/**
 * Converts a CKBComponents.RawTransactionToSign to a ccc.Transaction.
 * @param {CKBComponents.RawTransactionToSign} rawTransactionToSign - The raw transaction to sign to convert.
 * @returns {ccc.Transaction} The converted transaction object.
 */
export declare function convertToTransaction(rawTransactionToSign: CKBComponents.RawTransactionToSign): ccc.Transaction;

/**
 * Creates a BTC service instance.
 * @param {BTCTestnetType} btcTestnetType - The type of BTC testnet.
 * @returns {BtcAssetsApi} A BtcAssetsApi instance.
 */
export declare const createBtcService: (btcTestnetType?: BTCTestnetType) => BtcAssetsApi;

/**
 * Creates an unsigned transaction for burning xUDT assets.
 *
 * This function constructs a transaction that burns a specified amount of xUDT tokens from a given CKB address.
 * It fetches the necessary cells, collects inputs, and constructs the transaction outputs accordingly.
 *
 * @param {CreateBurnXudtTransactionParams} params - The parameters for creating the burn transaction.
 * @param {CKBComponents.Script} params.xudtType - The xUDT type script, which is the unique identifier for the xUDT token type.
 * @param {bigint} params.burnAmount - The amount of xUDT asset to be burned, representing the quantity of tokens that will be destroyed.
 * @param {string} params.ckbAddress - The CKB address for the transaction, from which the tokens will be burned.
 * @param {Collector} params.collector - The collector instance used to fetch cells and collect inputs, responsible for gathering the necessary cells to construct the transaction.
 * @param {boolean} params.isMainnet - A boolean indicating whether the network is mainnet or testnet, affecting the type script and cell dependencies.
 * @returns {Promise<CKBComponents.RawTransactionToSign>} - An unsigned transaction object that can be signed and submitted to the network.
 */
export declare function createBurnXudtTransaction({ xudtType, burnAmount, ckbAddress, collector, isMainnet, }: CreateBurnXudtTransactionParams): Promise<CKBComponents.RawTransactionToSign>;

/**
 * Interface for parameters required to create a burn transaction for xUDT assets.
 */
export declare interface CreateBurnXudtTransactionParams {
    /**
     * The xUDT type script, which is the unique identifier for the xUDT token type.
     */
    xudtType: CKBComponents.Script;
    /**
     * The amount of xUDT asset to be burned, representing the quantity of tokens that will be destroyed.
     */
    burnAmount: bigint;
    /**
     * The CKB address for the transaction, from which the tokens will be burned.
     */
    ckbAddress: string;
    /**
     * The collector instance used to fetch cells and collect inputs, responsible for gathering the necessary cells to construct the transaction.
     */
    collector: Collector;
    /**
     * A boolean indicating whether the network is mainnet or testnet, affecting the type script and cell dependencies.
     */
    isMainnet: boolean;
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
 * @param {string} [params.fromBtcAccountPubkey] - Public key of the BTC account.
 * @param {DataSource} params.btcDataSource - Data source for BTC transactions.
 * @param {AbstractWallet} params.wallet - Wallet instance used for signing BTC transactions.
 * @param {BtcAssetsApi} params.btcService - BTC service instance for interacting with BTC assets.
 * @param {(utxos: BtcApiUtxo[]) => Promise<{ outIndex: number; btcTxId: string }>} params.filterUtxo - Function to filter UTXOs for the BTC transaction.
 * @param {ccc.Signer} params.cccSigner - Signer instance for signing CKB transactions.
 * @param {bigint} [ckbFeeRate] - Fee rate for the CKB transaction (optional).
 * @param {number} [btcFeeRate=30] - Fee rate for the BTC transaction (default is 30).
 * @returns {Promise<TxResult>} - Promise that resolves to the transaction result.
 */
export declare const createClusterCombined: ({ ckbAddress, clusterData, collector, isMainnet, btcTestnetType, fromBtcAccount, fromBtcAccountPubkey, btcDataSource, wallet, btcService, filterUtxo, cccSigner, }: createClusterCombinedParams, ckbFeeRate?: bigint, btcFeeRate?: number) => Promise<TxResult>;

/**
 * Parameters required to create a combined cluster.
 */
export declare interface createClusterCombinedParams {
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
     * Public key of the BTC account.
     */
    fromBtcAccountPubkey: string;
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
    cccSigner: ccc_2.Signer;
}

/**
 * Creates an unsigned transaction for issuing xUDT assets with a unique cell as the token info cell.
 *
 * @param {CreateIssueXudtTransactionParams} params - An object containing the parameters for the transaction.
 * @param {bigint} params.xudtTotalAmount - The total amount of xUDT asset to be issued.
 * @param {RgbppTokenInfo} params.tokenInfo - The xUDT token information including decimal, name, and symbol.
 * @param {string} params.ckbAddress - The CKB address for the transaction.
 * @param {Collector} params.collector - The collector instance used to fetch cells and collect inputs.
 * @param {boolean} params.isMainnet - A boolean indicating whether the network is mainnet or testnet.
 *
 * @returns {Promise<CKBComponents.RawTransactionToSign>} A promise that resolves to an unsigned transaction object.
 */
export declare function createIssueXudtTransaction({ xudtTotalAmount, tokenInfo, ckbAddress, collector, isMainnet, }: CreateIssueXudtTransactionParams): Promise<CKBComponents.RawTransactionToSign>;

/**
 * Interface for parameters required to create an issue xUDT transaction.
 */
export declare interface CreateIssueXudtTransactionParams {
    /**
     * The total amount of xUDT asset to be issued.
     */
    xudtTotalAmount: bigint;
    /**
     * The xUDT token information including decimal, name, and symbol.
     */
    tokenInfo: RgbppTokenInfo;
    /**
     * The CKB address for the transaction.
     */
    ckbAddress: string;
    /**
     * The collector instance used to fetch cells and collect inputs.
     */
    collector: Collector;
    /**
     * A boolean indicating whether the network is mainnet or testnet.
     */
    isMainnet: boolean;
}

/**
 * Merges multiple xUDT cells into a single xUDT cell and returns the remaining capacity as a separate cell.
 * @param {CreateMergeXudtTransactionParams} params - The parameters object.
 * @param {string} params.xudtArgs - The xUDT type script args.
 * @param {string[]} params.ckbAddresses - The CKB addresses involved in the transaction.
 * @param {Collector} params.collector - The collector instance used to fetch cells and collect inputs.
 * @param {boolean} params.isMainnet - A boolean indicating whether the transaction is for the mainnet or testnet.
 * @param {string} [ckbAddress=params.ckbAddresses[0]] - The address for the output cell, defaulting to the first address in the input address set.
 * @returns {Promise<CKBComponents.RawTransactionToSign>} An unsigned transaction object.
 */
export declare function createMergeXudtTransaction({ xudtArgs, ckbAddresses, collector, isMainnet, }: CreateMergeXudtTransactionParams, ckbAddress?: string): Promise<CKBComponents.RawTransactionToSign>;

/**
 * Parameters for creating a merged xUDT transaction.
 */
export declare interface CreateMergeXudtTransactionParams {
    /**
     * The xUDT type script args.
     */
    xudtArgs: string;
    /**
     * The CKB addresses involved in the transaction.
     */
    ckbAddresses: string[];
    /**
     * The collector instance used to fetch cells and collect inputs.
     */
    collector: Collector;
    /**
     * A boolean indicating whether the transaction is for the mainnet or testnet.
     */
    isMainnet: boolean;
}

/**
 * Creates spores combined with the given parameters.
 *
 * @param {SporeCreateCombinedParams} params - The parameters for creating spores.
 * @param {CKBComponents.Script} params.clusterType - The cluster type script.
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
export declare const createSporesCombined: ({ clusterType, receivers, collector, isMainnet, btcTestnetType, fromBtcAccount, fromBtcAccountPubkey, btcDataSource, wallet, btcService, ckbAddress, cccSigner, }: SporeCreateCombinedParams, btcFeeRate?: number, ckbFeeRate?: bigint) => Promise<TxResult>;

/**
 * Creates an unsigned transaction for transferring xUDT assets. This function can also be used to mint xUDT assets.
 *
 * @param {CreateTransferXudtTransactionParams} params - The parameters for creating the transaction.
 * @param {CKBComponents.Script} params.xudtType - The xUDT type script.
 * @param {Array<{ toAddress: string, transferAmount: bigint }>} params.receivers - An array of receiver objects containing `toAddress` and `transferAmount`.
 * @param {Array<string>} params.ckbAddresses - The CKB addresses for the transaction.
 * @param {Collector} params.collector - The collector instance used to fetch cells and collect inputs.
 * @param {boolean} params.isMainnet - A boolean indicating whether the network is mainnet or testnet.
 * @param {string} [ckbAddress=params.ckbAddresses[0]] - The address for the output cell, defaulting to the first address in the input address set.
 *
 * @returns {Promise<CKBComponents.RawTransactionToSign>} A promise that resolves to an unsigned transaction object.
 *
 * @throws {NoXudtLiveCellError} If the address has no xudt cells.
 * @throws {NoLiveCellError} If the address has no empty cells.
 */
export declare function createTransferXudtTransaction({ xudtType, receivers, ckbAddresses, collector, isMainnet, }: CreateTransferXudtTransactionParams, ckbAddress?: string): Promise<CKBComponents.RawTransactionToSign>;

/**
 * Parameters for creating a transaction to transfer xUDT assets.
 */
export declare interface CreateTransferXudtTransactionParams {
    /**
     * The xUDT type script.
     */
    xudtType: CKBComponents.Script;
    /**
     * An array of receiver objects containing `toAddress` and `transferAmount`.
     */
    receivers: {
        toAddress: string;
        transferAmount: bigint;
    }[];
    /**
     * The CKB addresses for the transaction.
     */
    ckbAddresses: string[];
    /**
     * The collector instance used to fetch cells and collect inputs.
     */
    collector: Collector;
    /**
     * A boolean indicating whether the network is mainnet or testnet.
     */
    isMainnet: boolean;
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

/**
 * Fetches RGBPP assets for a given BTC address and type script, and validates the result.
 *
 * @param {string} fromBtcAccount - The BTC account from which the assets are being fetched.
 * @param {CKBComponents.Script} clusterType - The cluster type script.
 * @param {BtcAssetsApi} btcService - The BTC assets API service.
 * @returns {Promise<string>} - The cluster RGBPP lock args.
 * @throws {Error} - Throws an error if no assets are found for the given BTC address and type script.
 */
export declare const fetchAndValidateAssets: (fromBtcAccount: string, clusterType: CKBComponents.Script, btcService: BtcAssetsApi) => Promise<string>;

/**
 * Represents information about an inscription, extending TokenInfo.
 */
declare interface InscriptionInfo extends TokenInfo {
    /**
     * The expected total supply of the token.
     */
    expected_supply: bigint;
    /**
     * The limit on the number of tokens that can be minted.
     */
    mint_limit: bigint;
    /**
     * The status of the minting process, represented as a MintStatus enum.
     */
    mint_status: MintStatus;
    /**
     * The hash of the UDT (User Defined Token).
     */
    udt_hash: string;
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
 * @param {string} [params.btcAccountPubkey] - The public key of the BTC account.
 * @param {DataSource} params.btcDataSource - The data source for BTC transactions.
 * @param {bigint} params.launchAmount - The amount of the asset to be launched, represented as a bigint.
 * @param {BtcAssetsApi} params.btcService - The service instance for interacting with BTC assets.
 * @param {string} params.ckbAddress - The CKB address where the asset will be launched.
 * @param {ccc.Signer} params.cccSigner - The signer instance for CKB transactions.
 * @param {(utxos: BtcApiUtxo[]) => Promise<{ outIndex: number; btcTxId: string }>} params.filterUtxo - A function to filter UTXOs for the BTC transaction.
 * @param {AbstractWallet} params.wallet - Wallet instance used for signing BTC transactions.
 * @param {bigint} [ckbFeeRate] - (Optional) The fee rate for CKB transactions, represented as a bigint.
 * @param {number} [btcFeeRate] - (Optional) The fee rate for BTC transactions, represented as a number.
 *
 * @returns A promise that resolves to the transaction result, including the BTC transaction ID and CKB transaction hash.
 */
export declare const launchCombined: ({ rgbppTokenInfo, collector, isMainnet, btcTestnetType, btcAccount, btcDataSource, btcAccountPubkey, launchAmount, ckbAddress, filterUtxo, btcService, wallet, cccSigner, }: RgbppLauncerCombinedParams, ckbFeeRate?: bigint, btcFeeRate?: number) => Promise<TxResult>;

/**
 * Combines the parameters for leaping RGBPP assets from Bitcoin to CKB and executes the leap operation.
 *
 * @param {RgbppLeapFromBtcToCkbCombinedParams} params - The parameters for the leap operation.
 * @param {string} params.toCkbAddress - The destination CKB address.
 * @param {CKBComponents.Script} params.xudtType - The XUDT type script.
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
export declare const leapFromBtcToCkbCombined: ({ toCkbAddress, xudtType, transferAmount, collector, btcDataSource, btcTestnetType, isMainnet, fromBtcAccount, fromBtcAccountPubkey, wallet, btcService, }: RgbppLeapFromBtcToCkbCombinedParams, btcFeeRate?: number) => Promise<TxResult>;

/**
 * Leap from CKB to BTC
 *
 * This function facilitates the transfer of assets from the CKB (Nervos Network) blockchain to the BTC (Bitcoin) blockchain.
 * It constructs the necessary arguments and transactions to move the specified amount of assets, identified by their type arguments,
 * from a CKB address to a BTC transaction. The function also handles the signing and sending of the transaction.
 *
 * @param {LeapToBtcTransactionParams} params - The parameters required for the leap operation.
 * @param {number} params.outIndex - The output index in the BTC transaction.
 * @param {string} params.btcTxId - The transaction ID of the BTC transaction.
 * @param {string} params.xudtTypeArgs - The type arguments for the XUDT (User Defined Token) on CKB.
 * @param {bigint} params.transferAmount - The amount of assets to transfer.
 * @param {boolean} params.isMainnet - Indicates whether the operation is on the mainnet.
 * @param {Collector} params.collector - The collector instance used for collecting cells.
 * @param {string} params.ckbAddress - The CKB address from which the assets are being transferred.
 * @param {BTCTestnetType} [params.btcTestnetType] - The type of BTC testnet, if applicable.
 *
 * @returns {Promise<CKBComponents.RawTransactionToSign>} - The unsigned raw transaction to sign.
 */
export declare const leapFromCkbToBtcTransaction: ({ outIndex, btcTxId, xudtTypeArgs, transferAmount, isMainnet, collector, ckbAddress, btcTestnetType, }: LeapToBtcTransactionParams) => Promise<CKBComponents.RawTransactionToSign>;

/**
 * Combines the process of leaping a spore from BTC to CKB with the necessary parameters.
 *
 * @param {SporeLeapCombinedParams} params - The parameters required for the spore leap process.
 * @param {number} [btcFeeRate=30] - The fee rate for the BTC transaction (default is 30).
 *
 * @param {string} params.toCkbAddress - The CKB address to which the spore will be sent.
 * @param {CKBComponents.Script} params.sporeType - The type script for the spore.
 * @param {Collector} params.collector - The collector object used for collecting the spore.
 * @param {boolean} params.isMainnet - Indicates whether the operation is on the mainnet.
 * @param {BTCTestnetType} [params.btcTestnetType] - The type of BTC testnet (optional).
 * @param {string} params.fromBtcAddress - The BTC address from which the spore will be sent.
 * @param {string} [params.fromBtcAddressPubkey] - The public key of the BTC address.
 * @param {DataSource} params.btcDataSource - The data source for BTC transactions.
 * @param {AbstractWallet} params.wallet - Wallet instance used for signing BTC transactions.
 * @param {BtcAssetsApi} params.btcService - The BTC assets API service.
 *
 * @returns {Promise<TxResult>} - The result of the transaction, including the BTC transaction ID.
 */
export declare const leapSporeFromBtcToCkbCombined: ({ toCkbAddress, sporeType, collector, isMainnet, btcTestnetType, fromBtcAddress, fromBtcAddressPubkey, btcDataSource, wallet, btcService, }: SporeLeapCombinedParams, btcFeeRate?: number) => Promise<TxResult>;

/**
 * Leap a spore from CKB to BTC.
 *
 * @param {LeapSporeToBtcTransactionParams} params - The parameters for leaping a spore from CKB to BTC.
 * @param {number} params.outIndex - The output index of the spore.
 * @param {string} params.btcTxId - The transaction ID of the BTC transaction.
 * @param {CKBComponents.Script} params.sporeType - The type script for the spore.
 * @param {boolean} params.isMainnet - A flag indicating whether the operation is on the mainnet.
 * @param {Collector} params.collector - The collector instance.
 * @param {string} params.ckbAddress - The CKB address.
 * @param {BTCTestnetType} [params.btcTestnetType] - (Optional) The type of BTC testnet.
 * @returns {Promise<CKBComponents.RawTransactionToSign>} A promise that resolves to the unsigned raw transaction to sign.
 */
export declare const leapSporeFromCkbToBtcTransaction: ({ outIndex, btcTxId, sporeType, isMainnet, collector, ckbAddress, btcTestnetType, }: LeapSporeToBtcTransactionParams) => Promise<CKBComponents.RawTransactionToSign>;

/**
 * Interface for parameters required to leap a spore from CKB to BTC.
 */
export declare interface LeapSporeToBtcTransactionParams {
    /**
     * The output index of the spore.
     */
    outIndex: number;
    /**
     * The transaction ID of the BTC transaction.
     */
    btcTxId: string;
    /**
     * The type script for the spore.
     */
    sporeType: CKBComponents.Script;
    /**
     * A flag indicating whether the operation is on the mainnet.
     */
    isMainnet: boolean;
    /**
     * The collector instance.
     */
    collector: Collector;
    /**
     * The CKB address.
     */
    ckbAddress: string;
    /**
     * (Optional) The type of BTC testnet.
     */
    btcTestnetType?: BTCTestnetType;
}

/**
 * Interface for parameters required for the leap from CKB to BTC transaction.
 */
export declare interface LeapToBtcTransactionParams {
    /**
     * The output index in the BTC transaction.
     */
    outIndex: number;
    /**
     * The transaction ID of the BTC transaction.
     */
    btcTxId: string;
    /**
     * The type arguments for the XUDT (User Defined Token) on CKB.
     */
    xudtTypeArgs: string;
    /**
     * The amount of assets to transfer.
     */
    transferAmount: bigint;
    /**
     * Indicates whether the operation is on the mainnet.
     */
    isMainnet: boolean;
    /**
     * The collector instance used for collecting cells.
     */
    collector: Collector;
    /**
     * The CKB address from which the assets are being transferred.
     */
    ckbAddress: string;
    /**
     * The type of BTC testnet, if applicable.
     */
    btcTestnetType?: BTCTestnetType;
}

/**
 * Enum representing the minting status of an inscription.
 */
declare enum MintStatus {
    /** Inscription can continue to be minted */
    MINTABLE = 0,
    /** Inscription minting has ended */
    MINT_CLOSED = 1,
    /** Inscription has entered the rebase phase */
    REBASE_STARTED = 2
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
export declare const prepareClusterCellTransaction: ({ ckbAddress, clusterData, collector, isMainnet, btcTestnetType, outIndex, btcTxId, }: PrepareClusterCellTransactionParams) => Promise<CKBComponents.RawTransactionToSign>;

/**
 * Parameters required to prepare a cluster cell transaction.
 */
export declare interface PrepareClusterCellTransactionParams {
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
 * Generates an unsigned PSBT (Partially Signed Bitcoin Transaction) for creating a cluster.
 * This function is used to estimate transaction fees before finalizing the transaction.
 *
 * @param {PrepareCreateClusterUnsignedPsbtParams} params - Parameters required to generate the unsigned PSBT.
 * @param {Collector} params.collector - Collector instance used to gather cells for the transaction.
 * @param {RawClusterData} params.clusterData - Raw data required to create the cluster.
 * @param {boolean} params.isMainnet - Indicates whether the operation is on the mainnet.
 * @param {BTCTestnetType} [params.btcTestnetType] - Type of BTC testnet (optional).
 * @param {string} params.fromBtcAccount - BTC account from which the transaction will be initiated.
 * @param {string} [params.fromBtcAccountPubkey] - Public key of the BTC account.
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

/**
 * Parameters required to generate an unsigned PSBT (Partially Signed Bitcoin Transaction) for creating a cluster.
 * This interface is used to estimate transaction fees before finalizing the transaction.
 */
export declare interface PrepareCreateClusterUnsignedPsbtParams {
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
     * Public key of the BTC account.
     */
    fromBtcAccountPubkey: string;
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
 * Parameters for preparing an unsigned BTC transaction for creating spores.
 */
export declare interface PrepareCreateSporeUnsignedPsbtParams {
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
 * Parameters for preparing an unsigned CKB transaction for creating spores.
 */
export declare interface PrepareCreateSporeUnsignedTransactionParams {
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

/**
 * Interface for parameters required to prepare an unsigned PSBT for distributing RGBPP assets.
 */
export declare interface PrepareDistributeUnsignedPsbtParams {
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
    btcDataSource: DataSource_2;
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
export declare const prepareLaunchCellTransaction: ({ ckbAddress, rgbppTokenInfo, collector, isMainnet, btcTestnetType, outIndex, btcTxId, }: PrepareLaunchCellTransactionParams) => Promise<CKBComponents.RawTransactionToSign>;

/**
 * Parameters required for preparing a launch cell transaction on the CKB network.
 */
export declare interface PrepareLaunchCellTransactionParams {
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
 * Generates an unsigned PSBT for launching an RGB++ asset.
 *
 * @param {PrepareLauncherUnsignedPsbtParams} params - Parameters required for generating the unsigned PSBT.
 * @param {RgbppTokenInfo} params.rgbppTokenInfo - Details about the RGB++ token to be launched.
 * @param {Collector} params.collector - Instance used to collect cells for the transaction.
 * @param {boolean} params.isMainnet - Indicates if the operation is on the mainnet.
 * @param {BTCTestnetType} [params.btcTestnetType] - (Optional) Type of BTC testnet to use.
 * @param {string} params.btcAccount - Address of the BTC account.
 * @param {string} [params.btcAccountPubkey] - Public key of the BTC account.
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
 * Parameters required for generating an unsigned PSBT for launching an RGB++ asset.
 */
export declare interface PrepareLauncherUnsignedPsbtParams {
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
    /** Public key of the BTC account. */
    btcAccountPubkey: string;
    /** Source for BTC transaction data. */
    btcDataSource: DataSource_2;
    /** Amount of the asset to be launched, as a bigint. */
    launchAmount: bigint;
    /** Output index of the BTC transaction. */
    outIndex: number;
    /** ID of the BTC transaction. */
    btcTxId: string;
}

/**
 * Prepares an unsigned PSBT (Partially Signed Bitcoin Transaction) for leaping a spore from Bitcoin to CKB.
 * This function is used to estimate transaction fees before finalizing the transaction.
 *
 * @param {PrepareLeapSporeUnsignedPsbtParams} params - Parameters required to generate the unsigned PSBT.
 * @param {Hex} params.sporeRgbppLockArgs - RGBPP lock arguments for the spore.
 * @param {string} params.toCkbAddress - The destination CKB address.
 * @param {CKBComponents.Script} params.sporeType - Type script for the spore.
 * @param {Collector} params.collector - Collector instance used to gather cells for the transaction.
 * @param {boolean} params.isMainnet - Indicates whether the operation is on the mainnet.
 * @param {BTCTestnetType} [params.btcTestnetType] - Type of BTC testnet (optional).
 * @param {string} params.fromBtcAddress - BTC address from which the spore will be leaped.
 * @param {string} [params.fromBtcAddressPubkey] - Public key of the BTC address.
 * @param {DataSource} params.btcDataSource - Data source for BTC transactions.
 * @param {number} [params.btcFeeRate] - Fee rate for the BTC transaction (optional, default is 30).
 * @param {BtcAssetsApi} params.btcService - The BTC assets API service.
 * @returns {Promise<bitcoin.Psbt>} - Promise that resolves to the unsigned PSBT.
 */
export declare const prepareLeapSporeUnsignedPsbt: ({ toCkbAddress, sporeType, collector, isMainnet, btcTestnetType, fromBtcAddress, fromBtcAddressPubkey, btcDataSource, btcFeeRate, btcService, }: PrepareLeapSporeUnsignedPsbtParams) => Promise<bitcoin.Psbt>;

/**
 * Parameters required to generate an unsigned PSBT (Partially Signed Bitcoin Transaction) for leaping a spore from Bitcoin to CKB.
 * This interface is used to estimate transaction fees before finalizing the transaction.
 */
export declare interface PrepareLeapSporeUnsignedPsbtParams {
    /** The destination CKB address. */
    toCkbAddress: string;
    /** Type script for the spore. */
    sporeType: CKBComponents.Script;
    /** Collector instance used to gather cells for the transaction. */
    collector: Collector;
    /** Indicates whether the operation is on the mainnet. */
    isMainnet: boolean;
    /** Type of BTC testnet (optional). */
    btcTestnetType?: BTCTestnetType;
    /** BTC address from which the spore will be leaped. */
    fromBtcAddress: string;
    /** Public key of the BTC address. */
    fromBtcAddressPubkey: string;
    /** Data source for BTC transactions. */
    btcDataSource: DataSource;
    /** Fee rate for the BTC transaction (optional, default is 30). */
    btcFeeRate?: number;
    /** The BTC assets API service. */
    btcService: BtcAssetsApi;
}

/**
 * Prepares an unsigned PSBT (Partially Signed Bitcoin Transaction) for leaping RGBPP assets from Bitcoin to CKB.
 * This function is used to estimate transaction fees before finalizing the transaction.
 *
 * @param {PrepareLeapUnsignedPsbtParams} params - Parameters required to generate the unsigned PSBT.
 * @param {BtcAssetsApi} params.btcService - The BTC assets service instance.
 * @param {string} params.toCkbAddress - The destination CKB address.
 * @param {CKBComponents.Script} params.xudtType - The XUDT type script.
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
export declare const prepareLeapUnsignedPsbt: ({ btcService, toCkbAddress, xudtType, transferAmount, isMainnet, collector, btcTestnetType, fromBtcAccount, fromBtcAccountPubkey, btcDataSource, btcFeeRate, }: PrepareLeapUnsignedPsbtParams) => Promise<bitcoin.Psbt>;

/**
 * Parameters for preparing an unsigned PSBT (Partially Signed Bitcoin Transaction) for leaping RGBPP assets from Bitcoin to CKB.
 */
export declare interface PrepareLeapUnsignedPsbtParams {
    /** The BTC assets service instance. */
    btcService: BtcAssetsApi;
    /** The destination CKB address. */
    toCkbAddress: string;
    /** The XUDT type script. */
    xudtType: CKBComponents.Script;
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
 * Prepares an unsigned PSBT (Partially Signed Bitcoin Transaction) for transferring a spore.
 * This function is used to estimate transaction fees before finalizing the transaction.
 *
 * @param {PrepareTransferSporeUnsignedPsbtParams} params - Parameters required to generate the unsigned PSBT.
 * @param {string} params.toBtcAddress - The recipient's BTC address.
 * @param {CKBComponents.Script} params.sporeType - Type script for the spore.
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
export declare const prepareTransferSporeUnsignedPsbt: ({ toBtcAddress, sporeType, collector, isMainnet, btcTestnetType, fromBtcAddress, fromBtcAddressPubkey, btcDataSource, btcService, btcFeeRate, }: PrepareTransferSporeUnsignedPsbtParams) => Promise<bitcoin.Psbt>;

/**
 * Interface for parameters required to prepare an unsigned PSBT for transferring a spore.
 */
export declare interface PrepareTransferSporeUnsignedPsbtParams {
    /** The recipient's BTC address. */
    toBtcAddress: string;
    /** Type script for the spore. */
    sporeType: CKBComponents.Script;
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
 * Prepares an unsigned PSBT (Partially Signed Bitcoin Transaction) for transferring RGBPP assets.
 * This function is used to estimate transaction fees before finalizing the transaction.
 *
 * @param {PrepareTransferUnsignedPsbtParams} params - Parameters required to generate the unsigned PSBT.
 * @param {string} params.toBtcAddress - The recipient's BTC address.
 * @param {CKBComponents.Script} params.xudtType - Type script for the XUDT.
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
export declare const prepareTransferUnsignedPsbt: ({ btcService, toBtcAddress, xudtType, transferAmount, collector, btcDataSource, btcTestnetType, isMainnet, fromBtcAccount, fromBtcAccountPubkey, btcFeeRate, }: PrepareTransferUnsignedPsbtParams) => Promise<bitcoin.Psbt>;

/**
 * Parameters required to generate an unsigned PSBT (Partially Signed Bitcoin Transaction) for transferring RGBPP assets.
 * This interface is used to estimate transaction fees before finalizing the transaction.
 */
export declare interface PrepareTransferUnsignedPsbtParams {
    /** The recipient's BTC address. */
    toBtcAddress: string;
    /** Type script for the XUDT. */
    xudtType: CKBComponents.Script;
    /** The amount of assets to transfer. */
    transferAmount: bigint;
    /** Collector instance used to gather cells for the transaction. */
    collector: Collector;
    /** Data source for BTC transactions. */
    btcDataSource: DataSource_2;
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
 * Represents a processed XUDT cell, which contains information about a token cell.
 */
declare interface ProcessedXudtCell {
    /**
     * The amount of the token in the cell.
     */
    amount: bigint;
    /**
     * Indicates whether the cell has been consumed.
     */
    is_consumed: boolean;
    /**
     * The type ID of the cell.
     */
    type_id: string;
    /**
     * Information about the address associated with the type ID.
     */
    addressByTypeId: {
        /**
         * The token information, if available.
         */
        token_info: TokenInfo | null;
        /**
         * An array of inscription information for the token.
         */
        inscription_infos: InscriptionInfo[];
        /**
         * The script arguments associated with the address.
         */
        script_args: string;
    };
}

/**
 * Represents the result of a query, including balance and asset details.
 */
export declare interface QueryResult {
    /**
     * The balance information.
     */
    balance: Balance;
    /**
     * The asset details.
     */
    assets: AssetDetails;
}

/**
 * Interface for parameters required to distribute RGBPP assets combined.
 */
export declare interface RgbppDistributeCombinedParams {
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
    btcDataSource: DataSource_2;
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
 * Parameters required for launching an RGB++ asset combined with CKB transaction preparation.
 */
export declare interface RgbppLauncerCombinedParams {
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
    /** Public key of the BTC account. */
    btcAccountPubkey: string;
    /** Data source for BTC transactions. */
    btcDataSource: DataSource_2;
    /** Amount of the asset to be launched, represented as a bigint. */
    launchAmount: bigint;
    /** Service instance for interacting with BTC assets. */
    btcService: BtcAssetsApi;
    /** CKB address where the asset will be launched. */
    ckbAddress: string;
    /** Signer instance for CKB transactions. */
    cccSigner: ccc_2.Signer;
    /** Function to filter UTXOs for the BTC transaction. */
    filterUtxo: (utxos: BtcApiUtxo[]) => Promise<{
        outIndex: number;
        btcTxId: string;
    }>;
    /** Wallet instance used for signing BTC transactions. */
    wallet: AbstractWallet;
}

/**
 * Parameters for combining the leap operation of RGBPP assets from Bitcoin to CKB.
 */
export declare interface RgbppLeapFromBtcToCkbCombinedParams {
    /** The destination CKB address. */
    toCkbAddress: string;
    /** The XUDT type script. */
    xudtType: CKBComponents.Script;
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
 * RgbppSDK class for interacting with RGBPP services and GraphQL endpoints.
 */
export declare class RgbppSDK {
    /**
     * The BTC assets service used for fetching BTC-related data.
     */
    private service;
    /**
     * ApolloClient instance for making GraphQL queries.
     */
    private client;
    /**
     * Indicates whether the SDK is operating on the mainnet.
     */
    private isMainnet;
    /**
     * Constructs an instance of RgbppSDK.
     * @param {boolean} isMainnet - Whether the network is mainnet.
     * @param {BTCTestnetType} [btcTestnetType] - The type of BTC testnet.
     */
    constructor(isMainnet: boolean, btcTestnetType?: BTCTestnetType);
    /**
     * Fetches transaction details.
     * @param {string} btcAddress - The BTC address.
     * @param {string} [afterTxId] - Optional, used for pagination.
     * @returns {Promise<BtcApiTransaction[]>} An array of transaction details.
     */
    fetchTxsDetails(btcAddress: string, afterTxId?: string): Promise<BtcApiTransaction[]>;
    /**
     * Fetches assets and query details.
     * @param {string} btcAddress - The BTC address.
     * @returns {Promise<QueryResult>} The query result, including balance and asset details.
     */
    fetchAssetsAndQueryDetails(btcAddress: string): Promise<QueryResult>;
    /**
     * Gets the XUDT hash.
     * @param {string} script_args - The script arguments.
     * @returns {string} The XUDT hash.
     */
    private xudtHash;
    /**
     * Formats the hexadecimal prefix.
     * @param {string} hexString - The hexadecimal string.
     * @returns {string} The formatted string.
     */
    private formatHexPrefix;
    /**
     * Removes the hexadecimal prefix.
     * @param {string} prefixedHexString - The prefixed hexadecimal string.
     * @returns {string} The string without the prefix.
     */
    private removeHexPrefix;
    /**
     * Queries the raw inscription information.
     * @param {string} udtHash - The UDT hash.
     * @returns {Promise<RawInscriptionInfo[]>} An array of raw inscription information.
     */
    private queryRawInscriptionInfo;
    /**
     * Queries the asset details.
     * @param {OutPoint} outPoint - The outpoint.
     * @returns {Promise<GraphQLResponse>} The GraphQL response.
     */
    private queryAssetDetails;
    /**
     * Processes the XUDT cell.
     * @param {XudtCell} cell - The XUDT cell.
     * @returns {Promise<ProcessedXudtCell>} The processed XUDT cell.
     */
    private processXudtCell;
    /**
     * Validates the mint status.
     * @param {number} status - The status value.
     * @returns {MintStatus} The validated MintStatus.
     */
    private validateMintStatus;
}

/**
 * Parameters for combining the steps of getting the RGBPP lock arguments list and transferring RGBPP assets.
 */
export declare interface RgbppTransferCombinedParams {
    /** The Bitcoin address to which the assets will be transferred. */
    toBtcAddress: string;
    /** The type script for the XUDT. */
    xudtType: CKBComponents.Script;
    /** The amount of assets to transfer, represented as a bigint. */
    transferAmount: bigint;
    /** The collector instance used for collecting assets. */
    collector: Collector;
    /** The data source for Bitcoin transactions. */
    btcDataSource: DataSource_2;
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
 * Represents an action related to a spore, including cluster and spore information.
 */
declare interface SporeAction {
    /**
     * The cluster information.
     */
    cluster: ClusterInfo;
    /**
     * The spore information.
     */
    spore: SporeInfo;
}

/**
 * Parameters for creating spores combined with the given parameters.
 */
export declare interface SporeCreateCombinedParams {
    /**
     * The cluster type script.
     */
    clusterType: CKBComponents.Script;
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
    cccSigner: ccc_2.Signer;
}

/**
 * Represents information about a spore.
 */
declare interface SporeInfo {
    /**
     * The cluster identifier the spore belongs to.
     */
    cluster_id: string;
    /**
     * The content of the spore.
     */
    content: string;
    /**
     * The content type of the spore.
     */
    content_type: string;
    /**
     * The creation timestamp of the spore.
     */
    created_at: string;
    /**
     * The unique identifier of the spore.
     */
    id: string;
    /**
     * Indicates whether the spore has been burned.
     */
    is_burned: boolean;
    /**
     * The owner address of the spore.
     */
    owner_address: string;
    /**
     * The last updated timestamp of the spore.
     */
    updated_at: string;
    /**
     * Information about the address associated with the type ID.
     */
    addressByTypeId: {
        /**
         * The script arguments associated with the address.
         */
        script_args: string;
        /**
         * The script code hash associated with the address.
         */
        script_code_hash: string;
        /**
         * The script hash type.
         */
        script_hash_type: number;
    };
}

/**
 * Parameters required for the combined process of leaping a spore from BTC to CKB.
 */
export declare interface SporeLeapCombinedParams {
    /** The CKB address to which the spore will be sent. */
    toCkbAddress: string;
    /** The type script for the spore. */
    sporeType: CKBComponents.Script;
    /** The collector object used for collecting the spore. */
    collector: Collector;
    /** Indicates whether the operation is on the mainnet. */
    isMainnet: boolean;
    /** The type of BTC testnet (optional). */
    btcTestnetType?: BTCTestnetType;
    /** The BTC address from which the spore will be sent. */
    fromBtcAddress: string;
    /** The public key of the BTC address. */
    fromBtcAddressPubkey: string;
    /** The data source for BTC transactions. */
    btcDataSource: DataSource;
    /** Wallet instance used for signing BTC transactions. */
    wallet: AbstractWallet;
    /** The BTC assets API service. */
    btcService: BtcAssetsApi;
}

/**
 * Interface for parameters required to transfer a spore combined.
 */
export declare interface SporeTransferCombinedParams {
    /** The recipient's BTC address. */
    toBtcAddress: string;
    /** Type script for the spore. */
    sporeType: CKBComponents.Script;
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
 * Represents information about a token.
 */
declare interface TokenInfo {
    /**
     * The number of decimal places the token supports.
     */
    decimal: number;
    /**
     * The name of the token.
     */
    name: string;
    /**
     * The symbol of the token.
     */
    symbol: string;
}

/**
 * Combines the steps of getting the RGBPP lock arguments list and transferring RGBPP assets.
 *
 * @param {RgbppTransferCombinedParams} params - Parameters for the transfer operation.
 * @param {string} params.toBtcAddress - The Bitcoin address to which the assets will be transferred.
 * @param {CKBComponents.Script} params.xudtType - The type script for the XUDT.
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
export declare const transferCombined: ({ toBtcAddress, xudtType, transferAmount, collector, btcDataSource, btcTestnetType, isMainnet, fromBtcAccount, fromBtcAccountPubkey, wallet, btcService, }: RgbppTransferCombinedParams, btcFeeRate?: number) => Promise<TxResult>;

/**
 * Transfers a spore to a specified BTC address.
 *
 * @param {SporeTransferCombinedParams} params - The parameters for the spore transfer.
 * @param {string} params.toBtcAddress - The recipient's BTC address.
 * @param {CKBComponents.Script} params.sporeType - The type script for the spore.
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
export declare const transferSporeCombined: ({ toBtcAddress, sporeType, collector, isMainnet, btcTestnetType, fromBtcAddress, fromBtcAddressPubkey, btcDataSource, wallet, btcService, }: SporeTransferCombinedParams, btcFeeRate?: number) => Promise<{
    btcTxId: string;
}>;

/**
 * Result interface for transaction operations.
 */
export declare interface TxResult {
    /**
     * The transaction ID of the Bitcoin transaction.
     */
    btcTxId: string;
    /**
     * The transaction hash of the CKB transaction, optional.
     */
    ckbTxHash?: string;
}

export { }
