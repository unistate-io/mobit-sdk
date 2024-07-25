import * as ccc from "@ckb-ccc/core";
import {
  addressToScript,
  getTransactionSize,
} from "@nervosnetwork/ckb-sdk-utils";
import {
  append0x,
  appendCkbTxWitnesses,
  BTCTestnetType,
  buildRgbppLockArgs,
  calculateRgbppClusterCellCapacity,
  calculateTransactionFee,
  Collector,
  genCreateClusterCkbVirtualTx,
  generateClusterCreateCoBuild,
  genRgbppLockScript,
  MAX_FEE,
  NoLiveCellError,
  RawClusterData,
  sendCkbTx,
  updateCkbTxWithRealBtcTxId,
} from "@rgbpp-sdk/ckb";
import { BtcApiUtxo } from "@rgbpp-sdk/service";
import { BtcAssetsApi, DataSource, sendRgbppUtxos } from "rgbpp";
import {
  AbstractWallet,
  calculateWitnessSize,
  getAddressCellDeps,
  signAndSendTransaction,
  TxResult,
} from "../helper";
import { signAndSendPsbt } from "../unisat";

interface prepareClusterCellParams {
  outIndex: number;
  btcTxId: string;
  ckbAddress: string;
  clusterData: RawClusterData;
  collector: Collector;
  isMainnet: boolean;
  btcTestnetType?: BTCTestnetType;
}

const prepareClusterCell = async (
  {
    outIndex,
    btcTxId,
    ckbAddress,
    clusterData,
    collector,
    isMainnet,
    btcTestnetType,
  }: prepareClusterCellParams,
  maxFee = MAX_FEE,
  ckbFeeRate?: bigint,
): Promise<CKBComponents.RawTransactionToSign> => {
  const masterLock = addressToScript(ckbAddress);
  console.log("ckb address: ", ckbAddress);

  // The capacity required to launch cells is determined by the token info cell capacity, and transaction fee.
  const clusterCellCapacity = calculateRgbppClusterCellCapacity(clusterData);

  let emptyCells = await collector.getCells({
    lock: masterLock,
  });
  if (!emptyCells || emptyCells.length === 0) {
    throw new NoLiveCellError("The address has no empty cells");
  }
  emptyCells = emptyCells.filter((cell) => !cell.output.type);

  const txFee = maxFee;
  const { inputs, sumInputsCapacity } = collector.collectInputs(
    emptyCells,
    clusterCellCapacity,
    txFee,
  );

  const outputs: CKBComponents.CellOutput[] = [
    {
      lock: genRgbppLockScript(
        buildRgbppLockArgs(outIndex, btcTxId),
        isMainnet,
        btcTestnetType,
      ),
      capacity: append0x(clusterCellCapacity.toString(16)),
    },
  ];
  let changeCapacity = sumInputsCapacity - clusterCellCapacity;
  outputs.push({
    lock: masterLock,
    capacity: append0x(changeCapacity.toString(16)),
  });
  const outputsData = ["0x", "0x"];

  const emptyWitness = { lock: "", inputType: "", outputType: "" };
  const witnesses = inputs.map((_, index) => index === 0 ? emptyWitness : "0x");

  const cellDeps = [...(await getAddressCellDeps(isMainnet, [ckbAddress]))];

  const unsignedTx = {
    version: "0x0",
    cellDeps,
    headerDeps: [],
    inputs,
    outputs,
    outputsData,
    witnesses,
  };

  const txSize = getTransactionSize(unsignedTx) +
    calculateWitnessSize(ckbAddress, isMainnet);
  const estimatedTxFee = calculateTransactionFee(txSize, ckbFeeRate);
  changeCapacity -= estimatedTxFee;
  unsignedTx.outputs[unsignedTx.outputs.length - 1].capacity = append0x(
    changeCapacity.toString(16),
  );

  return unsignedTx;
};

interface createClusterParams {
  ownerRgbppLockArgs: string;
  collector: Collector;
  clusterData: RawClusterData;
  isMainnet: boolean;
  btcTestnetType?: BTCTestnetType;
  fromBtcAccount: string;
  fromBtcAccountPubkey?: string;
  btcDataSource: DataSource;
  unisat: AbstractWallet;
  btcService: BtcAssetsApi;
}

const createCluster = async ({
  ownerRgbppLockArgs,
  collector,
  clusterData,
  isMainnet,
  btcTestnetType,
  fromBtcAccount,
  fromBtcAccountPubkey,
  btcDataSource,
  btcService,
  unisat,
}: createClusterParams, btcFeeRate: number = 30): Promise<TxResult> => {
  const ckbVirtualTxResult = await genCreateClusterCkbVirtualTx({
    collector,
    rgbppLockArgs: ownerRgbppLockArgs,
    clusterData,
    isMainnet,
    ckbFeeRate: BigInt(2000),
    btcTestnetType,
  });

  const { commitment, ckbRawTx, clusterId, needPaymasterCell } =
    ckbVirtualTxResult;

  console.log("clusterId: ", clusterId);

  // Send BTC tx
  const psbt = await sendRgbppUtxos({
    ckbVirtualTx: ckbRawTx,
    commitment,
    tos: [fromBtcAccount],
    needPaymaster: needPaymasterCell,
    ckbCollector: collector,
    from: fromBtcAccount,
    fromPubkey: fromBtcAccountPubkey,
    source: btcDataSource,
    feeRate: btcFeeRate,
  });

  const { txId: btcTxId, rawTxHex: btcTxBytes } = await signAndSendPsbt(
    psbt,
    unisat,
    btcService,
  );
  console.log("BTC TxId: ", btcTxId);

  const interval = setInterval(async () => {
    try {
      console.log("Waiting for BTC tx and proof to be ready");
      const rgbppApiSpvProof = await btcService.getRgbppSpvProof(btcTxId, 0);
      clearInterval(interval);
      // Update CKB transaction with the real BTC txId
      const newCkbRawTx = updateCkbTxWithRealBtcTxId({
        ckbRawTx,
        btcTxId,
        isMainnet,
      });

      console.log(
        "The cluster rgbpp lock args: ",
        newCkbRawTx.outputs[0].lock.args,
      );

      const ckbTx = await appendCkbTxWitnesses({
        ckbRawTx: newCkbRawTx,
        btcTxBytes,
        rgbppApiSpvProof,
      });
      // Replace cobuild witness with the final rgbpp lock script
      ckbTx.witnesses[ckbTx.witnesses.length - 1] =
        generateClusterCreateCoBuild(ckbTx.outputs[0], ckbTx.outputsData[0]);

      console.log(JSON.stringify(ckbTx));

      const txHash = await sendCkbTx({ collector, signedTx: ckbTx });
      console.info(`RGB++ Cluster has been created and tx hash is ${txHash}`);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }, 30 * 1000);

  return { btcTxId };
};

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
  filterUtxo: (
    utxos: BtcApiUtxo[],
  ) => Promise<{ outIndex: number; btcTxId: string }>;
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
export const createClusterCombined = async (
  {
    ckbAddress,
    clusterData,
    collector,
    isMainnet,
    btcTestnetType,
    fromBtcAccount,
    fromBtcAccountPubkey,
    btcDataSource,
    unisat,
    btcService,
    filterUtxo,
    cccSigner,
  }: createClusterCombinedParams,
  ckbFeeRate?: bigint,
  maxFee = MAX_FEE,
  btcFeeRate: number = 30,
): Promise<TxResult> => {
  const utxos = await btcService.getBtcUtxos(fromBtcAccount, {
    only_non_rgbpp_utxos: true,
    only_confirmed: true,
    min_satoshi: 10000,
  });

  const { outIndex, btcTxId } = await filterUtxo(utxos);

  const prepareClusterCellTx = await prepareClusterCell(
    {
      outIndex,
      btcTxId,
      clusterData,
      ckbAddress,
      collector,
      isMainnet,
      btcTestnetType,
    },
    maxFee,
    ckbFeeRate,
  );

  const { txHash } = await signAndSendTransaction(
    prepareClusterCellTx,
    collector,
    cccSigner,
  );

  console.info(
    `Create Cluster cell has been created and the CKB tx hash ${txHash}`,
  );

  const ownerRgbppLockArgs = buildRgbppLockArgs(outIndex, btcTxId);

  const { btcTxId: TxId } = await createCluster({
    ownerRgbppLockArgs,
    clusterData,
    collector,
    isMainnet,
    fromBtcAccount,
    btcDataSource,
    fromBtcAccountPubkey,
    btcTestnetType,
    btcService,
    unisat,
  }, btcFeeRate);

  return {
    btcTxId: TxId,
    ckbTxHash: txHash,
  };
};
