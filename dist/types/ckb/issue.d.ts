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
 * @param xudtTotalAmount The total amount of xUDT asset to be issued
 * @param tokenInfo The xUDT token information including decimal, name, and symbol
 * @param ckbAddress The CKB address for the transaction
 * @param collector The collector instance used to fetch cells and collect inputs
 * @param isMainnet A boolean indicating whether the network is mainnet or testnet
 * @returns An unsigned transaction object
 */
export declare function createIssueXudtTransaction({ xudtTotalAmount, tokenInfo, ckbAddress, collector, isMainnet, }: CreateIssueXudtTransactionParams): Promise<CKBComponents.RawTransactionToSign>;
export {};
