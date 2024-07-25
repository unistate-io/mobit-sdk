import { ApolloClient, gql } from "@apollo/client/core";
import { InMemoryCache, NormalizedCacheObject } from "@apollo/client/cache";
import { BatchHttpLink } from "@apollo/client/link/batch-http";
import { BTCTestnetType } from "@rgbpp-sdk/ckb";
import { BtcApiTransaction, BtcAssetsApi } from "@rgbpp-sdk/service";
import { createBtcService } from "./helper";

/**
 * 枚举表示铭文的铸造状态。
 * Enumeration representing the minting status of an inscription.
 */
export enum MintStatus {
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

// Interfaces
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

interface GraphQLResponse {
    xudtCell: XudtCell | null;
    sporeActions: SporeAction | null;
}

// Main SDK class
export class RgbppSDK {
    private service: BtcAssetsApi;
    private client: ApolloClient<NormalizedCacheObject>;

    constructor(isMainnet: boolean, btcTestnetType?: BTCTestnetType) {
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

    public async fetchAssetsAndQueryDetails(
        btcAddress: string,
    ): Promise<QueryResult> {
        try {
            const [assets, balance] = await Promise.all([
                this.service.getRgbppAssetsByBtcAddress(btcAddress),
                this.service.getBtcBalance(btcAddress),
            ]);

            const assetQueries = assets
                .filter((asset) => asset.outPoint)
                .map((asset) => this.queryAssetDetails(asset.outPoint!));

            const assetResults = await Promise.all(assetQueries);

            const assetsResult: AssetDetails = {
                xudtCells: assetResults.flatMap((result) =>
                    result.xudtCell
                        ? [this.processXudtCell(result.xudtCell)]
                        : []
                ),
                sporeActions: assetResults.flatMap((result) =>
                    result.sporeActions ? [result.sporeActions] : []
                ),
            };

            return { balance, assets: assetsResult };
        } catch (error) {
            console.error("Error fetching assets and details:", error);
            throw error;
        }
    }

    private formatTxHash(txHash: string): string {
        return `\\x${txHash.replace(/^0x/, "")}`;
    }

    private async queryAssetDetails(
        outPoint: { txHash: string; index: string },
    ): Promise<GraphQLResponse> {
        const query = gql`
            query AssetDetails($txHash: bytea!, $txIndex: Int!) {
                xudtCell: xudt_cell_by_pk(transaction_hash: $txHash, transaction_index: $txIndex) {
                    amount is_consumed type_id
                    addressByTypeId {
                        script_args
                        token_info { 
                            decimal name symbol expected_supply 
                            mint_limit mint_status udt_hash 
                        }
                    }
                }
                sporeActions: spore_actions_by_pk(tx: $txHash) {
                    cluster {
                        cluster_description cluster_name created_at id
                        is_burned mutant_id owner_address updated_at
                        address {
                            script_args
                        }
                    }
                    spore {
                        cluster_id content content_type created_at id
                        is_burned owner_address updated_at
                        address {
                            script_args
                        }
                    }
                }
            }
        `;

        const { data } = await this.client.query({
            query,
            variables: {
                txHash: this.formatTxHash(outPoint.txHash),
                txIndex: Number(outPoint.index),
            },
        });

        return data as GraphQLResponse;
    }

    private processXudtCell(cell: XudtCell): ProcessedXudtCell {
        const { token_info, ...restAddressTypeId } = cell.addressByTypeId;

        const processedCell: ProcessedXudtCell = {
            ...cell,
            addressByTypeId: {
                ...restAddressTypeId,
                token_info: token_info
                    ? {
                        ...token_info,
                        mint_status: this.validateMintStatus(
                            token_info.mint_status,
                        ),
                    }
                    : null,
            },
        };

        return processedCell;
    }

    private validateMintStatus(status: number | null): MintStatus | null {
        if (status) {
            if (status in MintStatus) {
                return status as MintStatus;
            }
            throw new Error(`Invalid MintStatus: ${status}`);
        }
        return null;
    }
}
