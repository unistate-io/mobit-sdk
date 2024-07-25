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
/**
 * Leap a spore from CKB to BTC.
 *
 * @param params - The parameters for leaping a spore from CKB to BTC.
 * @param params.outIndex - The output index of the spore.
 * @param params.btcTxId - The transaction ID of the BTC transaction.
 * @param params.sporeTypeArgs - The type arguments for the spore.
 * @param params.isMainnet - A flag indicating whether the operation is on the mainnet.
 * @param params.collector - The collector instance.
 * @param params.ckbAddress - The CKB address.
 * @param params.btcTestnetType - (Optional) The type of BTC testnet.
 * @param params.cccSigner - The signer instance for CCC.
 * @param feeRate - (Optional) The fee rate for the transaction.
 * @returns A promise that resolves to the transaction hash of the CKB transaction.
 */
export declare const leapSporeFromCkbToBtc: ({ outIndex, btcTxId, sporeTypeArgs, isMainnet, collector, ckbAddress, btcTestnetType, cccSigner, }: LeapSporeToBtcParams, feeRate?: bigint) => Promise<string>;
