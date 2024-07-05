import { Collector } from "@rgbpp-sdk/ckb";
interface CreateTransferXudtTransactionParams {
    xudtArgs: string;
    receivers: {
        toAddress: string;
        transferAmount: bigint;
    }[];
    ckbAddress: string;
    collector: Collector;
    isMainnet: boolean;
}
/**
 * transferXudt can be used to mint xUDT assets or transfer xUDT assets.
 * @param xudtArgs The xUDT type script args
 * @param receivers The receiver includes toAddress and transferAmount
 * @param ckbAddress The CKB address for the transaction
 * @param collector The collector instance used to fetch cells and collect inputs
 * @param isMainnet A boolean indicating whether the network is mainnet or testnet
 * @returns An unsigned transaction object
 */
export declare function createTransferXudtTransaction({ xudtArgs, receivers, ckbAddress, collector, isMainnet }: CreateTransferXudtTransactionParams): Promise<CKBComponents.RawTransactionToSign>;
export {};
