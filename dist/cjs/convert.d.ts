import { TransactionSkeletonType } from "@ckb-lumos/helpers";
import { Collector } from "@rgbpp-sdk/ckb";
/**
 * Converts a raw transaction to a transaction skeleton.
 * @param {CKBComponents.RawTransactionToSign} rawTransaction - The raw transaction to convert.
 * @param {Collector} collector - The collector instance.
 * @returns {Promise<TransactionSkeletonType>} The transaction skeleton.
 */
export declare function convertToTxSkeleton(rawTransaction: CKBComponents.RawTransactionToSign, collector: Collector): Promise<TransactionSkeletonType>;
//# sourceMappingURL=convert.d.ts.map