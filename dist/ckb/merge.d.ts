import { Collector } from "@rgbpp-sdk/ckb";
interface CreateMergeXudtTransactionParams {
    xudtArgs: string;
    ckbAddresses: string[];
    collector: Collector;
    isMainnet: boolean;
    ckbAddress: string;
}
/**
 * Merges multiple xUDT cells into a single xUDT cell and returns the remaining capacity as a separate cell.
 * @param xudtArgs The xUDT type script args
 * @param ckbAddresses The CKB addresses involved in the transaction
 * @param collector The collector instance used to fetch cells and collect inputs
 * @param isMainnet A boolean indicating whether the transaction is for the mainnet or testnet
 * @param ckbAddress The address for the output cell, defaulting to the first address in the input address set
 * @returns An unsigned transaction object
 */
export declare function createMergeXudtTransaction({ xudtArgs, ckbAddresses, collector, isMainnet, ckbAddress, }: CreateMergeXudtTransactionParams): Promise<CKBComponents.RawTransactionToSign>;
export {};
