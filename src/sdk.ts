import { ApolloClient, gql } from "@apollo/client/core";
import { InMemoryCache, NormalizedCacheObject } from "@apollo/client/cache";
import { BatchHttpLink } from "@apollo/client/link/batch-http";
import { BTCTestnetType } from "@rgbpp-sdk/ckb";
import { BtcApiTransaction, BtcAssetsApi } from "@rgbpp-sdk/service";
import { createBtcService } from "./helper";

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
                .map((asset) => {
                    const outPoint = asset.outPoint!;
                    return this.queryAssetDetails(
                        this.formatTxHash(outPoint.txHash),
                        Number(outPoint.index),
                    );
                });

            const assetResults = await Promise.all(assetQueries);

            const assetsResult: AssetDetails = {
                xudtCells: assetResults.flatMap((result) =>
                    result.xudtCell ? [result.xudtCell] : []
                ),
                sporeActions: assetResults.flatMap((result) =>
                    result.sporeAction || []
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
        transactionHash: string,
        transactionIndex: number,
    ) {
        const query = gql`
            query AssetDetails($txHash: bytea!, $txIndex: Int!) {
                xudtCell: xudt_cell_by_pk(transaction_hash: $txHash, transaction_index: $txIndex) {
                    amount is_consumed type_id
                    addressByTypeId {
                        script_args
                        token_info { decimal name symbol }
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
            variables: { txHash: transactionHash, txIndex: transactionIndex },
        });

        return {
            xudtCell: data.xudtCell,
            sporeAction: data.sporeActions,
        };
    }
}
