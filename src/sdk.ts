import { ApolloClient, gql } from "@apollo/client/core";
import { InMemoryCache, NormalizedCacheObject } from "@apollo/client/cache";
import { BatchHttpLink } from "@apollo/client/link/batch-http";
import { BTCTestnetType, getXudtTypeScript } from "@rgbpp-sdk/ckb";
import { BtcApiTransaction, BtcAssetsApi } from "@rgbpp-sdk/service";
import { createBtcService } from "./helper";
import { scriptToHash } from "@nervosnetwork/ckb-sdk-utils";

/**
 * Represents an outpoint in a transaction.
 */
type OutPoint = {
  /**
   * The transaction hash of the outpoint.
   */
  txHash: string;
  /**
   * The index of the outpoint in the transaction.
   */
  index: string;
};

/**
 * Enum representing the minting status of an inscription.
 */
export enum MintStatus {
  /** Inscription can continue to be minted */
  MINTABLE = 0,
  /** Inscription minting has ended */
  MINT_CLOSED = 1,
  /** Inscription has entered the rebase phase */
  REBASE_STARTED = 2,
}

// Mapping for MintStatus, used for validation
const MintStatusMap: Record<number, MintStatus> = {
  [MintStatus.MINTABLE]: MintStatus.MINTABLE,
  [MintStatus.MINT_CLOSED]: MintStatus.MINT_CLOSED,
  [MintStatus.REBASE_STARTED]: MintStatus.REBASE_STARTED,
};

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
 * Represents the response from a GraphQL query, including XUDT cell and spore actions.
 */
interface GraphQLResponse {
  /**
   * The XUDT cell information, if available.
   */
  xudtCell: XudtCell | null;
  /**
   * The spore actions information, if available.
   */
  sporeActions: SporeAction | null;
}

// GraphQL query constants
const ASSET_DETAILS_QUERY = gql`
  query AssetDetails($txHash: bytea!, $txIndex: Int!) {
    xudtCell: xudt_cell_by_pk(
      transaction_hash: $txHash
      transaction_index: $txIndex
    ) {
      amount
      is_consumed
      type_id
      addressByTypeId {
        script_args
        token_info {
          decimal
          name
          symbol
        }
        token_infos {
          decimal
          name
          symbol
          expected_supply
          mint_limit
          mint_status
          udt_hash
        }
      }
    }
    sporeActions: spore_actions_by_pk(tx: $txHash) {
      cluster {
        cluster_description
        cluster_name
        created_at
        id
        is_burned
        mutant_id
        owner_address
        updated_at
        addressByTypeId {
          script_args
          script_code_hash
          script_hash_type
        }
      }
      spore {
        cluster_id
        content
        content_type
        created_at
        id
        is_burned
        owner_address
        updated_at
        addressByTypeId {
          script_args
          script_code_hash
          script_hash_type
        }
      }
    }
  }
`;

const RAW_INSCRIPTION_INFO_QUERY = gql`
  query RawInscriptionInfo($udtHash: String!) {
    token_info(where: { udt_hash: { _eq: $udtHash } }) {
      decimal
      name
      symbol
      expected_supply
      mint_limit
      mint_status
      udt_hash
    }
  }
`;

/**
 * RgbppSDK class for interacting with RGBPP services and GraphQL endpoints.
 */
export class RgbppSDK {
  /**
   * The BTC assets service used for fetching BTC-related data.
   */
  private service: BtcAssetsApi;

  /**
   * ApolloClient instance for making GraphQL queries.
   */
  private client: ApolloClient<NormalizedCacheObject>;

  /**
   * Indicates whether the SDK is operating on the mainnet.
   */
  private isMainnet: boolean;

  /**
   * Constructs an instance of RgbppSDK.
   * @param {boolean} isMainnet - Whether the network is mainnet.
   * @param {BTCTestnetType} [btcTestnetType] - The type of BTC testnet.
   */
  constructor(isMainnet: boolean, btcTestnetType?: BTCTestnetType) {
    this.isMainnet = isMainnet;
    this.service = createBtcService(btcTestnetType);
    const graphqlEndpoint = isMainnet
      ? "https://ckb-graph.unistate.io/v1/graphql"
      : "https://unistate-ckb-test.unistate.io/v1/graphql";

    this.client = new ApolloClient({
      cache: new InMemoryCache(),
      link: new BatchHttpLink({
        uri: graphqlEndpoint,
        batchMax: 5,
        batchInterval: 20,
      }),
      defaultOptions: {
        watchQuery: { fetchPolicy: "cache-and-network" },
      },
    });
  }

  /**
   * Fetches transaction details.
   * @param {string} btcAddress - The BTC address.
   * @param {string} [afterTxId] - Optional, used for pagination.
   * @returns {Promise<BtcApiTransaction[]>} An array of transaction details.
   */
  public async fetchTxsDetails(
    btcAddress: string,
    afterTxId?: string,
  ): Promise<BtcApiTransaction[]> {
    try {
      return await this.service.getBtcTransactions(btcAddress, {
        after_txid: afterTxId,
      });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  }

  /**
   * Fetches assets and query details.
   * @param {string} btcAddress - The BTC address.
   * @returns {Promise<QueryResult>} The query result, including balance and asset details.
   */
  public async fetchAssetsAndQueryDetails(
    btcAddress: string,
  ): Promise<QueryResult> {
    try {
      const [balance, assets] = await Promise.all([
        this.service.getBtcBalance(btcAddress),
        this.service.getRgbppAssetsByBtcAddress(btcAddress),
      ]);

      const validAssets = assets.filter(
        (asset): asset is typeof asset & { outPoint: OutPoint } =>
          !!asset.outPoint,
      );

      if (validAssets.length === 0) {
        return { balance, assets: { xudtCells: [], sporeActions: [] } };
      }

      const assetDetails = await Promise.all(
        validAssets.map((asset) => this.queryAssetDetails(asset.outPoint)),
      );

      const processedXudtCells = await Promise.all(
        assetDetails
          .filter(
            (
              result,
            ): result is {
              xudtCell: XudtCell;
              sporeActions: null | SporeAction;
            } => !!result.xudtCell,
          )
          .map((result) => this.processXudtCell(result.xudtCell)),
      );

      const assetsResult: AssetDetails = {
        xudtCells: processedXudtCells,
        sporeActions: assetDetails.flatMap((result) =>
          result.sporeActions ? [result.sporeActions] : []
        ),
      };

      return { balance, assets: assetsResult };
    } catch (error) {
      console.error("Error fetching assets and details:", error);
      throw error;
    }
  }

  /**
   * Gets the XUDT hash.
   * @param {string} script_args - The script arguments.
   * @returns {string} The XUDT hash.
   */
  private xudtHash(script_args: string): string {
    return this.removeHexPrefix(
      scriptToHash({
        ...getXudtTypeScript(this.isMainnet),
        args: this.formatHexPrefix(script_args),
      }),
    );
  }

  /**
   * Formats the hexadecimal prefix.
   * @param {string} hexString - The hexadecimal string.
   * @returns {string} The formatted string.
   */
  private formatHexPrefix(hexString: string): string {
    return `\\x${hexString.replace(/^0x/, "")}`;
  }

  /**
   * Removes the hexadecimal prefix.
   * @param {string} prefixedHexString - The prefixed hexadecimal string.
   * @returns {string} The string without the prefix.
   */
  private removeHexPrefix(prefixedHexString: string): string {
    return `0x${prefixedHexString.replace(/^\\x/, "")}`;
  }

  /**
   * Queries the raw inscription information.
   * @param {string} udtHash - The UDT hash.
   * @returns {Promise<RawInscriptionInfo[]>} An array of raw inscription information.
   */
  private async queryRawInscriptionInfo(
    udtHash: string,
  ): Promise<RawInscriptionInfo[]> {
    const { data } = await this.client.query({
      query: RAW_INSCRIPTION_INFO_QUERY,
      variables: { udtHash },
    });

    return data.token_info as RawInscriptionInfo[];
  }

  /**
   * Queries the asset details.
   * @param {OutPoint} outPoint - The outpoint.
   * @returns {Promise<GraphQLResponse>} The GraphQL response.
   */
  private async queryAssetDetails(
    outPoint: OutPoint,
  ): Promise<GraphQLResponse> {
    const { data } = await this.client.query({
      query: ASSET_DETAILS_QUERY,
      variables: {
        txHash: this.formatHexPrefix(outPoint.txHash),
        txIndex: Number(outPoint.index),
      },
    });

    return data as GraphQLResponse;
  }

  /**
   * Processes the XUDT cell.
   * @param {XudtCell} cell - The XUDT cell.
   * @returns {Promise<ProcessedXudtCell>} The processed XUDT cell.
   */
  private async processXudtCell(cell: XudtCell): Promise<ProcessedXudtCell> {
    if (
      !cell.addressByTypeId.token_info &&
      cell.addressByTypeId.token_infos.length === 0
    ) {
      const rawInfo = await this.queryRawInscriptionInfo(
        this.xudtHash(cell.addressByTypeId.script_args),
      );
      cell.addressByTypeId.token_infos = rawInfo;
    }

    return {
      amount: cell.amount,
      is_consumed: cell.is_consumed,
      type_id: cell.type_id,
      addressByTypeId: {
        token_info: cell.addressByTypeId.token_info,
        inscription_infos: cell.addressByTypeId.token_infos.map((info) => ({
          ...info,
          mint_status: this.validateMintStatus(info.mint_status),
        })),
        script_args: cell.addressByTypeId.script_args,
      },
    };
  }

  /**
   * Validates the mint status.
   * @param {number} status - The status value.
   * @returns {MintStatus} The validated MintStatus.
   */
  private validateMintStatus(status: number): MintStatus {
    const validStatus = MintStatusMap[status];
    if (validStatus === undefined) {
      throw new Error(`Invalid MintStatus: ${status}`);
    }
    return validStatus;
  }
}
