import { Collector } from "@rgbpp-sdk/ckb";
/**
 * Parameters for creating a merged xUDT transaction.
 */
export interface CreateMergeXudtTransactionParams {
    /**
     * The xUDT type script args.
     */
    xudtArgs: string;
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
 * @param {string} params.xudtArgs - The xUDT type script args.
 * @param {string[]} params.ckbAddresses - The CKB addresses involved in the transaction.
 * @param {Collector} params.collector - The collector instance used to fetch cells and collect inputs.
 * @param {boolean} params.isMainnet - A boolean indicating whether the transaction is for the mainnet or testnet.
 * @param {string} [ckbAddress=params.ckbAddresses[0]] - The address for the output cell, defaulting to the first address in the input address set.
 * @param {bigint} [feeRate] - The fee rate for the transaction, optional.
 * @param {bigint} [maxFee=MAX_FEE] - The maximum fee for the transaction, defaulting to MAX_FEE.
 * @param {number} [witnessLockPlaceholderSize] - The size of the witness lock placeholder, optional.
 * @returns {Promise<CKBComponents.RawTransactionToSign>} An unsigned transaction object.
 */
export declare function createMergeXudtTransaction({ xudtArgs, ckbAddresses, collector, isMainnet, }: CreateMergeXudtTransactionParams, ckbAddress?: string, feeRate?: bigint, maxFee?: bigint, witnessLockPlaceholderSize?: number): Promise<CKBComponents.RawTransactionToSign>;
//# sourceMappingURL=merge.d.ts.map