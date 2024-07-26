import { BTCTestnetType } from "@rgbpp-sdk/ckb";
import { BtcApiTransaction } from "@rgbpp-sdk/service";
/**
 * 枚举表示铭文的铸造状态。
 * Enumeration representing the minting status of an inscription.
 */
export declare enum MintStatus {
  /**
   * 0: 表示铭文可以继续铸造
   * 0: This status indicates that the inscription can still be minted.
   */
  MINTABLE = 0,
  /**
   * 1: 表示铭文铸造已结束
   * 1: This status indicates that the minting of the inscription has been closed.
   */
  MINT_CLOSED = 1,
  /**
   * 2: 表示铭文已进入 rebase 阶段
   * 2: This status indicates that the inscription has entered the rebase phase.
   */
  REBASE_STARTED = 2,
}
export interface TokenInfo {
  decimal: number;
  name: string;
  symbol: string;
  expected_supply: bigint | null;
  mint_limit: bigint | null;
  mint_status: number | null;
  udt_hash: string | null;
}
export interface XudtCell {
  amount: bigint;
  is_consumed: boolean;
  type_id: string;
  addressByTypeId: {
    token_info: TokenInfo | null;
    script_args: string;
  };
}
export interface ProcessedTokenInfo {
  decimal: number;
  name: string;
  symbol: string;
  expected_supply: bigint | null;
  mint_limit: bigint | null;
  mint_status: MintStatus | null;
  udt_hash: string | null;
}
export interface ProcessedXudtCell {
  amount: bigint;
  is_consumed: boolean;
  type_id: string;
  addressByTypeId: {
    token_info: ProcessedTokenInfo | null;
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
  address: {
    script_args: string;
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
  address: {
    script_args: string;
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
export declare class RgbppSDK {
  private service;
  private client;
  constructor(isMainnet: boolean, btcTestnetType?: BTCTestnetType);
  fetchTxsDetails(
    btcAddress: string,
    afterTxId?: string,
  ): Promise<BtcApiTransaction[]>;
  fetchAssetsAndQueryDetails(btcAddress: string): Promise<QueryResult>;
  private formatTxHash;
  private queryAssetDetails;
  private processXudtCell;
  private validateMintStatus;
}
