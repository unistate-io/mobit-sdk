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
  SECP256K1_WITNESS_LOCK_SIZE,
  u128ToLe,
} from "@rgbpp-sdk/ckb";
import { getAddressCellDeps } from "../helper";

interface CreateTransferXudtTransactionParams {
  xudtArgs: string;
  receivers: { toAddress: string; transferAmount: bigint }[];
  ckbAddress: string;
  collector: Collector;
  isMainnet: boolean;
}

/**
 * transferXudt can be used to mint xUDT assets or transfer xUDT assets.
 * @param xudtArgs The xUDT type script args
 * @param receivers The receiver includes toAddress and transferAmount
 * @param ckbAddress The CKB address for the transaction
 * @param collector The collector instance used to fetch cells and collect inputs
 * @param isMainnet A boolean indicating whether the network is mainnet or testnet
 * @returns An unsigned transaction object
 */
export async function createTransferXudtTransaction(
  { xudtArgs, receivers, ckbAddress, collector, isMainnet }:
    CreateTransferXudtTransactionParams,
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

  const outputs: CKBComponents.CellOutput[] = receivers.map((
    { toAddress },
  ) => ({
    lock: addressToScript(toAddress),
    type: xudtType,
    capacity: append0x(
      calculateUdtCellCapacity(addressToScript(toAddress)).toString(16),
    ),
  }));

  const outputsData = receivers.map(({ transferAmount }) =>
    append0x(u128ToLe(transferAmount))
  );

  console.debug("Outputs:", outputs);
  console.debug("Outputs Data:", outputsData);

  if (sumAmount > sumTransferAmount) {
    const xudtChangeCapacity = calculateUdtCellCapacity(fromLock);
    outputs.push({
      lock: fromLock,
      type: xudtType,
      capacity: append0x(xudtChangeCapacity.toString(16)),
    });
    outputsData.push(append0x(u128ToLe(sumAmount - sumTransferAmount)));
    sumXudtOutputCapacity += xudtChangeCapacity;

    console.debug("XUDT Change Capacity:", xudtChangeCapacity);
    console.debug("Updated Outputs:", outputs);
    console.debug("Updated Outputs Data:", outputsData);
  }

  const txFee = MAX_FEE;

  if (sumXudtInputsCapacity <= sumXudtOutputCapacity) {
    let emptyCells = await collector.getCells({
      lock: fromLock,
    });

    console.debug("Fetched Empty Cells:", emptyCells);

    emptyCells = emptyCells.filter((cell) => !cell.output.type);

    if (!emptyCells || emptyCells.length === 0) {
      throw new NoLiveCellError("The address has no empty cells");
    }

    const needCapacity = sumXudtOutputCapacity - sumXudtInputsCapacity;
    const { inputs: emptyInputs, sumInputsCapacity: sumEmptyCapacity } =
      collector.collectInputs(
        emptyCells,
        needCapacity,
        txFee,
        { minCapacity: MIN_CAPACITY },
      );
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
  const witnesses = inputs.map((
    _,
    index,
  ) => (index === 0 ? emptyWitness : "0x"));

  console.debug("Witnesses:", witnesses);

  const cellDeps = [
    ...(await getAddressCellDeps(isMainnet, [ckbAddress])),
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

  if (txFee === MAX_FEE) {
    const txSize = getTransactionSize(unsignedTx) + SECP256K1_WITNESS_LOCK_SIZE;
    const estimatedTxFee = calculateTransactionFee(txSize);
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
