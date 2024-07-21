import { BTCTestnetType, Collector, Hex } from "@rgbpp-sdk/ckb";
import { BtcAssetsApi, DataSource } from "rgbpp";
import { AbstractWallet } from "../helper";
interface SporeTransferCombinedParams {
    toBtcAddress: string;
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
export declare const transferSporeCombined: ({ toBtcAddress, sporeTypeArgs, collector, isMainnet, btcTestnetType, fromBtcAddress, fromBtcAddressPubkey, btcDataSource, unisat, btcService, }: SporeTransferCombinedParams) => Promise<{
    error: Error;
    btcTxId: string;
} | {
    btcTxId: string;
    error?: undefined;
}>;
export {};
