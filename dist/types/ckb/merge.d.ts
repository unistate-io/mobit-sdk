import { Collector } from "@rgbpp-sdk/ckb";
/**
 * Parameters for creating a merged xUDT transaction.
 */
export interface CreateMergeXudtTransactionParams {
    /**
     * The xUDT type script.
     */
    xudtType: CKBComponents.Script;
    /**
     * The CKB addresses involved in the transaction.
     */
    ckbAddresses: string[];
    /**
     * The collector instance used to fetch cells and collect inputs.
     */
    collector: Collector;
    /**
     * A boolean indicating whether the transaction is for the mainnet or testnet.
     */
    isMainnet: boolean;
}
/**
 * Merges multiple xUDT cells into a single xUDT cell and returns the remaining capacity as a separate cell.
 * @param {CreateMergeXudtTransactionParams} params - The parameters object.
 * @param {CKBComponents.Script} params.xudtType - The xUDT type script.
 * @param {string[]} params.ckbAddresses - The CKB addresses involved in the transaction.
 * @param {Collector} params.collector - The collector instance used to fetch cells and collect inputs.
 * @param {boolean} params.isMainnet - A boolean indicating whether the transaction is for the mainnet or testnet.
 * @param {string} [ckbAddress=params.ckbAddresses[0]] - The address for the output cell, defaulting to the first address in the input address set.
 * @returns {Promise<CKBComponents.RawTransactionToSign>} An unsigned transaction object.
 */
export declare function createMergeXudtTransaction({ xudtType, ckbAddresses, collector, isMainnet, }: CreateMergeXudtTransactionParams, ckbAddress?: string): Promise<CKBComponents.RawTransactionToSign>;
//# sourceMappingURL=merge.d.ts.map