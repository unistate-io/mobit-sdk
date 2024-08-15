import { Collector } from "@rgbpp-sdk/ckb";
interface CreateTransferXudtTransactionParams {
    xudtArgs: string;
    receivers: {
        toAddress: string;
        transferAmount: bigint;
    }[];
    ckbAddresses: string[];
    collector: Collector;
    isMainnet: boolean;
}
/**
 * Creates an unsigned transaction for transferring xUDT assets. This function can also be used to mint xUDT assets.
 *
 * @param {CreateTransferXudtTransactionParams} params - The parameters for creating the transaction.
 * @param {string} params.xudtArgs - The xUDT type script args.
 * @param {Array<{ toAddress: string, transferAmount: bigint }>} params.receivers - An array of receiver objects containing `toAddress` and `transferAmount`.
 * @param {Array<string>} params.ckbAddresses - The CKB addresses for the transaction.
 * @param {Collector} params.collector - The collector instance used to fetch cells and collect inputs.
 * @param {boolean} params.isMainnet - A boolean indicating whether the network is mainnet or testnet.
 * @param {string} [ckbAddress=params.ckbAddresses[0]] - The address for the output cell, defaulting to the first address in the input address set.
 * @param {bigint} [feeRate] - (Optional) The fee rate to be used for the transaction.
 * @param {bigint} [maxFee=MAX_FEE] - (Optional) The maximum fee allowed for the transaction. Defaults to `MAX_FEE`.
 * @param {number} [witnessLockPlaceholderSize] - (Optional) The size of the witness lock placeholder.
 *
 * @returns {Promise<CKBComponents.RawTransactionToSign>} A promise that resolves to an unsigned transaction object.
 *
 * @throws {NoXudtLiveCellError} If the address has no xudt cells.
 * @throws {NoLiveCellError} If the address has no empty cells.
 */
export declare function createTransferXudtTransaction({ xudtArgs, receivers, ckbAddresses, collector, isMainnet, }: CreateTransferXudtTransactionParams, ckbAddress?: string, feeRate?: bigint, maxFee?: bigint, witnessLockPlaceholderSize?: number): Promise<CKBComponents.RawTransactionToSign>;
export {};
