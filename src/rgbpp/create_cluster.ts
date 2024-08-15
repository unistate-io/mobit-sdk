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
import { signAndSendPsbt } from "../wallet";
import { bitcoin } from "@rgbpp-sdk/btc";

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
  witnessLockPlaceholderSize?: number,
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
    (witnessLockPlaceholderSize ?? calculateWitnessSize(ckbAddress, isMainnet));
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
  wallet: AbstractWallet;
  btcService: BtcAssetsApi;
}

const createCluster = async (
  {
    ownerRgbppLockArgs,
    collector,
    clusterData,
    isMainnet,
    btcTestnetType,
    fromBtcAccount,
    fromBtcAccountPubkey,
    btcDataSource,
    btcService,
    wallet,
  }: createClusterParams,
  btcFeeRate: number = 30,
): Promise<TxResult> => {
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
    wallet,
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
  wallet: AbstractWallet;
  btcService: BtcAssetsApi;
  filterUtxo: (
    utxos: BtcApiUtxo[],
  ) => Promise<{ outIndex: number; btcTxId: string }>;
  cccSigner: ccc.Signer;
}

/**
 * Creates a cluster cell on the CKB network and initiates a corresponding BTC transaction.
 *
 * @param {createClusterCombinedParams} params - Parameters required to create the cluster.
 * @param {string} params.ckbAddress - CKB address where the cluster cell will be created.
 * @param {RawClusterData} params.clusterData - Raw data required to create the cluster.
 * @param {Collector} params.collector - Collector instance used to gather cells for the transaction.
 * @param {boolean} params.isMainnet - Indicates whether the operation is on the mainnet.
 * @param {BTCTestnetType} [params.btcTestnetType] - Type of BTC testnet (optional).
 * @param {string} params.fromBtcAccount - BTC account from which the transaction will be initiated.
 * @param {string} [params.fromBtcAccountPubkey] - Public key of the BTC account (optional).
 * @param {DataSource} params.btcDataSource - Data source for BTC transactions.
 * @param {AbstractWallet} params.wallet - Wallet instance used for signing BTC transactions.
 * @param {BtcAssetsApi} params.btcService - BTC service instance for interacting with BTC assets.
 * @param {(utxos: BtcApiUtxo[]) => Promise<{ outIndex: number; btcTxId: string }>} params.filterUtxo - Function to filter UTXOs for the BTC transaction.
 * @param {ccc.Signer} params.cccSigner - Signer instance for signing CKB transactions.
 * @param {bigint} [ckbFeeRate] - Fee rate for the CKB transaction (optional).
 * @param {bigint} [maxFee=MAX_FEE] - Maximum fee for the CKB transaction (default is MAX_FEE).
 * @param {number} [btcFeeRate=30] - Fee rate for the BTC transaction (default is 30).
 * @returns {Promise<TxResult>} - Promise that resolves to the transaction result.
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
    wallet,
    btcService,
    filterUtxo,
    cccSigner,
  }: createClusterCombinedParams,
  ckbFeeRate?: bigint,
  maxFee: bigint = MAX_FEE,
  btcFeeRate: number = 30,
  witnessLockPlaceholderSize?: number,
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
    witnessLockPlaceholderSize,
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

  const { btcTxId: TxId } = await createCluster(
    {
      ownerRgbppLockArgs,
      clusterData,
      collector,
      isMainnet,
      fromBtcAccount,
      btcDataSource,
      fromBtcAccountPubkey,
      btcTestnetType,
      btcService,
      wallet,
    },
    btcFeeRate,
  );

  return {
    btcTxId: TxId,
    ckbTxHash: txHash,
  };
};

interface PrepareClusterCellTransactionParams {
  ckbAddress: string;
  clusterData: RawClusterData;
  collector: Collector;
  isMainnet: boolean;
  btcService: BtcAssetsApi;
  fromBtcAccount: string;
  btcTestnetType?: BTCTestnetType;
  filterUtxo: (
    utxos: BtcApiUtxo[],
  ) => Promise<{ outIndex: number; btcTxId: string }>;
}

/**
 * Prepares a cluster cell on the CKB network by filtering UTXOs and creating a transaction.
 *
 * @param {PrepareClusterCellTransactionParams} params - Parameters required to prepare the cluster cell.
 * @param {string} params.ckbAddress - CKB address where the cluster cell will be created.
 * @param {RawClusterData} params.clusterData - Raw data required to create the cluster.
 * @param {Collector} params.collector - Collector instance used to gather cells for the transaction.
 * @param {boolean} params.isMainnet - Indicates whether the operation is on the mainnet.
 * @param {BtcAssetsApi} params.btcService - BTC service instance for interacting with BTC assets.
 * @param {string} params.fromBtcAccount - BTC account from which the transaction will be initiated.
 * @param {BTCTestnetType} [params.btcTestnetType] - Type of BTC testnet (optional).
 * @param {(utxos: BtcApiUtxo[]) => Promise<{ outIndex: number; btcTxId: string }>} params.filterUtxo - Function to filter UTXOs for the BTC transaction.
 * @param {bigint} [maxFee=MAX_FEE] - Maximum fee for the CKB transaction (default is MAX_FEE).
 * @param {bigint} [ckbFeeRate] - Fee rate for the CKB transaction (optional).
 * @param {number} [witnessLockPlaceholderSize] - Size of the witness lock placeholder (optional).
 * @returns {Promise<CKBComponents.RawTransactionToSign>} - Promise that resolves to the prepared CKB transaction.
 */
export const prepareClusterCellTransaction = async (
  {
    ckbAddress,
    clusterData,
    collector,
    isMainnet,
    btcService,
    btcTestnetType,
    fromBtcAccount,
    filterUtxo,
  }: PrepareClusterCellTransactionParams,
  maxFee: bigint = MAX_FEE,
  ckbFeeRate?: bigint,
  witnessLockPlaceholderSize?: number,
): Promise<CKBComponents.RawTransactionToSign> => {
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
    witnessLockPlaceholderSize,
  );

  return prepareClusterCellTx;
};

interface GenerateCreateClusterUnsignedPsbtParams {
  ownerRgbppLockArgs: string;
  collector: Collector;
  clusterData: RawClusterData;
  isMainnet: boolean;
  btcTestnetType?: BTCTestnetType;
  fromBtcAccount: string;
  fromBtcAccountPubkey?: string;
  btcDataSource: DataSource;
  btcService: BtcAssetsApi;
  btcFeeRate?: number;
}

/**
 * Generates an unsigned PSBT (Partially Signed Bitcoin Transaction) for creating a cluster.
 * This function is used to estimate transaction fees before finalizing the transaction.
 *
 * @param {GenerateCreateClusterUnsignedPsbtParams} params - Parameters required to generate the unsigned PSBT.
 * @param {string} params.ownerRgbppLockArgs - RGB++ lock arguments for the owner.
 * @param {Collector} params.collector - Collector instance used to gather cells for the transaction.
 * @param {RawClusterData} params.clusterData - Raw data required to create the cluster.
 * @param {boolean} params.isMainnet - Indicates whether the operation is on the mainnet.
 * @param {BTCTestnetType} [params.btcTestnetType] - Type of BTC testnet (optional).
 * @param {string} params.fromBtcAccount - BTC account from which the transaction will be initiated.
 * @param {string} [params.fromBtcAccountPubkey] - Public key of the BTC account (optional).
 * @param {DataSource} params.btcDataSource - Data source for BTC transactions.
 * @param {BtcAssetsApi} params.btcService - BTC service instance for interacting with BTC assets.
 * @param {number} [params.btcFeeRate] - Fee rate for the BTC transaction (optional, default is 30).
 * @returns {Promise<bitcoin.Psbt>} - Promise that resolves to the unsigned PSBT in base64 format.
 */
export const generateCreateClusterUnsignedPsbt = async ({
  ownerRgbppLockArgs,
  collector,
  clusterData,
  isMainnet,
  btcTestnetType,
  fromBtcAccount,
  fromBtcAccountPubkey,
  btcDataSource,
  btcService,
  btcFeeRate = 30,
}: GenerateCreateClusterUnsignedPsbtParams): Promise<bitcoin.Psbt> => {
  const ckbVirtualTxResult = await genCreateClusterCkbVirtualTx({
    collector,
    rgbppLockArgs: ownerRgbppLockArgs,
    clusterData,
    isMainnet,
    ckbFeeRate: BigInt(2000),
    btcTestnetType,
  });

  const { commitment, ckbRawTx, needPaymasterCell } = ckbVirtualTxResult;

  // Generate unsigned PSBT
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

  return psbt;
};
