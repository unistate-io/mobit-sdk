import { BTCTestnetType, Collector, IndexerCell } from "@rgbpp-sdk/ckb";
import { NetworkType } from "rgbpp";
import { BtcAssetsApi, DataSource } from "rgbpp";
import { ccc } from "@ckb-ccc/core";
/**
 * Base interface for user input to sign a transaction.
 */
interface BaseUserToSignInput {
    /** The index of the input to sign. */
    index: number;
    /** Optional sighash types for the signature. */
    sighashTypes?: number[] | undefined;
    /** Optional flag to disable tweaking the signer. */
    disableTweakSigner?: boolean;
}
/**
 * Input for signing with an address.
 */
export interface AddressUserToSignInput extends BaseUserToSignInput {
    /** The address to use for signing. */
    address: string;
}
/**
 * Input for signing with a public key.
 */
export interface PublicKeyUserToSignInput extends BaseUserToSignInput {
    /** The public key to use for signing. */
    publicKey: string;
}
/**
 * Union type for user sign input, can be either by address or public key.
 */
export type UserToSignInput = AddressUserToSignInput | PublicKeyUserToSignInput;
/**
 * Options for signing a PSBT (Partially Signed Bitcoin Transaction).
 */
export interface SignPsbtOptions {
    /** Whether to automatically finalize the PSBT after signing. Defaults to true. */
    autoFinalized?: boolean;
    /** Specific inputs to sign, if not all inputs are to be signed. */
    toSignInputs?: UserToSignInput[];
}
/**
 * AbstractWallet interface defines the contract for a wallet
 * that can sign PSBTs (Partially Signed Bitcoin Transactions).
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
 * TxResult interface represents the result of a transaction operation,
 * typically involving both Bitcoin and CKB transactions.
 */
export interface TxResult {
    /** The transaction ID of the Bitcoin transaction. */
    btcTxId: string;
    /** The transaction hash of the CKB transaction (optional). */
    ckbTxHash?: string;
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
     * The ccc.Client instance for more advanced CKB interactions.
     */
    cccClient: ccc.Client;
    /**
     * Constructs a new CkbHelper instance.
     * @param isMainnet - A boolean indicating whether the helper is interacting with the mainnet or testnet.
     * @param ckbClient - Optional ccc.Client instance. If not provided, a default client for the specified network will be created.
     */
    constructor(isMainnet: boolean, ckbClient?: ccc.Client);
}
/**
 * Creates a BTC service instance for interacting with RGBPP services.
 * @param btcTestnetType - The type of BTC testnet (e.g., "Testnet", "Signet"). If undefined, mainnet service is used.
 * @returns A BtcAssetsApi instance.
 */
export declare const createBtcService: (btcTestnetType?: BTCTestnetType) => BtcAssetsApi;
/**
 * BtcHelper class provides utility methods for interacting with the Bitcoin network,
 * including managing data sources and services for RGBPP operations.
 */
export declare class BtcHelper {
    btcDataSource: DataSource;
    btcTestnetType?: BTCTestnetType;
    btcService: BtcAssetsApi;
    wallet: AbstractWallet;
    networkType: NetworkType;
    /**
     * Constructs a new BtcHelper instance.
     * @param wallet - An instance of a wallet that implements the AbstractWallet interface.
     * @param networkType - The type of network (e.g., Mainnet, Testnet) the helper will interact with.
     * @param btcTestnetType - Optional parameter specifying the type of Bitcoin testnet (e.g., "Testnet", "Signet").
     */
    constructor(wallet: AbstractWallet, networkType: NetworkType, btcTestnetType?: BTCTestnetType);
}
/**
 * Fetches indexer cells for given CKB addresses and optional type script.
 * This function is enhanced to use `ccc.Client` for querying USDI cells directly via RPC
 * to ensure `blockNumber` and `txIndex` are available, falling back to `Collector` for other cell types.
 *
 * @param params - The parameters object.
 * @param params.ckbAddresses - The list of CKB addresses to query cells for.
 * @param params.collector - The `Collector` instance from `@rgbpp-sdk/ckb` for general cell fetching.
 * @param params.type - Optional CKB type script to filter cells by.
 * @param params.isMainnet - Optional boolean indicating mainnet (true) or testnet (false), defaults to true.
 * @returns A promise that resolves to an array of `IndexerCell` objects.
 */
export declare function getIndexerCells({ ckbAddresses, type, collector, isMainnet, }: {
    ckbAddresses: string[];
    collector: Collector;
    type?: CKBComponents.Script;
    isMainnet?: boolean;
}): Promise<IndexerCell[]>;
/**
 * Retrieves the cell dependencies required for a transaction involving a specific XUDT.
 * It checks for known XUDTs like iCKB and USDI to provide their specific cell dependencies.
 * If the XUDT is not a known special case, it falls back to fetching generic Type ID cell dependencies (for standard xUDT).
 *
 * @param isMainnet A boolean indicating whether the operation is on the mainnet.
 * @param xudtArgs The arguments of the XUDT's type script (0x-prefixed or not).
 * @returns A promise that resolves to an array of CKBComponents.CellDep.
 */
export declare function getCellDeps(isMainnet: boolean, xudtArgs: string): Promise<CKBComponents.CellDep[]>;
export {};
//# sourceMappingURL=helper.d.ts.map