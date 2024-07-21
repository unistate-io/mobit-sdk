import { BTCTestnetType, Collector, Hex } from "@rgbpp-sdk/ckb";
import { BtcAssetsApi, DataSource } from "rgbpp";
import { AbstractWallet, TxResult } from "../helper";
interface SporeLeapCombinedParams {
    toCkbAddress: string;
    sporeTypeArgs: Hex;
    collector: Collector;
    isMainnet: boolean;
    btcTestnetType?: BTCTestnetType;
    fromBtcAddress: string;
    fromBtcAddressPubkey?: string;
    btcDataSource: DataSource;
    unisat: AbstractWallet;
    btcService: BtcAssetsApi;
}
export declare const leapSporeFromBtcToCkbCombined: ({ toCkbAddress, sporeTypeArgs, collector, isMainnet, btcTestnetType, fromBtcAddress, fromBtcAddressPubkey, btcDataSource, unisat, btcService, }: SporeLeapCombinedParams) => Promise<TxResult>;
export {};
