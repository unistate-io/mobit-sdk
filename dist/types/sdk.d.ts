import { BTCTestnetType } from "@rgbpp-sdk/ckb";
import { BtcApiTransaction } from "@rgbpp-sdk/service";
/**
 * Enum representing the minting status of an inscription.
 */
export declare enum MintStatus {
    /** Inscription can continue to be minted */
    MINTABLE = 0,
    /** Inscription minting has ended */
    MINT_CLOSED = 1,
    /** Inscription has entered the rebase phase */
    REBASE_STARTED = 2
}
/**
 * Represents information about a token.
 */
export interface TokenInfo {
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
 * Represents raw information about an inscription, extending TokenInfo.
 */
export interface RawInscriptionInfo extends TokenInfo {
    /**
     * The expected total supply of the token.
     */
    expected_supply: bigint;
    /**
     * The limit on the number of tokens that can be minted.
     */
    mint_limit: bigint;
    /**
     * The status of the minting process, represented as a number.
     */
    mint_status: number;
    /**
     * The hash of the UDT (User Defined Token).
     */
    udt_hash: string;
}
/**
 * Represents an XUDT cell, which contains information about a token cell.
 */
export interface XudtCell {
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
         * An array of raw inscription information for the token.
         */
        token_infos: RawInscriptionInfo[];
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
 * Represents information about an inscription, extending TokenInfo.
 */
export interface InscriptionInfo extends TokenInfo {
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
 * Represents a processed XUDT cell, which contains information about a token cell.
 */
export interface ProcessedXudtCell {
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
 * Represents information about a cluster.
 */
export interface ClusterInfo {
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
 * Represents information about a spore.
 */
export interface SporeInfo {
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
 * Represents an action related to a spore, including cluster and spore information.
 */
export interface SporeAction {
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
 * Represents the balance information of an address.
 */
export interface Balance {
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
 * Represents the details of assets, including XUDT cells and spore actions.
 */
export interface AssetDetails {
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
 * Represents the result of a query, including balance and asset details.
 */
export interface QueryResult {
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
//# sourceMappingURL=sdk.d.ts.map