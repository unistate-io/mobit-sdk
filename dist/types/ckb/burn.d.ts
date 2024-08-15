import { Collector } from "@rgbpp-sdk/ckb";
interface CreateBurnXudtTransactionParams {
    xudtArgs: string;
    burnAmount: bigint;
    ckbAddress: string;
    collector: Collector;
    isMainnet: boolean;
}
/**
 * Creates an unsigned transaction for burning xUDT assets.
 *
 * This function constructs a transaction that burns a specified amount of xUDT tokens from a given CKB address.
 * It fetches the necessary cells, collects inputs, and constructs the transaction outputs accordingly.
 *
 * @param {CreateBurnXudtTransactionParams} params - The parameters for creating the burn transaction.
 * @param {string} params.xudtArgs - The xUDT type script args, which is the unique identifier for the xUDT token type.
 * @param {bigint} params.burnAmount - The amount of xUDT asset to be burned, representing the quantity of tokens that will be destroyed.
 * @param {string} params.ckbAddress - The CKB address for the transaction, from which the tokens will be burned.
 * @param {Collector} params.collector - The collector instance used to fetch cells and collect inputs, responsible for gathering the necessary cells to construct the transaction.
 * @param {boolean} params.isMainnet - A boolean indicating whether the network is mainnet or testnet, affecting the type script and cell dependencies.
 * @param {bigint} [feeRate] - An optional parameter specifying the fee rate for the transaction. If not provided, a default fee rate will be used.
 * @param {bigint} [maxFee=MAX_FEE] - An optional parameter specifying the maximum fee for the transaction. Defaults to MAX_FEE if not provided.
 * @param {number} [witnessLockPlaceholderSize] - An optional parameter specifying the size of the witness lock placeholder.
 * @returns {Promise<CKBComponents.RawTransactionToSign>} - An unsigned transaction object that can be signed and submitted to the network.
 */
export declare function createBurnXudtTransaction({ xudtArgs, burnAmount, ckbAddress, collector, isMainnet, }: CreateBurnXudtTransactionParams, feeRate?: bigint, maxFee?: bigint, witnessLockPlaceholderSize?: number): Promise<CKBComponents.RawTransactionToSign>;
export {};
