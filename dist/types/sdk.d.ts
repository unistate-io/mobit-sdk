import { BTCTestnetType } from "@rgbpp-sdk/ckb";
import { BtcApiTransaction } from "@rgbpp-sdk/service";
interface TokenInfo {
    decimal: number;
    name: string;
    symbol: string;
}
interface XudtCell {
    amount: bigint;
    is_consumed: boolean;
    type_id: string;
    addressByTypeId: {
        token_info: TokenInfo | null;
        script_args: string;
    };
}
interface ClusterInfo {
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
interface SporeInfo {
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
interface SporeAction {
    cluster: ClusterInfo;
    spore: SporeInfo;
}
interface Balance {
    address: string;
    total_satoshi: number;
    pending_satoshi: number;
    satoshi: number;
    available_satoshi: number;
    dust_satoshi: number;
    rgbpp_satoshi: number;
    utxo_count: number;
}
interface AssetDetails {
    xudtCells: XudtCell[];
    sporeActions: SporeAction[];
}
interface QueryResult {
    balance: Balance;
    assets: AssetDetails;
}
export declare class RgbppSDK {
    private service;
    private client;
    constructor(isMainnet: boolean, btcTestnetType?: BTCTestnetType);
    fetchTxsDetails(btcAddress: string, afterTxId?: string): Promise<BtcApiTransaction[]>;
    fetchAssetsAndQueryDetails(btcAddress: string): Promise<QueryResult>;
    private formatTxHash;
    private queryAssetDetails;
}
export {};
