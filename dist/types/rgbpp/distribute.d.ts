import { DataSource } from "@rgbpp-sdk/btc";
import { BTCTestnetType, Collector, RgbppBtcAddressReceiver } from "@rgbpp-sdk/ckb";
import { BtcAssetsApi } from "rgbpp";
import { AbstractWallet, TxResult } from "../helper";
interface RgbppDistributeCombinedParams {
    receivers: RgbppBtcAddressReceiver[];
    xudtTypeArgs: string;
    collector: Collector;
    btcDataSource: DataSource;
    btcTestnetType?: BTCTestnetType;
    isMainnet: boolean;
    fromBtcAccount: string;
    fromBtcAccountPubkey?: string;
    unisat: AbstractWallet;
    filterRgbppArgslist: (argsList: string[]) => Promise<string[]>;
    btcService: BtcAssetsApi;
}
export declare const distributeCombined: ({ xudtTypeArgs, receivers, collector, btcDataSource, btcTestnetType, isMainnet, fromBtcAccount, fromBtcAccountPubkey, unisat, filterRgbppArgslist, btcService, }: RgbppDistributeCombinedParams) => Promise<TxResult>;
export {};