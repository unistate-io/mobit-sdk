import * as ccc from "@ckb-ccc/core";
import { BTCTestnetType, Collector, RawSporeData } from "@rgbpp-sdk/ckb";
import { BtcAssetsApi, DataSource } from "rgbpp";
import { AbstractWallet, TxResult } from "../helper";
interface SporeCreateCombinedParams {
    clusterTypeScriptArgs: string;
    receivers: {
        toBtcAddress: string;
        sporeData: RawSporeData;
    }[];
    collector: Collector;
    isMainnet: boolean;
    btcTestnetType?: BTCTestnetType;
    fromBtcAccount: string;
    fromBtcAccountPubkey?: string;
    btcDataSource: DataSource;
    unisat: AbstractWallet;
    ckbAddress: string;
    btcService: BtcAssetsApi;
    cccSigner: ccc.Signer;
}
export declare const createSporesCombined: ({ clusterTypeScriptArgs, receivers, collector, isMainnet, btcTestnetType, fromBtcAccount, fromBtcAccountPubkey, btcDataSource, unisat, btcService, ckbAddress, cccSigner, }: SporeCreateCombinedParams) => Promise<TxResult>;
export {};
