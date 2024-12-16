import { Collector } from "@rgbpp-sdk/ckb";
/**
 * Parameters for creating a transaction to transfer xUDT assets.
 */
export interface CreateTransferXudtTransactionParams {
    /**
     * The xUDT type script.
     */
    xudtType: CKBComponents.Script;
    /**
     * An array of receiver objects containing `toAddress` and `transferAmount`.
     */
    receivers: {
        toAddress: string;
        transferAmount: bigint;
    }[];
    /**
     * The CKB addresses for the transaction.
     */
    ckbAddresses: string[];
    /**
     * The collector instance used to fetch cells and collect inputs.
     */
    collector: Collector;
    /**
     * A boolean indicating whether the network is mainnet or testnet.
     */
    isMainnet: boolean;
}
/**
 * Creates an unsigned transaction for transferring xUDT assets. This function can also be used to mint xUDT assets.
 *
 * @param {CreateTransferXudtTransactionParams} params - The parameters for creating the transaction.
 * @param {CKBComponents.Script} params.xudtType - The xUDT type script.
 * @param {Array<{ toAddress: string, transferAmount: bigint }>} params.receivers - An array of receiver objects containing `toAddress` and `transferAmount`.
 * @param {Array<string>} params.ckbAddresses - The CKB addresses for the transaction.
 * @param {Collector} params.collector - The collector instance used to fetch cells and collect inputs.
 * @param {boolean} params.isMainnet - A boolean indicating whether the network is mainnet or testnet.
 * @param {string} [ckbAddress=params.ckbAddresses[0]] - The address for the output cell, defaulting to the first address in the input address set.
 *
 * @returns {Promise<CKBComponents.RawTransactionToSign>} A promise that resolves to an unsigned transaction object.
 *
 * @throws {NoXudtLiveCellError} If the address has no xudt cells.
 * @throws {NoLiveCellError} If the address has no empty cells.
 */
export declare function createTransferXudtTransaction({ xudtType, receivers, ckbAddresses, collector, isMainnet, }: CreateTransferXudtTransactionParams, ckbAddress?: string): Promise<CKBComponents.RawTransactionToSign>;
//# sourceMappingURL=transfer.d.ts.map