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
import {
  calculateWitnessSize,
  getAddressCellDeps,
  getIndexerCells,
} from "../helper";

/**
 * Parameters for creating a transaction to transfer xUDT assets.
 */
export interface CreateTransferXudtTransactionParams {
  /**
   * The xUDT type script args.
   */
  xudtArgs: string;
  /**
   * An array of receiver objects containing `toAddress` and `transferAmount`.
   */
  receivers: { toAddress: string; transferAmount: bigint }[];
  /**
   * The CKB addresses for the transaction.
   */
  ckbAddresses: string[];
  /**
   * The collector instance used to fetch cells and collect inputs.
   */
  collector: Collector;
  /**
   * A boolean indicating whether the network is mainnet or testnet.
   */
  isMainnet: boolean;
}

/**
 * Creates an unsigned transaction for transferring xUDT assets. This function can also be used to mint xUDT assets.
 *
 * @param {CreateTransferXudtTransactionParams} params - The parameters for creating the transaction.
 * @param {string} params.xudtArgs - The xUDT type script args.
 * @param {Array<{ toAddress: string, transferAmount: bigint }>} params.receivers - An array of receiver objects containing `toAddress` and `transferAmount`.
 * @param {Array<string>} params.ckbAddresses - The CKB addresses for the transaction.
 * @param {Collector} params.collector - The collector instance used to fetch cells and collect inputs.
 * @param {boolean} params.isMainnet - A boolean indicating whether the network is mainnet or testnet.
 * @param {string} [ckbAddress=params.ckbAddresses[0]] - The address for the output cell, defaulting to the first address in the input address set.
 * @param {bigint} [feeRate] - (Optional) The fee rate to be used for the transaction.
 * @param {bigint} [maxFee=MAX_FEE] - (Optional) The maximum fee allowed for the transaction. Defaults to `MAX_FEE`.
 * @param {number} [witnessLockPlaceholderSize] - (Optional) The size of the witness lock placeholder.
 *
 * @returns {Promise<CKBComponents.RawTransactionToSign>} A promise that resolves to an unsigned transaction object.
 *
 * @throws {NoXudtLiveCellError} If the address has no xudt cells.
 * @throws {NoLiveCellError} If the address has no empty cells.
 */
export async function createTransferXudtTransaction(
  {
    xudtArgs,
    receivers,
    ckbAddresses,
    collector,
    isMainnet,
  }: CreateTransferXudtTransactionParams,
  ckbAddress: string = ckbAddresses[0],
  feeRate?: bigint,
  maxFee: bigint = MAX_FEE,
  witnessLockPlaceholderSize?: number,
): Promise<CKBComponents.RawTransactionToSign> {
  const xudtType: CKBComponents.Script = {
    ...getXudtTypeScript(isMainnet),
    args: xudtArgs,
  };

  const xudtCells = await getIndexerCells({
    ckbAddresses,
    type: xudtType,
    collector,
  });

  console.debug("Fetched xudt cells:", xudtCells);

  if (!xudtCells || xudtCells.length === 0) {
    throw new NoXudtLiveCellError("The addresses have no xudt cells");
  }

  const sumTransferAmount = receivers
    .map((receiver) => receiver.transferAmount)
    .reduce((prev, current) => prev + current, BigInt(0));

  console.debug("Sum Transfer Amount:", sumTransferAmount);

  let sumXudtOutputCapacity = receivers
    .map(({ toAddress }) =>
      calculateUdtCellCapacity(addressToScript(toAddress))
    )
    .reduce((prev, current) => prev + current, BigInt(0));

  console.debug("Sum XUDT Output Capacity:", sumXudtOutputCapacity);

  const {
    inputs: udtInputs,
    sumInputsCapacity: sumXudtInputsCapacity,
    sumAmount,
  } = collector.collectUdtInputs({
    liveCells: xudtCells,
    needAmount: sumTransferAmount,
  });

  console.debug("Sum XUDT Inputs Capacity:", sumXudtInputsCapacity);
  console.debug("Sum Amount:", sumAmount);

  let actualInputsCapacity = sumXudtInputsCapacity;
  let inputs = udtInputs;

  const outputs: CKBComponents.CellOutput[] = receivers.map(
    ({ toAddress }) => ({
      lock: addressToScript(toAddress),
      type: xudtType,
      capacity: append0x(
        calculateUdtCellCapacity(addressToScript(toAddress)).toString(16),
      ),
    }),
  );

  const outputsData = receivers.map(({ transferAmount }) =>
    append0x(u128ToLe(transferAmount))
  );

  console.debug("Outputs:", outputs);
  console.debug("Outputs Data:", outputsData);

  if (sumAmount > sumTransferAmount) {
    const xudtChangeCapacity = calculateUdtCellCapacity(
      addressToScript(ckbAddress),
    );
    outputs.push({
      lock: addressToScript(ckbAddress),
      type: xudtType,
      capacity: append0x(xudtChangeCapacity.toString(16)),
    });
    outputsData.push(append0x(u128ToLe(sumAmount - sumTransferAmount)));
    sumXudtOutputCapacity += xudtChangeCapacity;

    console.debug("XUDT Change Capacity:", xudtChangeCapacity);
    console.debug("Updated Outputs:", outputs);
    console.debug("Updated Outputs Data:", outputsData);
  }

  const txFee = maxFee;

  if (sumXudtInputsCapacity <= sumXudtOutputCapacity) {
    let emptyCells = await getIndexerCells({
      ckbAddresses,
      collector,
    });

    console.debug("Fetched Empty Cells:", emptyCells);

    emptyCells = emptyCells.filter((cell) => !cell.output.type);

    if (!emptyCells || emptyCells.length === 0) {
      throw new NoLiveCellError("The addresses have no empty cells");
    }

    const needCapacity = sumXudtOutputCapacity - sumXudtInputsCapacity;
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
    lock: addressToScript(ckbAddress),
    capacity: append0x(changeCapacity.toString(16)),
  });
  outputsData.push("0x");

  console.debug("Change Capacity:", changeCapacity);
  console.debug("Updated Outputs:", outputs);
  console.debug("Updated Outputs Data:", outputsData);

  const emptyWitness = { lock: "", inputType: "", outputType: "" };
  const witnesses = inputs.map((_, index) => index === 0 ? emptyWitness : "0x");

  const cellDeps = [
    ...(await getAddressCellDeps(isMainnet, ckbAddresses)),
    ...(await fetchTypeIdCellDeps(isMainnet, { xudt: true })),
  ];

  console.debug("Cell Deps:", cellDeps);

  const unsignedTx = {
    version: "0x0",
    cellDeps,
    headerDeps: [],
    inputs,
    outputs,
    outputsData,
    witnesses,
  };

  console.debug("Unsigned Transaction:", unsignedTx);

  if (txFee === maxFee) {
    const txSize = getTransactionSize(unsignedTx) +
      (witnessLockPlaceholderSize ??
        calculateWitnessSize(ckbAddress, isMainnet));
    const estimatedTxFee = calculateTransactionFee(txSize, feeRate);
    changeCapacity -= estimatedTxFee;
    unsignedTx.outputs[unsignedTx.outputs.length - 1].capacity = append0x(
      changeCapacity.toString(16),
    );
    console.debug("Transaction Size:", txSize);
    console.debug("Estimated Transaction Fee:", estimatedTxFee);
    console.debug("Updated Change Capacity:", changeCapacity);
    console.debug("Updated Unsigned Transaction:", unsignedTx);
  }

  return unsignedTx;
}
