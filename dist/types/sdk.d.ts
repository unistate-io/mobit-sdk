import { BTCTestnetType } from "@rgbpp-sdk/ckb";
import { BtcApiTransaction } from "@rgbpp-sdk/service";
/**
 * 枚举表示铭文的铸造状态。
 */
export declare enum MintStatus {
    MINTABLE = 0,// 铭文可以继续铸造
    MINT_CLOSED = 1,// 铭文铸造已结束
    REBASE_STARTED = 2
}
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
    private isMainnet;
    constructor(isMainnet: boolean, btcTestnetType?: BTCTestnetType);
    /**
     * 获取交易详情
     * @param btcAddress BTC地址
     * @param afterTxId 可选,用于分页
     * @returns 交易详情数组
     */
    fetchTxsDetails(btcAddress: string, afterTxId?: string): Promise<BtcApiTransaction[]>;
    /**
     * 获取资产和查询详情
     * @param btcAddress BTC地址
     * @returns 查询结果,包含余额和资产详情
     */
    fetchAssetsAndQueryDetails(btcAddress: string): Promise<QueryResult>;
    /**
     * 获取XUDT哈希
     * @param script_args 脚本参数
     * @returns XUDT哈希
     */
    private xudtHash;
    /**
     * 格式化十六进制前缀
     * @param hexString 十六进制字符串
     * @returns 格式化后的字符串
     */
    private formatHexPrefix;
    /**
     * 移除十六进制前缀
     * @param prefixedHexString 带前缀的十六进制字符串
     * @returns 移除前缀后的字符串
     */
    private removeHexPrefix;
    /**
     * 查询原始铭文信息
     * @param udtHash UDT哈希
     * @returns 原始铭文信息数组
     */
    private queryRawInscriptionInfo;
    /**
     * 查询资产详情
     * @param outPoint 输出点
     * @returns GraphQL响应
     */
    private queryAssetDetails;
    /**
     * 处理XUDT单元格
     * @param cell XUDT单元格
     * @returns 处理后的XUDT单元格
     */
    private processXudtCell;
    /**
     * 验证铸造状态
     * @param status 状态值
     * @returns 验证后的MintStatus
     */
    private validateMintStatus;
}
