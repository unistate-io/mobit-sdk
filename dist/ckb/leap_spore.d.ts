import { Signer } from "@ckb-ccc/core";
import { BTCTestnetType, Collector } from "@rgbpp-sdk/ckb";
export interface LeapSporeToBtcParams {
    outIndex: number;
    btcTxId: string;
    sporeTypeArgs: string;
    isMainnet: boolean;
    collector: Collector;
    ckbAddress: string;
    btcTestnetType?: BTCTestnetType;
    cccSigner: Signer;
}
export declare const leapSporeFromCkbToBtc: ({ outIndex, btcTxId, sporeTypeArgs, isMainnet, collector, ckbAddress, btcTestnetType, cccSigner, }: LeapSporeToBtcParams) => Promise<string>;
