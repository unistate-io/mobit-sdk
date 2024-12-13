import { BTCTestnetType, Collector, IndexerCell } from "@rgbpp-sdk/ckb";
import { NetworkType } from "rgbpp";
import { BtcAssetsApi, DataSource } from "rgbpp";
interface BaseUserToSignInput {
    index: number;
    sighashTypes?: number[] | undefined;
    disableTweakSigner?: boolean;
}
/**
 * Input for signing with an address.
 */
export interface AddressUserToSignInput extends BaseUserToSignInput {
    address: string;
}
/**
 * Input for signing with a public key.
 */
export interface PublicKeyUserToSignInput extends BaseUserToSignInput {
    publicKey: string;
}
/**
 * Union type for user sign input.
 */
export type UserToSignInput = AddressUserToSignInput | PublicKeyUserToSignInput;
/**
 * Options for signing a PSBT.
 */
export interface SignPsbtOptions {
    autoFinalized?: boolean;
    toSignInputs?: UserToSignInput[];
}
/**
 * AbstractWallet interface defines the contract for a wallet that can sign PSBTs (Partially Signed Bitcoin Transactions).
 */
export interface AbstractWallet {
    /**
     * Signs a PSBT (Partially Signed Bitcoin Transaction) given its hexadecimal representation.
     * @param psbtHex - The hexadecimal string representation of the PSBT to be signed.
     * @returns A promise that resolves to the signed PSBT in hexadecimal format.
     */
    signPsbt(psbtHex: string): Promise<string>;
}
/**
 * CkbHelper class provides utility methods for interacting with the CKB (Nervos Network) blockchain.
 */
export declare class CkbHelper {
    /**
     * The collector instance used for collecting data from the CKB blockchain.
     */
    collector: Collector;
    /**
     * A boolean indicating whether the helper is interacting with the mainnet.
     */
    isMainnet: boolean;
    /**
     * Constructs a new CkbHelper instance.
     * @param {boolean} isMainnet - A boolean indicating whether the helper is interacting with the mainnet or testnet.
     */
    constructor(isMainnet: boolean);
}
/**
 * Creates a BTC service instance.
 * @param {BTCTestnetType} btcTestnetType - The type of BTC testnet.
 * @returns {BtcAssetsApi} A BtcAssetsApi instance.
 */
export declare const createBtcService: (btcTestnetType?: BTCTestnetType) => BtcAssetsApi;
/**
 * BtcHelper class provides utility methods for interacting with the Bitcoin network, including managing data sources and services.
 */
export declare class BtcHelper {
    /**
     * The data source used for interacting with the Bitcoin network.
     */
    btcDataSource: DataSource;
    /**
     * Optional parameter specifying the type of Bitcoin testnet.
     */
    btcTestnetType?: BTCTestnetType;
    /**
     * The service used for managing Bitcoin assets.
     */
    btcService: BtcAssetsApi;
    /**
     * The wallet instance used for signing transactions.
     */
    wallet: AbstractWallet;
    /**
     * The type of network the helper is interacting with.
     */
    networkType: NetworkType;
    /**
     * Constructs a new BtcHelper instance.
     * @param {AbstractWallet} wallet - An instance of a wallet that implements the AbstractWallet interface.
     * @param {NetworkType} networkType - The type of network (e.g., Mainnet, Testnet) the helper will interact with.
     * @param {BTCTestnetType} btcTestnetType - Optional parameter specifying the type of Bitcoin testnet (e.g., Signet, Testnet3).
     */
    constructor(wallet: AbstractWallet, networkType: NetworkType, btcTestnetType?: BTCTestnetType);
}
/**
 * Result interface for transaction operations.
 */
export interface TxResult {
    /**
     * The transaction ID of the Bitcoin transaction.
     */
    btcTxId: string;
    /**
     * The transaction hash of the CKB transaction, optional.
     */
    ckbTxHash?: string;
}
/**
 * Fetches indexer cells for given addresses.
 * @param {Object} params - The parameters object.
 * @param {string[]} params.ckbAddresses - The list of CKB addresses.
 * @param {Collector} params.collector - The collector instance.
 * @param {CKBComponents.Script} [params.type] - Optional type script.
 * @returns {Promise<IndexerCell[]>} A promise that resolves to an array of IndexerCell.
 */
export declare function getIndexerCells({ ckbAddresses, type, collector, }: {
    ckbAddresses: string[];
    collector: Collector;
    type?: CKBComponents.Script;
}): Promise<IndexerCell[]>;
export declare function getCellDeps(isMainnet: boolean, xudtArgs: string): Promise<CKBComponents.CellDep[]>;
export {};
//# sourceMappingURL=helper.d.ts.map