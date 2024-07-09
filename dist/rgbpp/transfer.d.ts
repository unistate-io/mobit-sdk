import { BtcAssetsApi } from "rgbpp";
import { BTCTestnetType, Collector } from "@rgbpp-sdk/ckb";
import { DataSource } from "@rgbpp-sdk/btc";
import { AbstractWallet } from "../helper";
interface RgbppTransferCombinedParams {
    toBtcAddress: string;
    xudtTypeArgs: string;
    transferAmount: bigint;
    collector: Collector;
    btcDataSource: DataSource;
    btcTestnetType?: BTCTestnetType;
    isMainnet: boolean;
    fromBtcAccount: string;
    fromBtcAccountPubkey?: string;
    unisat: AbstractWallet;
    btcService: BtcAssetsApi;
}
export declare const transferCombined: ({ toBtcAddress, xudtTypeArgs, transferAmount, collector, btcDataSource, btcTestnetType, isMainnet, fromBtcAccount, fromBtcAccountPubkey, unisat, btcService, }: RgbppTransferCombinedParams) => Promise<{
    btcTxId: string;
    error?: any;
}>;
export {};
