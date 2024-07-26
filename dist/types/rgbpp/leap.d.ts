import { BTCTestnetType, Collector } from "@rgbpp-sdk/ckb";
import { BtcAssetsApi, DataSource } from "rgbpp";
import { AbstractWallet, TxResult } from "../helper";
interface LeapToCkbParams {
    rgbppLockArgsList: string[];
    toCkbAddress: string;
    xudtTypeArgs: string;
    transferAmount: bigint;
    isMainnet: boolean;
    collector: Collector;
    btcTestnetType?: BTCTestnetType;
    fromBtcAccount: string;
    fromBtcAccountPubkey?: string;
    btcDataSource: DataSource;
    btcService: BtcAssetsApi;
    unisat: AbstractWallet;
}
export declare const leapFromBtcToCKB: ({ rgbppLockArgsList, toCkbAddress, xudtTypeArgs, transferAmount, isMainnet, collector, btcTestnetType, fromBtcAccountPubkey, fromBtcAccount, btcDataSource, btcService, unisat, }: LeapToCkbParams, btcFeeRate?: number) => Promise<TxResult>;
interface RgbppLeapFromBtcToCkbCombinedParams {
    toCkbAddress: string;
    xudtTypeArgs: string;
    transferAmount: bigint;
    collector: Collector;
    btcDataSource: DataSource;
    btcTestnetType?: BTCTestnetType;
    isMainnet: boolean;
    fromBtcAccount: string;
    fromBtcAccountPubkey?: string;
    unisat: AbstractWallet;
    btcService: BtcAssetsApi;
}
/**
 * Combines the parameters for leaping RGBPP assets from Bitcoin to CKB and executes the leap operation.
 *
 * @param {RgbppLeapFromBtcToCkbCombinedParams} params - The parameters for the leap operation.
 * @param {string} params.toCkbAddress - The destination CKB address.
 * @param {string} params.xudtTypeArgs - The arguments for the XUDT type script.
 * @param {bigint} params.transferAmount - The amount of assets to transfer.
 * @param {Collector} params.collector - The collector instance for CKB operations.
 * @param {DataSource} params.btcDataSource - The data source for BTC operations.
 * @param {BTCTestnetType} [params.btcTestnetType] - The type of BTC testnet (optional).
 * @param {boolean} params.isMainnet - Indicates if the operation is on mainnet.
 * @param {string} params.fromBtcAccount - The source BTC account.
 * @param {string} [params.fromBtcAccountPubkey] - The public key of the source BTC account (optional).
 * @param {AbstractWallet} params.unisat - The Unisat wallet instance.
 * @param {BtcAssetsApi} params.btcService - The BTC assets service instance.
 * @param {number} [btcFeeRate] - The fee rate for the BTC transaction (optional).
 *
 * @returns {Promise<TxResult>} - The result of the transaction.
 */
export declare const leapFromBtcToCkbCombined: ({ toCkbAddress, xudtTypeArgs, transferAmount, collector, btcDataSource, btcTestnetType, isMainnet, fromBtcAccount, fromBtcAccountPubkey, unisat, btcService, }: RgbppLeapFromBtcToCkbCombinedParams, btcFeeRate?: number) => Promise<TxResult>;
export {};
