import { bitcoin } from "@rgbpp-sdk/btc";
import { BtcAssetsApi } from "rgbpp";
import { AbstractWallet } from "./helper";
export declare function signAndSendPsbt(psbt: bitcoin.Psbt, unisat: AbstractWallet, service: BtcAssetsApi): Promise<{
    txId: string;
    txHex: string;
    rawTxHex: string;
}>;
