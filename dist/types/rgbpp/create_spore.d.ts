import * as ccc from "@ckb-ccc/core";
import { BTCTestnetType, Collector, Hex, RawSporeData } from "@rgbpp-sdk/ckb";
import { BtcAssetsApi, DataSource } from "rgbpp";
import { AbstractWallet, TxResult } from "../helper";
import { bitcoin } from "@rgbpp-sdk/btc";
interface SporeCreateCombinedParams {
    clusterTypeScriptArgs: string;
    receivers: {
        toBtcAddress: string;
        sporeData: RawSporeData;
    }[];
    collector: Collector;
    isMainnet: boolean;
    btcTestnetType?: BTCTestnetType;
    fromBtcAccount: string;
    fromBtcAccountPubkey?: string;
    btcDataSource: DataSource;
    wallet: AbstractWallet;
    ckbAddress: string;
    btcService: BtcAssetsApi;
    cccSigner: ccc.Signer;
}
/**
 * Creates spores combined with the given parameters.
 *
 * @param {SporeCreateCombinedParams} params - The parameters for creating spores.
 * @param {string} params.clusterTypeScriptArgs - The arguments for the cluster type script.
 * @param {Array<{ toBtcAddress: string, sporeData: RawSporeData }>} params.receivers - The list of receivers with their BTC addresses and spore data.
 * @param {Collector} params.collector - The collector instance.
 * @param {boolean} params.isMainnet - Indicates if the operation is on mainnet.
 * @param {BTCTestnetType} [params.btcTestnetType] - The type of BTC testnet (optional).
 * @param {string} params.fromBtcAccount - The BTC account from which the spores are being created.
 * @param {string} [params.fromBtcAccountPubkey] - The public key of the BTC account (optional).
 * @param {DataSource} params.btcDataSource - The data source for BTC.
 * @param {AbstractWallet} params.wallet - Wallet instance used for signing BTC transactions.
 * @param {string} params.ckbAddress - The CKB address.
 * @param {BtcAssetsApi} params.btcService - The BTC assets API service.
 * @param {ccc.Signer} params.cccSigner - The CCC signer instance.
 * @param {number} [btcFeeRate=120] - The fee rate for BTC transactions (default is 120).
 * @param {number} [witnessLockPlaceholderSize] - The size of the witness lock placeholder (optional). This parameter is used to estimate the transaction size when the witness lock placeholder size is known.
 * @returns {Promise<TxResult>} - The result of the transaction.
 */
export declare const createSporesCombined: ({ clusterTypeScriptArgs, receivers, collector, isMainnet, btcTestnetType, fromBtcAccount, fromBtcAccountPubkey, btcDataSource, wallet, btcService, ckbAddress, cccSigner, }: SporeCreateCombinedParams, btcFeeRate?: number, ckbFeeRate?: bigint, witnessLockPlaceholderSize?: number) => Promise<TxResult>;
interface PrepareCreateSporeUnsignedTransactionParams {
    clusterRgbppLockArgs: Hex;
    receivers: {
        toBtcAddress: string;
        sporeData: RawSporeData;
    }[];
    collector: Collector;
    isMainnet: boolean;
    btcTestnetType?: BTCTestnetType;
    ckbAddress: string;
    ckbFeeRate?: bigint;
    witnessLockPlaceholderSize?: number;
}
/**
 * Prepares an unsigned CKB transaction for creating spores.
 *
 * @param {PrepareCreateSporeUnsignedTransactionParams} params - The parameters for preparing the unsigned CKB transaction.
 * @param {Hex} params.clusterRgbppLockArgs - The arguments for the cluster RGBPP lock.
 * @param {Array<{ toBtcAddress: string, sporeData: RawSporeData }>} params.receivers - The list of receivers with their BTC addresses and spore data.
 * @param {Collector} params.collector - The collector instance.
 * @param {boolean} params.isMainnet - Indicates if the operation is on mainnet.
 * @param {BTCTestnetType} [params.btcTestnetType] - The type of BTC testnet (optional).
 * @param {string} params.ckbAddress - The CKB address.
 * @param {bigint} [params.ckbFeeRate] - The fee rate for CKB transactions (optional).
 * @param {number} [params.witnessLockPlaceholderSize] - The size of the witness lock placeholder (optional). This parameter is used to estimate the transaction size when the witness lock placeholder size is known.
 * @returns {Promise<CKBComponents.RawTransactionToSign>} - The unsigned CKB transaction.
 */
export declare const prepareCreateSporeUnsignedTransaction: ({ clusterRgbppLockArgs, receivers, collector, isMainnet, btcTestnetType, ckbAddress, ckbFeeRate, witnessLockPlaceholderSize, }: PrepareCreateSporeUnsignedTransactionParams) => Promise<CKBComponents.RawTransactionToSign>;
interface PrepareCreateSporeUnsignedPsbtParams {
    clusterRgbppLockArgs: Hex;
    receivers: {
        toBtcAddress: string;
        sporeData: RawSporeData;
    }[];
    collector: Collector;
    isMainnet: boolean;
    btcTestnetType?: BTCTestnetType;
    fromBtcAccount: string;
    fromBtcAccountPubkey?: string;
    btcDataSource: DataSource;
    btcFeeRate?: number;
}
/**
 * Prepares an unsigned BTC transaction for creating spores.
 *
 * @param {PrepareCreateSporeUnsignedPsbtParams} params - The parameters for preparing the unsigned BTC transaction.
 * @param {Hex} params.clusterRgbppLockArgs - The arguments for the cluster RGBPP lock.
 * @param {Array<{ toBtcAddress: string, sporeData: RawSporeData }>} params.receivers - The list of receivers with their BTC addresses and spore data.
 * @param {Collector} params.collector - The collector instance.
 * @param {boolean} params.isMainnet - Indicates if the operation is on mainnet.
 * @param {BTCTestnetType} [params.btcTestnetType] - The type of BTC testnet (optional).
 * @param {string} params.fromBtcAccount - The BTC account from which the spores are being created.
 * @param {string} [params.fromBtcAccountPubkey] - The public key of the BTC account (optional).
 * @param {DataSource} params.btcDataSource - The data source for BTC.
 * @param {number} [params.btcFeeRate] - The fee rate for BTC transactions (optional).
 * @returns {Promise<bitcoin.Psbt>} - The unsigned BTC transaction in PSBT format.
 */
export declare const prepareCreateSporeUnsignedPsbt: ({ clusterRgbppLockArgs, receivers, collector, isMainnet, btcTestnetType, fromBtcAccount, fromBtcAccountPubkey, btcDataSource, btcFeeRate, }: PrepareCreateSporeUnsignedPsbtParams) => Promise<bitcoin.Psbt>;
export {};
