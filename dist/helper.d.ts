import { NetworkType } from "rgbpp";
import { BtcAssetsApi, DataSource } from "rgbpp";
import * as ccc from "@ckb-ccc/core";
import { BTCTestnetType, Collector, IndexerCell } from "@rgbpp-sdk/ckb";
export declare const signAndSendTransaction: (transaction: CKBComponents.RawTransactionToSign, collector: Collector, cccSigner: ccc.Signer) => Promise<{
    txHash: string;
}>;
interface BaseUserToSignInput {
    index: number;
    sighashTypes?: number[] | undefined;
    disableTweakSigner?: boolean;
}
export interface AddressUserToSignInput extends BaseUserToSignInput {
    address: string;
}
export interface PublicKeyUserToSignInput extends BaseUserToSignInput {
    publicKey: string;
}
export type UserToSignInput = AddressUserToSignInput | PublicKeyUserToSignInput;
export interface SignPsbtOptions {
    autoFinalized?: boolean;
    toSignInputs?: UserToSignInput[];
}
export interface AbstractWallet {
    signPsbt(psbtHex: string): Promise<string>;
}
export declare class CkbHelper {
    collector: Collector;
    isMainnet: boolean;
    constructor(isMainnet: boolean);
}
export declare class BtcHelper {
    btcDataSource: DataSource;
    btcTestnetType?: BTCTestnetType;
    btcService: BtcAssetsApi;
    unisat: AbstractWallet;
    networkType: NetworkType;
    constructor(unisat: AbstractWallet, networkType: NetworkType, btcTestnetType?: BTCTestnetType);
}
export interface TxResult {
    btcTxId: string;
    ckbTxHash?: string;
    error?: any;
}
export declare function getIndexerCells({ ckbAddresses, type, collector }: {
    ckbAddresses: string[];
    collector: Collector;
    type?: CKBComponents.Script;
}): Promise<IndexerCell[]>;
export declare function getAddressCellDeps(isMainnet: boolean, ckbAddresses: string[]): Promise<CKBComponents.CellDep[]>;
export {};
