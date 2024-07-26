import * as ccc from "@ckb-ccc/core";
import { BTCTestnetType, Collector, RawClusterData } from "@rgbpp-sdk/ckb";
import { BtcApiUtxo } from "@rgbpp-sdk/service";
import { BtcAssetsApi, DataSource } from "rgbpp";
import { AbstractWallet, TxResult } from "../helper";
interface createClusterCombinedParams {
    ckbAddress: string;
    clusterData: RawClusterData;
    collector: Collector;
    isMainnet: boolean;
    btcTestnetType?: BTCTestnetType;
    fromBtcAccount: string;
    fromBtcAccountPubkey?: string;
    btcDataSource: DataSource;
    unisat: AbstractWallet;
    btcService: BtcAssetsApi;
    filterUtxo: (utxos: BtcApiUtxo[]) => Promise<{
        outIndex: number;
        btcTxId: string;
    }>;
    cccSigner: ccc.Signer;
}
/**
 * Creates a cluster cell on the CKB network and initiates a corresponding BTC transaction.
 *
 * @param {createClusterCombinedParams} params - The parameters required to create the cluster.
 * @param {string} params.ckbAddress - The CKB address where the cluster cell will be created.
 * @param {RawClusterData} params.clusterData - The raw data required to create the cluster.
 * @param {Collector} params.collector - The collector instance used to gather cells for the transaction.
 * @param {boolean} params.isMainnet - A boolean indicating whether the operation is on the mainnet.
 * @param {BTCTestnetType} [params.btcTestnetType] - The type of BTC testnet (optional).
 * @param {string} params.fromBtcAccount - The BTC account from which the transaction will be initiated.
 * @param {string} [params.fromBtcAccountPubkey] - The public key of the BTC account (optional).
 * @param {DataSource} params.btcDataSource - The data source for BTC transactions.
 * @param {AbstractWallet} params.unisat - The Unisat wallet instance used for signing BTC transactions.
 * @param {BtcAssetsApi} params.btcService - The BTC service instance for interacting with BTC assets.
 * @param {(utxos: BtcApiUtxo[]) => Promise<{ outIndex: number; btcTxId: string }>} params.filterUtxo - A function to filter UTXOs for the BTC transaction.
 * @param {ccc.Signer} params.cccSigner - The signer instance for signing CKB transactions.
 * @param {bigint} [ckbFeeRate] - The fee rate for the CKB transaction (optional).
 * @param {bigint} [maxFee=MAX_FEE] - The maximum fee for the CKB transaction (default is MAX_FEE).
 * @param {number} [btcFeeRate=30] - The fee rate for the BTC transaction (default is 30).
 * @returns {Promise<TxResult>} - A promise that resolves to the transaction result.
 */
export declare const createClusterCombined: ({ ckbAddress, clusterData, collector, isMainnet, btcTestnetType, fromBtcAccount, fromBtcAccountPubkey, btcDataSource, unisat, btcService, filterUtxo, cccSigner, }: createClusterCombinedParams, ckbFeeRate?: bigint, maxFee?: bigint, btcFeeRate?: number) => Promise<TxResult>;
export {};
