import { ApolloClient, gql } from "@apollo/client/core";
import { InMemoryCache, NormalizedCacheObject } from "@apollo/client/cache";
import { BatchHttpLink } from "@apollo/client/link/batch-http";
import { BTCTestnetType, getXudtTypeScript } from "@rgbpp-sdk/ckb";
import { BtcApiTransaction, BtcAssetsApi } from "@rgbpp-sdk/service";
import { createBtcService } from "./helper";
import { scriptToHash } from "@nervosnetwork/ckb-sdk-utils";

// 定义常用类型
type OutPoint = {
  txHash: string;
  index: string;
};

/**
 * 枚举表示铭文的铸造状态。
 */
export enum MintStatus {
  MINTABLE = 0, // 铭文可以继续铸造
  MINT_CLOSED = 1, // 铭文铸造已结束
  REBASE_STARTED = 2, // 铭文已进入 rebase 阶段
}

// MintStatus 的映射,用于验证
const MintStatusMap: Record<number, MintStatus> = {
  [MintStatus.MINTABLE]: MintStatus.MINTABLE,
  [MintStatus.MINT_CLOSED]: MintStatus.MINT_CLOSED,
  [MintStatus.REBASE_STARTED]: MintStatus.REBASE_STARTED,
};

// 接口定义
export interface TokenInfo {
  decimal: number;
  name: string;
  symbol: string;
}

export interface RawInscriptionInfo extends TokenInfo {
  expected_supply: bigint;
  mint_limit: bigint;
  mint_status: number;
  udt_hash: string;
}

export interface XudtCell {
  amount: bigint;
  is_consumed: boolean;
  type_id: string;
  addressByTypeId: {
    token_info: TokenInfo | null;
    token_infos: RawInscriptionInfo[];
    script_args: string;
  };
}

export interface InscriptionInfo extends TokenInfo {
  expected_supply: bigint;
  mint_limit: bigint;
  mint_status: MintStatus;
  udt_hash: string;
}

export interface ProcessedXudtCell {
  amount: bigint;
  is_consumed: boolean;
  type_id: string;
  addressByTypeId: {
    token_info: TokenInfo | null;
    inscription_infos: InscriptionInfo[];
    script_args: string;
  };
}

export interface ClusterInfo {
  cluster_description: string;
  cluster_name: string;
  created_at: string;
  id: string;
  is_burned: boolean;
  mutant_id: string;
  owner_address: string;
  updated_at: string;
  addressByTypeId: {
    script_args: string;
    script_code_hash: string;
    script_hash_type: number;
  };
}

export interface SporeInfo {
  cluster_id: string;
  content: string;
  content_type: string;
  created_at: string;
  id: string;
  is_burned: boolean;
  owner_address: string;
  updated_at: string;
  addressByTypeId: {
    script_args: string;
    script_code_hash: string;
    script_hash_type: number;
  };
}

export interface SporeAction {
  cluster: ClusterInfo;
  spore: SporeInfo;
}

export interface Balance {
  address: string;
  total_satoshi: number;
  pending_satoshi: number;
  satoshi: number;
  available_satoshi: number;
  dust_satoshi: number;
  rgbpp_satoshi: number;
  utxo_count: number;
}

export interface AssetDetails {
  xudtCells: ProcessedXudtCell[];
  sporeActions: SporeAction[];
}

export interface QueryResult {
  balance: Balance;
  assets: AssetDetails;
}

interface GraphQLResponse {
  xudtCell: XudtCell | null;
  sporeActions: SporeAction | null;
}

// GraphQL 查询常量
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
    token_info(where: {udt_hash: {_eq: $udtHash}}) {
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

export class RgbppSDK {
  private service: BtcAssetsApi;
  private client: ApolloClient<NormalizedCacheObject>;
  private isMainnet: boolean;

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
   * 获取交易详情
   * @param btcAddress BTC地址
   * @param afterTxId 可选,用于分页
   * @returns 交易详情数组
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
   * 获取资产和查询详情
   * @param btcAddress BTC地址
   * @returns 查询结果,包含余额和资产详情
   */
  public async fetchAssetsAndQueryDetails(
    btcAddress: string,
  ): Promise<QueryResult> {
    try {
      const [balance, assets] = await Promise.all([
        this.service.getBtcBalance(btcAddress),
        this.service.getRgbppAssetsByBtcAddress(btcAddress),
      ]);

      const validAssets = assets.filter((
        asset,
      ): asset is typeof asset & { outPoint: OutPoint } => !!asset.outPoint);

      if (validAssets.length === 0) {
        return { balance, assets: { xudtCells: [], sporeActions: [] } };
      }

      const assetDetails = await Promise.all(
        validAssets.map((asset) => this.queryAssetDetails(asset.outPoint)),
      );

      const processedXudtCells = await Promise.all(
        assetDetails
          .filter((
            result,
          ): result is {
            xudtCell: XudtCell;
            sporeActions: null | SporeAction;
          } => !!result.xudtCell)
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
   * 获取XUDT哈希
   * @param script_args 脚本参数
   * @returns XUDT哈希
   */
  private xudtHash(script_args: string): string {
    return this.removeHexPrefix(scriptToHash({
      ...getXudtTypeScript(this.isMainnet),
      args: this.formatHexPrefix(script_args),
    }));
  }

  /**
   * 格式化十六进制前缀
   * @param hexString 十六进制字符串
   * @returns 格式化后的字符串
   */
  private formatHexPrefix(hexString: string): string {
    return `\\x${hexString.replace(/^0x/, "")}`;
  }

  /**
   * 移除十六进制前缀
   * @param prefixedHexString 带前缀的十六进制字符串
   * @returns 移除前缀后的字符串
   */
  private removeHexPrefix(prefixedHexString: string): string {
    return `0x${prefixedHexString.replace(/^\\x/, "")}`;
  }

  /**
   * 查询原始铭文信息
   * @param udtHash UDT哈希
   * @returns 原始铭文信息数组
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
   * 查询资产详情
   * @param outPoint 输出点
   * @returns GraphQL响应
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
   * 处理XUDT单元格
   * @param cell XUDT单元格
   * @returns 处理后的XUDT单元格
   */
  private async processXudtCell(
    cell: XudtCell,
  ): Promise<ProcessedXudtCell> {
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
        inscription_infos: cell.addressByTypeId.token_infos.map((
          info,
        ) => ({
          ...info,
          mint_status: this.validateMintStatus(info.mint_status),
        })),
        script_args: cell.addressByTypeId.script_args,
      },
    };
  }

  /**
   * 验证铸造状态
   * @param status 状态值
   * @returns 验证后的MintStatus
   */
  private validateMintStatus(status: number): MintStatus {
    const validStatus = MintStatusMap[status];
    if (validStatus === undefined) {
      throw new Error(`Invalid MintStatus: ${status}`);
    }
    return validStatus;
  }
}
