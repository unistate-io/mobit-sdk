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
 * @param xudtArgs The xUDT type script args
 * @param burnAmount The amount of xUDT asset to be burned
 * @param ckbAddress The CKB address for the transaction
 * @param collector The collector instance used to fetch cells and collect inputs
 * @param isMainnet A boolean indicating whether the network is mainnet or testnet
 * @returns An unsigned transaction object
 */
export declare function createBurnXudtTransaction({ xudtArgs, burnAmount, ckbAddress, collector, isMainnet, }: CreateBurnXudtTransactionParams): Promise<CKBComponents.RawTransactionToSign>;
export {};
