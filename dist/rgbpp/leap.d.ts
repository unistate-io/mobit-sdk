import { BTCTestnetType, Collector } from "@rgbpp-sdk/ckb";
import { BtcAssetsApi, DataSource } from "rgbpp";
import { AbstractWallet } from "../helper";
interface LeapToCkbParams {
    rgbppLockArgsList: string[];
    toCkbAddress: string;
    xudtTypeArgs: string;
    transferAmount: bigint;
    isMainnet: boolean;
    collector: Collector;
    btcTestnetType?: BTCTestnetType;
    fromBtcAccount: string;
    fromBtcAccountPubkey?: string;
    btcDataSource: DataSource;
    btcService: BtcAssetsApi;
    unisat: AbstractWallet;
}
export declare const leapFromBtcToCKB: ({ rgbppLockArgsList, toCkbAddress, xudtTypeArgs, transferAmount, isMainnet, collector, btcTestnetType, fromBtcAccountPubkey, fromBtcAccount, btcDataSource, btcService, unisat }: LeapToCkbParams) => Promise<void>;
export {};
