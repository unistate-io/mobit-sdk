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
 * @param xudtArgs The xUDT type script args. This is the unique identifier for the xUDT token type.
 * @param burnAmount The amount of xUDT asset to be burned. This is the quantity of tokens that will be destroyed.
 * @param ckbAddress The CKB address for the transaction. This is the address from which the tokens will be burned.
 * @param collector The collector instance used to fetch cells and collect inputs. This is responsible for gathering the necessary cells to construct the transaction.
 * @param isMainnet A boolean indicating whether the network is mainnet or testnet. This affects the type script and cell dependencies.
 * @param feeRate An optional parameter specifying the fee rate for the transaction. If not provided, a default fee rate will be used.
 * @param maxFee An optional parameter specifying the maximum fee for the transaction. Defaults to MAX_FEE if not provided.
 * @returns An unsigned transaction object that can be signed and submitted to the network.
 */
export declare function createBurnXudtTransaction({ xudtArgs, burnAmount, ckbAddress, collector, isMainnet, }: CreateBurnXudtTransactionParams, feeRate?: bigint, maxFee?: bigint): Promise<CKBComponents.RawTransactionToSign>;
export {};
