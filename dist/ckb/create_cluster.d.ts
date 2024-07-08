import { Collector, RawClusterData } from "@rgbpp-sdk/ckb";
interface ClusterCreateTransactionParams {
    ckbAddress: string;
    collector: Collector;
    isMainnet: boolean;
    clusterData: RawClusterData;
}
export declare function createClusterTransaction({ ckbAddress, collector, isMainnet, clusterData }: ClusterCreateTransactionParams): Promise<CKBComponents.RawTransactionToSign>;
export {};
