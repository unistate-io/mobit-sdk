import { TransactionSkeletonType } from "@ckb-lumos/helpers";
import { Collector } from "@rgbpp-sdk/ckb";
export declare function convertToTxSkeleton(rawTransaction: CKBComponents.RawTransactionToSign, collector: Collector): Promise<TransactionSkeletonType>;
