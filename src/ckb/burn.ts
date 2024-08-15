import {
  addressToScript,
  getTransactionSize,
} from "@nervosnetwork/ckb-sdk-utils";
import {
  append0x,
  calculateTransactionFee,
  calculateUdtCellCapacity,
  Collector,
  fetchTypeIdCellDeps,
  getXudtTypeScript,
  MAX_FEE,
  MIN_CAPACITY,
  NoLiveCellError,
  NoXudtLiveCellError,
  u128ToLe,
} from "@rgbpp-sdk/ckb";
import { calculateWitnessSize, getAddressCellDeps } from "../helper";

interface CreateBurnXudtTransactionParams {
  xudtArgs: string;
  burnAmount: bigint;
  ckbAddress: string;
  collector: Collector;
  isMainnet: boolean;
}
/**
 * Creates an unsigned transaction for burning xUDT assets.
 *
 * This function constructs a transaction that burns a specified amount of xUDT tokens from a given CKB address.
 * It fetches the necessary cells, collects inputs, and constructs the transaction outputs accordingly.
 *
 * @param {CreateBurnXudtTransactionParams} params - The parameters for creating the burn transaction.
 * @param {string} params.xudtArgs - The xUDT type script args, which is the unique identifier for the xUDT token type.
 * @param {bigint} params.burnAmount - The amount of xUDT asset to be burned, representing the quantity of tokens that will be destroyed.
 * @param {string} params.ckbAddress - The CKB address for the transaction, from which the tokens will be burned.
 * @param {Collector} params.collector - The collector instance used to fetch cells and collect inputs, responsible for gathering the necessary cells to construct the transaction.
 * @param {boolean} params.isMainnet - A boolean indicating whether the network is mainnet or testnet, affecting the type script and cell dependencies.
 * @param {bigint} [feeRate] - An optional parameter specifying the fee rate for the transaction. If not provided, a default fee rate will be used.
 * @param {bigint} [maxFee=MAX_FEE] - An optional parameter specifying the maximum fee for the transaction. Defaults to MAX_FEE if not provided.
 * @param {number} [witnessLockPlaceholderSize] - An optional parameter specifying the size of the witness lock placeholder.
 * @returns {Promise<CKBComponents.RawTransactionToSign>} - An unsigned transaction object that can be signed and submitted to the network.
 */
export async function createBurnXudtTransaction(
  {
    xudtArgs,
    burnAmount,
    ckbAddress,
    collector,
    isMainnet,
  }: CreateBurnXudtTransactionParams,
  feeRate?: bigint,
  maxFee: bigint = MAX_FEE,
  witnessLockPlaceholderSize?: number,
): Promise<CKBComponents.RawTransactionToSign> {
  const xudtType: CKBComponents.Script = {
    ...getXudtTypeScript(isMainnet),
    args: xudtArgs,
  };

  const fromLock = addressToScript(ckbAddress);
  const xudtCells = await collector.getCells({
    lock: fromLock,
    type: xudtType,
  });

  console.debug("Fetched xudt cells:", xudtCells);

  if (!xudtCells || xudtCells.length === 0) {
    throw new NoXudtLiveCellError("The address has no xudt cells");
  }

  const {
    inputs: udtInputs,
    sumInputsCapacity,
    sumAmount,
  } = collector.collectUdtInputs({
    liveCells: xudtCells,
    needAmount: burnAmount,
  });

  let actualInputsCapacity = sumInputsCapacity;
  let inputs = udtInputs;

  console.debug("Collected inputs:", inputs);
  console.debug("Sum of inputs capacity:", sumInputsCapacity);
  console.debug("Sum of amount:", sumAmount);

  if (sumAmount < burnAmount) {
    throw new Error("Not enough xUDT tokens to burn");
  }

  const outputs: CKBComponents.CellOutput[] = [];
  const outputsData: string[] = [];

  let sumXudtOutputCapacity = BigInt(0);

  if (sumAmount > burnAmount) {
    const xudtChangeCapacity = calculateUdtCellCapacity(fromLock);
    outputs.push({
      lock: fromLock,
      type: xudtType,
      capacity: append0x(xudtChangeCapacity.toString(16)),
    });
    outputsData.push(append0x(u128ToLe(sumAmount - burnAmount)));
    sumXudtOutputCapacity += xudtChangeCapacity;

    console.debug("XUDT change capacity:", xudtChangeCapacity);
    console.debug("Updated outputs:", outputs);
    console.debug("Updated outputs data:", outputsData);
  }

  const txFee = maxFee;
  if (sumInputsCapacity <= sumXudtOutputCapacity) {
    let emptyCells = await collector.getCells({
      lock: fromLock,
    });

    console.debug("Fetched Empty Cells:", emptyCells);

    emptyCells = emptyCells.filter((cell) => !cell.output.type);

    if (!emptyCells || emptyCells.length === 0) {
      throw new NoLiveCellError("The address has no empty cells");
    }

    const needCapacity = sumXudtOutputCapacity - sumInputsCapacity;
    const { inputs: emptyInputs, sumInputsCapacity: sumEmptyCapacity } =
      collector.collectInputs(emptyCells, needCapacity, txFee, {
        minCapacity: MIN_CAPACITY,
      });
    inputs = [...inputs, ...emptyInputs];
    actualInputsCapacity += sumEmptyCapacity;

    console.debug("Need Capacity:", needCapacity);
    console.debug("Empty Inputs:", emptyInputs);
    console.debug("Sum Empty Capacity:", sumEmptyCapacity);
  }

  let changeCapacity = actualInputsCapacity - sumXudtOutputCapacity;
  outputs.push({
    lock: fromLock,
    capacity: append0x(changeCapacity.toString(16)),
  });
  outputsData.push("0x");

  console.debug("Change Capacity:", changeCapacity);
  console.debug("Updated Outputs:", outputs);
  console.debug("Updated Outputs Data:", outputsData);

  const emptyWitness = { lock: "", inputType: "", outputType: "" };
  const witnesses = inputs.map((_, index) => index === 0 ? emptyWitness : "0x");

  const cellDeps = [
    ...(await getAddressCellDeps(isMainnet, [ckbAddress])),
    ...(await fetchTypeIdCellDeps(isMainnet, { xudt: true })),
  ];

  const unsignedTx: CKBComponents.RawTransactionToSign = {
    version: "0x0",
    cellDeps,
    headerDeps: [],
    inputs,
    outputs,
    outputsData,
    witnesses,
  };

  console.debug("Unsigned transaction:", unsignedTx);

  if (txFee === maxFee) {
    const txSize = getTransactionSize(unsignedTx) +
      (witnessLockPlaceholderSize ??
        calculateWitnessSize(ckbAddress, isMainnet));
    const estimatedTxFee = calculateTransactionFee(txSize, feeRate);
    changeCapacity -= estimatedTxFee;
    unsignedTx.outputs[unsignedTx.outputs.length - 1].capacity = append0x(
      changeCapacity.toString(16),
    );

    console.debug("Transaction size:", txSize);
    console.debug("Estimated transaction fee:", estimatedTxFee);
    console.debug("Updated change capacity:", changeCapacity);
    console.debug("Updated unsigned transaction:", unsignedTx);
  }

  return unsignedTx;
}
