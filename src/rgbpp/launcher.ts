import * as ccc from "@ckb-ccc/core";
import {
  addressToScript,
  getTransactionSize,
} from "@nervosnetwork/ckb-sdk-utils";
import { bitcoin, DataSource, sendRgbppUtxos } from "@rgbpp-sdk/btc";
import {
  append0x,
  appendCkbTxWitnesses,
  BTCTestnetType,
  buildRgbppLockArgs,
  calculateRgbppCellCapacity,
  calculateRgbppTokenInfoCellCapacity,
  calculateTransactionFee,
  Collector,
  genRgbppLaunchCkbVirtualTx,
  genRgbppLockScript,
  MAX_FEE,
  NoLiveCellError,
  RgbppTokenInfo,
  sendCkbTx,
  updateCkbTxWithRealBtcTxId,
} from "@rgbpp-sdk/ckb";
import { BtcApiUtxo } from "@rgbpp-sdk/service";
import { BtcAssetsApi } from "rgbpp";
import {
  AbstractWallet,
  calculateWitnessSize,
  getAddressCellDeps,
  signAndSendTransaction,
  TxResult,
} from "../helper";
import { signAndSendPsbt } from "../wallet";

interface RgbppPrepareLauncerParams {
  outIndex: number;
  btcTxId: string;
  rgbppTokenInfo: RgbppTokenInfo;
  ckbAddress: string;
  collector: Collector;
  isMainnet: boolean;
  btcTestnetType?: BTCTestnetType;
}

const prepareLaunchCell = async (
  {
    outIndex,
    btcTxId,
    rgbppTokenInfo,
    ckbAddress,
    collector,
    isMainnet,
    btcTestnetType,
  }: RgbppPrepareLauncerParams,
  ckbFeeRate?: bigint,
  maxFee: bigint = MAX_FEE,
  witnessLockPlaceholderSize?: number,
): Promise<CKBComponents.RawTransactionToSign> => {
  const masterLock = addressToScript(ckbAddress);
  console.log("ckb address: ", ckbAddress);

  // The capacity required to launch cells is determined by the token info cell capacity, and transaction fee.
  const launchCellCapacity =
    calculateRgbppCellCapacity() +
    calculateRgbppTokenInfoCellCapacity(rgbppTokenInfo, isMainnet);

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
    launchCellCapacity,
    txFee,
  );

  const outputs: CKBComponents.CellOutput[] = [
    {
      lock: genRgbppLockScript(
        buildRgbppLockArgs(outIndex, btcTxId),
        isMainnet,
        btcTestnetType,
      ),
      capacity: append0x(launchCellCapacity.toString(16)),
    },
  ];

  let changeCapacity = sumInputsCapacity - launchCellCapacity;
  outputs.push({
    lock: masterLock,
    capacity: append0x(changeCapacity.toString(16)),
  });
  const outputsData = ["0x", "0x"];
  const emptyWitness = { lock: "", inputType: "", outputType: "" };
  const witnesses = inputs.map((_, index) =>
    index === 0 ? emptyWitness : "0x",
  );

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
  const txSize =
    getTransactionSize(unsignedTx) +
    (witnessLockPlaceholderSize ?? calculateWitnessSize(ckbAddress, isMainnet));
  const estimatedTxFee = calculateTransactionFee(txSize, ckbFeeRate);
  changeCapacity -= estimatedTxFee;
  unsignedTx.outputs[unsignedTx.outputs.length - 1].capacity = append0x(
    changeCapacity.toString(16),
  );

  return unsignedTx;
};

interface RgbppLauncerParams {
  rgbppTokenInfo: RgbppTokenInfo;
  collector: Collector;
  isMainnet: boolean;
  btcTestnetType?: BTCTestnetType;
  btcAccount: string;
  btcAccountPubkey?: string;
  btcDataSource: DataSource;
  launchAmount: bigint;
  btcService: BtcAssetsApi;
  ownerRgbppLockArgs: string;
  wallet: AbstractWallet;
}

const launchRgbppAsset = async (
  {
    ownerRgbppLockArgs,
    rgbppTokenInfo,
    collector,
    isMainnet,
    btcTestnetType,
    btcAccount,
    btcDataSource,
    btcAccountPubkey,
    launchAmount,
    btcService,
    wallet,
  }: RgbppLauncerParams,
  btcFeeRate?: number,
): Promise<TxResult> => {
  const ckbVirtualTxResult = await genRgbppLaunchCkbVirtualTx({
    collector: collector,
    ownerRgbppLockArgs,
    rgbppTokenInfo,
    launchAmount,
    isMainnet: isMainnet,
    btcTestnetType: btcTestnetType,
  });

  const { commitment, ckbRawTx, needPaymasterCell } = ckbVirtualTxResult;

  console.log("RGB++ Asset type script args: ", ckbRawTx.outputs[0].type?.args);

  // Send BTC tx
  const psbt = await sendRgbppUtxos({
    ckbVirtualTx: ckbRawTx,
    commitment,
    tos: [btcAccount],
    needPaymaster: needPaymasterCell,
    ckbCollector: collector,
    from: btcAccount,
    fromPubkey: btcAccountPubkey,
    source: btcDataSource,
    feeRate: btcFeeRate,
  });

  const { txId: btcTxId, rawTxHex: btcTxBytes } = await signAndSendPsbt(
    psbt,
    wallet,
    btcService,
  );

  console.log(`BTC ${btcTestnetType} TxId: ${btcTxId}`);

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
      const ckbTx = await appendCkbTxWitnesses({
        ckbRawTx: newCkbRawTx,
        btcTxBytes,
        rgbppApiSpvProof,
      });

      const txHash = await sendCkbTx({ collector, signedTx: ckbTx });
      console.info(
        `RGB++ Asset has been launched and CKB tx hash is ${txHash}`,
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  }, 30 * 1000);

  return { btcTxId };
};

interface RgbppLauncerCombinedParams {
  rgbppTokenInfo: RgbppTokenInfo;
  collector: Collector;
  isMainnet: boolean;
  btcTestnetType?: BTCTestnetType;
  btcAccount: string;
  btcAccountPubkey?: string;
  btcDataSource: DataSource;
  launchAmount: bigint;
  btcService: BtcAssetsApi;
  ckbAddress: string;
  cccSigner: ccc.Signer;
  filterUtxo: (
    utxos: BtcApiUtxo[],
  ) => Promise<{ outIndex: number; btcTxId: string }>;
  wallet: AbstractWallet;
}

/**
 * Launches an RGB++ asset by preparing a launch cell and subsequently sending a BTC transaction.
 *
 * @param params - An object containing the necessary parameters for launching the RGB++ asset.
 * @param {RgbppTokenInfo} params.rgbppTokenInfo - Information about the RGB++ token to be launched.
 * @param {Collector} params.collector - The collector instance used to gather cells.
 * @param {boolean} params.isMainnet - A boolean indicating whether the operation is on the mainnet.
 * @param {BTCTestnetType} [params.btcTestnetType] - (Optional) The type of BTC testnet to use.
 * @param {string} params.btcAccount - The BTC account address.
 * @param {string} [params.btcAccountPubkey] - (Optional) The public key of the BTC account.
 * @param {DataSource} params.btcDataSource - The data source for BTC transactions.
 * @param {bigint} params.launchAmount - The amount of the asset to be launched, represented as a bigint.
 * @param {BtcAssetsApi} params.btcService - The service instance for interacting with BTC assets.
 * @param {string} params.ckbAddress - The CKB address where the asset will be launched.
 * @param {ccc.Signer} params.cccSigner - The signer instance for CKB transactions.
 * @param {(utxos: BtcApiUtxo[]) => Promise<{ outIndex: number; btcTxId: string }>} params.filterUtxo - A function to filter UTXOs for the BTC transaction.
 * @param {AbstractWallet} params.wallet - Wallet instance used for signing BTC transactions.
 * @param {bigint} [ckbFeeRate] - (Optional) The fee rate for CKB transactions, represented as a bigint.
 * @param {bigint} [maxFee=MAX_FEE] - (Optional) The maximum fee for the transaction, represented as a bigint. Defaults to MAX_FEE.
 * @param {number} [btcFeeRate] - (Optional) The fee rate for BTC transactions, represented as a number.
 * @param {number} [witnessLockPlaceholderSize] - (Optional) The size of the witness lock placeholder.
 *
 * @returns A promise that resolves to the transaction result, including the BTC transaction ID and CKB transaction hash.
 */
export const launchCombined = async (
  {
    rgbppTokenInfo,
    collector,
    isMainnet,
    btcTestnetType,
    btcAccount,
    btcDataSource,
    btcAccountPubkey,
    launchAmount,
    ckbAddress,
    filterUtxo,
    btcService,
    wallet,
    cccSigner,
  }: RgbppLauncerCombinedParams,
  ckbFeeRate?: bigint,
  maxFee: bigint = MAX_FEE,
  btcFeeRate?: number,
  witnessLockPlaceholderSize?: number,
): Promise<TxResult> => {
  const utxos = await btcService.getBtcUtxos(btcAccount, {
    only_non_rgbpp_utxos: true,
    only_confirmed: true,
    min_satoshi: 10000,
  });

  const { outIndex, btcTxId } = await filterUtxo(utxos);

  const prepareLaunchCellTx = await prepareLaunchCell(
    {
      outIndex,
      btcTxId,
      rgbppTokenInfo,
      ckbAddress,
      collector,
      isMainnet,
      btcTestnetType,
    },
    ckbFeeRate,
    maxFee,
    witnessLockPlaceholderSize,
  );

  const { txHash } = await signAndSendTransaction(
    prepareLaunchCellTx,
    collector,
    cccSigner,
  );

  console.info(`Launch cell has been created and the CKB tx hash ${txHash}`);

  const ownerRgbppLockArgs = buildRgbppLockArgs(outIndex, btcTxId);

  const { btcTxId: TxId } = await launchRgbppAsset(
    {
      ownerRgbppLockArgs,
      rgbppTokenInfo,
      collector,
      isMainnet,
      btcAccount,
      btcDataSource,
      btcAccountPubkey,
      btcTestnetType,
      launchAmount,
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

interface PrepareLaunchCellTransactionParams {
  ckbAddress: string;
  rgbppTokenInfo: RgbppTokenInfo;
  collector: Collector;
  isMainnet: boolean;
  btcService: BtcAssetsApi;
  btcAccount: string;
  btcTestnetType?: BTCTestnetType;
  filterUtxo: (
    utxos: BtcApiUtxo[],
  ) => Promise<{ outIndex: number; btcTxId: string }>;
}

/**
 * Prepares a launch cell on the CKB network by filtering UTXOs and creating a transaction.
 *
 * @param {PrepareLaunchCellTransactionParams} params - Parameters required to prepare the launch cell.
 * @param {string} params.ckbAddress - CKB address where the launch cell will be created.
 * @param {RgbppTokenInfo} params.rgbppTokenInfo - Information about the RGB++ token to be launched.
 * @param {Collector} params.collector - Collector instance used to gather cells for the transaction.
 * @param {boolean} params.isMainnet - Indicates whether the operation is on the mainnet.
 * @param {BtcAssetsApi} params.btcService - BTC service instance for interacting with BTC assets.
 * @param {string} params.btcAccount - BTC account from which the transaction will be initiated.
 * @param {BTCTestnetType} [params.btcTestnetType] - Type of BTC testnet (optional).
 * @param {(utxos: BtcApiUtxo[]) => Promise<{ outIndex: number; btcTxId: string }>} params.filterUtxo - Function to filter UTXOs for the BTC transaction.
 * @param {bigint} [maxFee=MAX_FEE] - Maximum fee for the CKB transaction (default is MAX_FEE).
 * @param {bigint} [ckbFeeRate] - Fee rate for the CKB transaction (optional).
 * @param {number} [witnessLockPlaceholderSize] - Size of the witness lock placeholder (optional).
 * @returns {Promise<CKBComponents.RawTransactionToSign>} - Promise that resolves to the prepared CKB transaction.
 */
export const prepareLaunchCellTransaction = async (
  {
    ckbAddress,
    rgbppTokenInfo,
    collector,
    isMainnet,
    btcService,
    btcAccount,
    btcTestnetType,
    filterUtxo,
  }: PrepareLaunchCellTransactionParams,
  maxFee: bigint = MAX_FEE,
  ckbFeeRate?: bigint,
  witnessLockPlaceholderSize?: number,
): Promise<CKBComponents.RawTransactionToSign> => {
  const utxos = await btcService.getBtcUtxos(btcAccount, {
    only_non_rgbpp_utxos: true,
    only_confirmed: true,
    min_satoshi: 10000,
  });

  const { outIndex, btcTxId } = await filterUtxo(utxos);

  const prepareLaunchCellTx = await prepareLaunchCell(
    {
      outIndex,
      btcTxId,
      rgbppTokenInfo,
      ckbAddress,
      collector,
      isMainnet,
      btcTestnetType,
    },
    ckbFeeRate,
    maxFee,
    witnessLockPlaceholderSize,
  );

  return prepareLaunchCellTx;
};

interface PrepareLauncherUnsignedPsbtParams {
  rgbppTokenInfo: RgbppTokenInfo;
  collector: Collector;
  isMainnet: boolean;
  btcTestnetType?: BTCTestnetType;
  btcAccount: string;
  btcAccountPubkey?: string;
  btcDataSource: DataSource;
  launchAmount: bigint;
  ownerRgbppLockArgs: string;
}

/**
 * Generates an unsigned PSBT for launching an RGB++ asset.
 *
 * @param {PrepareLauncherUnsignedPsbtParams} params - Parameters required for generating the unsigned PSBT.
 * @param {RgbppTokenInfo} params.rgbppTokenInfo - Details about the RGB++ token to be launched.
 * @param {Collector} params.collector - Instance used to collect cells for the transaction.
 * @param {boolean} params.isMainnet - Indicates if the operation is on the mainnet.
 * @param {BTCTestnetType} [params.btcTestnetType] - (Optional) Type of BTC testnet to use.
 * @param {string} params.btcAccount - Address of the BTC account.
 * @param {string} [params.btcAccountPubkey] - (Optional) Public key of the BTC account.
 * @param {DataSource} params.btcDataSource - Source for BTC transaction data.
 * @param {bigint} params.launchAmount - Amount of the asset to be launched, as a bigint.
 * @param {string} params.ownerRgbppLockArgs - Lock arguments for the owner of the RGB++ asset.
 * @param {number} [btcFeeRate] - (Optional) Fee rate for BTC transactions, as a number.
 *
 * @returns {Promise<bitcoin.Psbt>} A promise resolving to the unsigned PSBT.
 */
export const prepareLauncherUnsignedPsbt = async (
  {
    ownerRgbppLockArgs,
    rgbppTokenInfo,
    collector,
    isMainnet,
    btcTestnetType,
    btcAccount,
    btcDataSource,
    btcAccountPubkey,
    launchAmount,
  }: PrepareLauncherUnsignedPsbtParams,
  btcFeeRate?: number,
): Promise<bitcoin.Psbt> => {
  const ckbVirtualTxResult = await genRgbppLaunchCkbVirtualTx({
    collector: collector,
    ownerRgbppLockArgs,
    rgbppTokenInfo,
    launchAmount,
    isMainnet: isMainnet,
    btcTestnetType: btcTestnetType,
  });

  const { commitment, ckbRawTx, needPaymasterCell } = ckbVirtualTxResult;

  console.log("RGB++ Asset type script args: ", ckbRawTx.outputs[0].type?.args);

  // Generate unsigned PSBT
  const psbt = await sendRgbppUtxos({
    ckbVirtualTx: ckbRawTx,
    commitment,
    tos: [btcAccount],
    needPaymaster: needPaymasterCell,
    ckbCollector: collector,
    from: btcAccount,
    fromPubkey: btcAccountPubkey,
    source: btcDataSource,
    feeRate: btcFeeRate,
  });

  return psbt;
};
