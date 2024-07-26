import * as ccc from "@ckb-ccc/core";
import { BTCTestnetType, Collector, RawSporeData } from "@rgbpp-sdk/ckb";
import { BtcAssetsApi, DataSource } from "rgbpp";
import { AbstractWallet, TxResult } from "../helper";
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
    unisat: AbstractWallet;
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
 * @param {AbstractWallet} params.unisat - The Unisat wallet instance.
 * @param {string} params.ckbAddress - The CKB address.
 * @param {BtcAssetsApi} params.btcService - The BTC assets API service.
 * @param {ccc.Signer} params.cccSigner - The CCC signer instance.
 * @param {number} [btcFeeRate=120] - The fee rate for BTC transactions (default is 120).
 * @returns {Promise<TxResult>} - The result of the transaction.
 */
export declare const createSporesCombined: ({ clusterTypeScriptArgs, receivers, collector, isMainnet, btcTestnetType, fromBtcAccount, fromBtcAccountPubkey, btcDataSource, unisat, btcService, ckbAddress, cccSigner, }: SporeCreateCombinedParams, btcFeeRate?: number) => Promise<TxResult>;
export {};
