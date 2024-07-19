import * as ccc from "@ckb-ccc/core";
import { BTCTestnetType, Collector, RawClusterData } from "@rgbpp-sdk/ckb";
import { BtcApiUtxo } from "@rgbpp-sdk/service";
import { BtcAssetsApi, DataSource } from "rgbpp";
import { AbstractWallet, TxResult } from "../helper";
interface createClusterCombinedParams {
    ckbAddress: string;
    clusterData: RawClusterData;
    collector: Collector;
    isMainnet: boolean;
    btcTestnetType?: BTCTestnetType;
    fromBtcAccount: string;
    fromBtcAccountPubkey?: string;
    btcDataSource: DataSource;
    unisat: AbstractWallet;
    btcService: BtcAssetsApi;
    filterUtxo: (utxos: BtcApiUtxo[]) => Promise<{
        outIndex: number;
        btcTxId: string;
    }>;
    cccSigner: ccc.Signer;
}
export declare const createClusterCombined: ({ clusterData, fromBtcAccount, fromBtcAccountPubkey, collector, isMainnet, btcTestnetType, btcDataSource, ckbAddress, filterUtxo, btcService, unisat, cccSigner, }: createClusterCombinedParams) => Promise<TxResult>;
export {};
