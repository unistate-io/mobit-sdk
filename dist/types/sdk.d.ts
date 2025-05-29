import { BTCTestnetType } from "@rgbpp-sdk/ckb";
import { BtcApiBalance, BtcApiTransaction } from "@rgbpp-sdk/service";
/**
 * Enum representing the minting status of a token, aligned with DB schema (smallint).
 */
export declare enum MintStatus {
    MINTABLE = 0,
    MINT_CLOSED = 1,
    REBASE_STARTED = 2
}
/**
 * Represents detailed information about a token type (XUDT, Inscription).
 * Directly maps fields from the `token_info` table.
 */
export interface TokenInfo {
    /** The type script address string (CKB format, e.g., ckt...) */
    type_address_id: string;
    decimal: number;
    name: string;
    symbol: string;
    /** Hash associated with the token, '0x...' format or null */
    udt_hash: string | null;
    /** Expected total supply or null */
    expected_supply: bigint | null;
    /** Mint limit per transaction or null */
    mint_limit: bigint | null;
    /** Minting status enum or null */
    mint_status: MintStatus | null;
}
/**
 * Represents the components of a CKB script derived from the `addresses` table.
 */
export interface ScriptInfo {
    /** Script code hash, '0x...' format */
    code_hash: string;
    /** Script hash type (0: data, 1: type, 2: data1) */
    hash_type: number;
    /** Script arguments, '0x...' format */
    args: string;
}
/**
 * Represents a processed XUDT cell - the primary data structure for XUDT assets returned by the SDK.
 */
export interface ProcessedXudtCell {
    /** Transaction hash where this cell was created, '0x...' format */
    tx_hash: string;
    /** Output index in the creation transaction */
    output_index: number;
    /** Amount of the token */
    amount: bigint;
    /** Indicates whether the cell has been consumed (spent) */
    is_consumed: boolean;
    /** Lock script address string (CKB format, e.g., ckt...) */
    lock_address_id: string;
    /** Type script address string (CKB format, e.g., ckt...) */
    type_address_id: string;
    /** Detailed information about the token type, if available */
    token_info: TokenInfo | null;
    /** Type script details (code_hash, hash_type, args), if available */
    type_script: ScriptInfo | null;
    /** Consumption details (tx and input index), if consumed */
    consumed_by: {
        tx_hash: string;
        input_index: number;
    } | null;
}
/**
 * Represents a processed Spore action returned by the SDK.
 */
export interface ProcessedSporeAction {
    /** Transaction hash where action occurred, '0x...' format */
    tx_hash: string;
    action_type: string;
    /** Spore ID involved (hash), '0x...' format or null */
    spore_id: string | null;
    /** Cluster ID involved (hash), '0x...' format or null */
    cluster_id: string | null;
    /** Sender CKB address string or null */
    from_address_id: string | null;
    /** Receiver CKB address string or null */
    to_address_id: string | null;
    /** Timestamp of the block containing the transaction */
    tx_timestamp: string;
    address_by_type_address_id?: {
        script_args: string;
        script_code_hash: string;
        script_hash_type: number;
    };
}
/**
 * Represents the BTC balance information returned by the service. (Matches BtcApiBalance)
 */
export type Balance = BtcApiBalance;
/**
 * Represents the combined details of CKB assets associated with a BTC address.
 */
export interface AssetDetails {
    xudtCells: ProcessedXudtCell[];
    sporeActions: ProcessedSporeAction[];
}
/**
 * Represents the overall result including BTC balance and CKB asset details.
 */
export interface QueryResult {
    balance: Balance;
    assets: AssetDetails;
}
/**
 * RgbppSDK class for interacting with RGBPP services and the CKB Indexer GraphQL endpoint (v1 schema).
 */
export declare class RgbppSDK {
    private service;
    private client;
    /**
     * Constructs an instance of RgbppSDK.
     * @param graphqlEndpoint - The URL of your Hasura GraphQL endpoint (e.g., https://mainnet.unistate.io/v1/graphql). REQUIRED.
     * @param btcTestnetType - Optional: Specify the BTC testnet type for the service if not mainnet.
     */
    constructor(graphqlEndpoint: string, btcTestnetType?: BTCTestnetType);
    /**
     * Fetches transaction details for a BTC address from the external BTC service.
     */
    fetchTxsDetails(btcAddress: string, afterTxId?: string): Promise<BtcApiTransaction[]>;
    /**
     * Fetches BTC balance and associated CKB assets (XUDT cells, Spore actions)
     * for a given BTC address using the v1 GraphQL endpoint.
     */
    fetchAssetsAndQueryDetails(btcAddress: string): Promise<QueryResult>;
    /** Extracts valid OutPoints from RGBPP assets and removes duplicates. */
    private extractAndDeduplicateOutPoints;
    /** Queries GraphQL for details of multiple OutPoints, handling errors individually. */
    private queryDetailsForAllOutPoints;
    /** Processes an array of GraphQL responses (or nulls) into final AssetDetails. */
    private processGraphQLResponses;
    /** Executes the GraphQL query for a single CKB UTXO using ASSET_DETAILS_QUERY. */
    private querySingleAssetDetails;
    /** Processes a RawXudtCell from GraphQL into a ProcessedXudtCell. */
    private processRawXudtCell;
    /** Processes a RawSporeAction from GraphQL into a ProcessedSporeAction. */
    private processRawSporeAction;
    /** Validates the mint status number against the MintStatus enum. */
    private validateMintStatus;
}
//# sourceMappingURL=sdk.d.ts.map