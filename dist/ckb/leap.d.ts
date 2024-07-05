import { Signer } from "@ckb-ccc/core";
import { BTCTestnetType, Collector } from "@rgbpp-sdk/ckb";
export interface LeapToBtcParams {
    outIndex: number;
    btcTxId: string;
    xudtTypeArgs: string;
    transferAmount: bigint;
    isMainnet: boolean;
    collector: Collector;
    ckbAddress: string;
    btcTestnetType?: BTCTestnetType;
    cccSigner: Signer;
}
export declare const leapFromCkbToBtc: ({ outIndex, btcTxId, xudtTypeArgs, transferAmount, isMainnet, collector, ckbAddress, btcTestnetType, cccSigner, }: LeapToBtcParams) => Promise<void>;
