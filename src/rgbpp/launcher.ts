import * as ccc from "@ckb-ccc/core";
import {
  addressToScript,
  getTransactionSize,
} from "@nervosnetwork/ckb-sdk-utils";
import { DataSource, sendRgbppUtxos } from "@rgbpp-sdk/btc";
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
import { signAndSendPsbt } from "../unisat";

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
): Promise<CKBComponents.RawTransactionToSign> => {
  const masterLock = addressToScript(ckbAddress);
  console.log("ckb address: ", ckbAddress);

  // The capacity required to launch cells is determined by the token info cell capacity, and transaction fee.
  const launchCellCapacity = calculateRgbppCellCapacity() +
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
  unisat: AbstractWallet;
}

const launchRgbppAsset = async ({
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
  unisat,
}: RgbppLauncerParams, btcFeeRate?: number): Promise<TxResult> => {
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
    unisat,
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
  unisat: AbstractWallet;
}

/**
 * Launches an RGB++ asset by preparing a launch cell and subsequently sending a BTC transaction.
 *
 * @param params - An object containing the necessary parameters for launching the RGB++ asset.
 * @param params.rgbppTokenInfo - Information about the RGB++ token to be launched.
 * @param params.collector - The collector instance used to gather cells.
 * @param params.isMainnet - A boolean indicating whether the operation is on the mainnet.
 * @param params.btcTestnetType - (Optional) The type of BTC testnet to use.
 * @param params.btcAccount - The BTC account address.
 * @param params.btcAccountPubkey - (Optional) The public key of the BTC account.
 * @param params.btcDataSource - The data source for BTC transactions.
 * @param params.launchAmount - The amount of the asset to be launched, represented as a bigint.
 * @param params.btcService - The service instance for interacting with BTC assets.
 * @param params.ckbAddress - The CKB address where the asset will be launched.
 * @param params.cccSigner - The signer instance for CKB transactions.
 * @param params.filterUtxo - A function to filter UTXOs for the BTC transaction.
 * @param params.unisat - The wallet instance for signing and sending BTC transactions.
 * @param ckbFeeRate - (Optional) The fee rate for CKB transactions, represented as a bigint.
 * @param maxFee - (Optional) The maximum fee for the transaction, represented as a bigint. Defaults to MAX_FEE.
 * @param btcFeeRate - (Optional) The fee rate for BTC transactions, represented as a number.
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
    unisat,
    cccSigner,
  }: RgbppLauncerCombinedParams,
  ckbFeeRate?: bigint,
  maxFee: bigint = MAX_FEE,
  btcFeeRate?: number,
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
  );

  const { txHash } = await signAndSendTransaction(
    prepareLaunchCellTx,
    collector,
    cccSigner,
  );

  console.info(`Launch cell has been created and the CKB tx hash ${txHash}`);

  const ownerRgbppLockArgs = buildRgbppLockArgs(outIndex, btcTxId);

  const { btcTxId: TxId } = await launchRgbppAsset({
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
    unisat,
  }, btcFeeRate);

  return {
    btcTxId: TxId,
    ckbTxHash: txHash,
  };
};
