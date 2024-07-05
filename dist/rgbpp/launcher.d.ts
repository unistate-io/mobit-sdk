import { BTCTestnetType, Collector, RgbppTokenInfo } from "@rgbpp-sdk/ckb";
import { DataSource } from "@rgbpp-sdk/btc";
import { BtcAssetsApi } from "rgbpp";
import { BtcApiUtxo } from "@rgbpp-sdk/service";
import { AbstractWallet } from "../helper";
import * as ccc from "@ckb-ccc/core";
interface RgbppLauncerCombinedParams {
    rgbppTokenInfo: RgbppTokenInfo;
    collector: Collector;
    isMainnet: boolean;
    btcTestnetType?: BTCTestnetType;
    btcAccount: string;
    btcAccountPubkey?: string;
    btcDataSource: DataSource;
    launchAmount: bigint;
    btcService: BtcAssetsApi;
    ckbAddress: string;
    cccSigner: ccc.Signer;
    filterUtxo: (utxos: BtcApiUtxo[]) => Promise<{
        outIndex: number;
        btcTxId: string;
    }>;
    unisat: AbstractWallet;
}
export declare const launchCombined: ({ rgbppTokenInfo, collector, isMainnet, btcTestnetType, btcAccount, btcDataSource, btcAccountPubkey, launchAmount, ckbAddress, filterUtxo, btcService, unisat, cccSigner }: RgbppLauncerCombinedParams) => Promise<void>;
export {};
