import { Collector, RgbppTokenInfo } from "@rgbpp-sdk/ckb";
interface CreateIssueXudtTransactionParams {
    xudtTotalAmount: bigint;
    tokenInfo: RgbppTokenInfo;
    ckbAddress: string;
    collector: Collector;
    isMainnet: boolean;
}
/**
 * Creates an unsigned transaction for issuing xUDT assets with a unique cell as the token info cell.
 *
 * @param xudtTotalAmount - The total amount of xUDT asset to be issued.
 * @param tokenInfo - The xUDT token information including decimal, name, and symbol.
 * @param ckbAddress - The CKB address for the transaction.
 * @param collector - The collector instance used to fetch cells and collect inputs.
 * @param isMainnet - A boolean indicating whether the network is mainnet or testnet.
 * @param feeRate - (Optional) The fee rate to be used for the transaction.
 * @param maxFee - (Optional) The maximum fee allowed for the transaction. Defaults to MAX_FEE.
 *
 * @returns A promise that resolves to an unsigned transaction object.
 */
export declare function createIssueXudtTransaction({ xudtTotalAmount, tokenInfo, ckbAddress, collector, isMainnet, }: CreateIssueXudtTransactionParams, feeRate?: bigint, maxFee?: bigint): Promise<CKBComponents.RawTransactionToSign>;
export {};
