import { BTCTestnetType, Collector, Hex } from "@rgbpp-sdk/ckb";
import { BtcAssetsApi, DataSource } from "rgbpp";
import { AbstractWallet } from "../helper";
import { bitcoin } from "@rgbpp-sdk/btc";
interface SporeTransferCombinedParams {
    toBtcAddress: string;
    sporeTypeArgs: Hex;
    collector: Collector;
    isMainnet: boolean;
    btcTestnetType?: BTCTestnetType;
    fromBtcAddress: string;
    fromBtcAddressPubkey?: string;
    btcDataSource: DataSource;
    wallet: AbstractWallet;
    btcService: BtcAssetsApi;
}
/**
 * Transfers a spore to a specified BTC address.
 *
 * @param {SporeTransferCombinedParams} params - The parameters for the spore transfer.
 * @param {string} params.toBtcAddress - The recipient's BTC address.
 * @param {Hex} params.sporeTypeArgs - The type arguments for the spore.
 * @param {Collector} params.collector - The collector object.
 * @param {boolean} params.isMainnet - Indicates if the operation is on the mainnet.
 * @param {BTCTestnetType} [params.btcTestnetType] - The type of BTC testnet (optional).
 * @param {string} params.fromBtcAddress - The sender's BTC address.
 * @param {string} [params.fromBtcAddressPubkey] - The sender's BTC address public key (optional).
 * @param {DataSource} params.btcDataSource - The data source for BTC.
 * @param {AbstractWallet} params.wallet - Wallet instance used for signing BTC transactions.
 * @param {BtcAssetsApi} params.btcService - The BTC assets API service.
 * @param {number} [btcFeeRate=30] - The fee rate for the BTC transaction (optional, default is 30).
 * @returns {Promise<{ btcTxId: string }>} - The result of the spore transfer, including the BTC transaction ID.
 */
export declare const transferSporeCombined: ({ toBtcAddress, sporeTypeArgs, collector, isMainnet, btcTestnetType, fromBtcAddress, fromBtcAddressPubkey, btcDataSource, wallet, btcService, }: SporeTransferCombinedParams, btcFeeRate?: number) => Promise<{
    btcTxId: string;
}>;
interface GetSporeRgbppLockArgsParams {
    fromBtcAddress: string;
    sporeTypeArgs: Hex;
    isMainnet: boolean;
    btcService: BtcAssetsApi;
}
export declare const getSporeRgbppLockArgs: ({ fromBtcAddress, sporeTypeArgs, isMainnet, btcService, }: GetSporeRgbppLockArgsParams) => Promise<Hex>;
interface PrepareTransferSporeUnsignedPsbtParams {
    sporeRgbppLockArgs: Hex;
    toBtcAddress: string;
    sporeTypeArgs: Hex;
    collector: Collector;
    isMainnet: boolean;
    btcTestnetType?: BTCTestnetType;
    fromBtcAddress: string;
    fromBtcAddressPubkey?: string;
    btcDataSource: DataSource;
    btcFeeRate?: number;
}
/**
 * Prepares an unsigned PSBT (Partially Signed Bitcoin Transaction) for transferring a spore.
 * This function is used to estimate transaction fees before finalizing the transaction.
 *
 * @param {PrepareTransferSporeUnsignedPsbtParams} params - Parameters required to generate the unsigned PSBT.
 * @param {Hex} params.sporeRgbppLockArgs - RGBPP lock arguments for the spore.
 * @param {string} params.toBtcAddress - The recipient's BTC address.
 * @param {Hex} params.sporeTypeArgs - Type arguments for the spore.
 * @param {Collector} params.collector - Collector instance used to gather cells for the transaction.
 * @param {boolean} params.isMainnet - Indicates whether the operation is on the mainnet.
 * @param {BTCTestnetType} [params.btcTestnetType] - Type of BTC testnet (optional).
 * @param {string} params.fromBtcAddress - BTC address from which the spore will be transferred.
 * @param {string} [params.fromBtcAddressPubkey] - Public key of the BTC address (optional).
 * @param {DataSource} params.btcDataSource - Data source for BTC transactions.
 * @param {number} [params.btcFeeRate] - Fee rate for the BTC transaction (optional, default is 30).
 * @returns {Promise<bitcoin.Psbt>} - Promise that resolves to the unsigned PSBT.
 */
export declare const prepareTransferSporeUnsignedPsbt: ({ sporeRgbppLockArgs, toBtcAddress, sporeTypeArgs, collector, isMainnet, btcTestnetType, fromBtcAddress, fromBtcAddressPubkey, btcDataSource, btcFeeRate, }: PrepareTransferSporeUnsignedPsbtParams) => Promise<bitcoin.Psbt>;
export {};
