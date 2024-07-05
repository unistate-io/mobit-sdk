import { Collector } from "@rgbpp-sdk/ckb";
interface CreateMergeXudtTransactionParams {
    xudtArgs: string;
    ckbAddress: string;
    collector: Collector;
    isMainnet: boolean;
}
/**
 * Merges multiple xUDT cells into a single xUDT cell and returns the remaining capacity as a separate cell.
 * @param xudtArgs The xUDT type script args
 * @param ckbAddress The CKB address for the transaction
 * @param collector The collector instance used to fetch cells and collect inputs
 * @param isMainnet A boolean indicating whether the network is mainnet or testnet
 * @returns An unsigned transaction object
 */
export declare function createMergeXudtTransaction({ xudtArgs, ckbAddress, collector, isMainnet }: CreateMergeXudtTransactionParams): Promise<CKBComponents.RawTransactionToSign>;
export {};
