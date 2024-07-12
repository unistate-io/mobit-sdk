import { isOmnilockAddress } from "@ckb-lumos/common-scripts/lib/helper";
import { createOmnilockScript } from "@ckb-lumos/common-scripts/lib/omnilock";
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
  getSecp256k1CellDep,
  getXudtTypeScript,
  IndexerCell,
  leToU128,
  MAX_FEE,
  NoXudtLiveCellError,
  remove0x,
  SECP256K1_WITNESS_LOCK_SIZE,
  u128ToLe,
} from "@rgbpp-sdk/ckb";

interface CreateMergeXudtTransactionParams {
  xudtArgs: string;
  ckbAddresses: string[];
  collector: Collector;
  isMainnet: boolean;
}

/**
 * Merges multiple xUDT cells into a single xUDT cell and returns the remaining capacity as a separate cell.
 * @param xudtArgs The xUDT type script args
 * @param ckbAddresses The CKB addresses for the transaction
 * @param collector The collector instance used to fetch cells and collect inputs
 * @param isMainnet A boolean indicating whether the network is mainnet or testnet
 * @returns An unsigned transaction object
 */
export async function createMergeXudtTransaction({
  xudtArgs,
  ckbAddresses,
  collector,
  isMainnet,
}: CreateMergeXudtTransactionParams): Promise<CKBComponents.RawTransactionToSign> {
  const xudtType: CKBComponents.Script = {
    ...getXudtTypeScript(isMainnet),
    args: xudtArgs,
  };

  const fromLocks = ckbAddresses.map(addressToScript);
  let xudtCells: IndexerCell[] = [];

  for (const lock of fromLocks) {
    const cells = await collector.getCells({
      lock: lock,
      type: xudtType,
    });
    xudtCells = xudtCells.concat(cells);
  }

  console.debug("Fetched xudt cells:", xudtCells);

  if (!xudtCells || xudtCells.length === 0) {
    throw new NoXudtLiveCellError("The addresses have no xudt cells");
  }

  if (xudtCells.length === 1) {
    throw new Error("Only one xudt cell found, no need to merge");
  }

  const {
    inputs: udtInputs,
    sumInputsCapacity,
    sumAmount,
  } = collectAllUdtInputs(xudtCells);

  let actualInputsCapacity = sumInputsCapacity;
  let inputs = udtInputs;

  console.debug("Collected inputs:", inputs);
  console.debug("Sum of inputs capacity:", sumInputsCapacity);
  console.debug("Sum of amount:", sumAmount);

  const mergedXudtCapacity = calculateUdtCellCapacity(fromLocks[0]);
  const outputs: CKBComponents.CellOutput[] = [
    {
      lock: fromLocks[0],
      type: xudtType,
      capacity: append0x(mergedXudtCapacity.toString(16)),
    },
  ];
  const outputsData: string[] = [append0x(u128ToLe(sumAmount))];

  let sumXudtOutputCapacity = mergedXudtCapacity;

  console.debug("Merged XUDT capacity:", mergedXudtCapacity);
  console.debug("Updated outputs:", outputs);
  console.debug("Updated outputs data:", outputsData);

  const txFee = MAX_FEE;
  if (sumInputsCapacity <= sumXudtOutputCapacity) {
    throw new Error(
      "Thetotal input capacity is less than or equal to the total output capacity, which is not possible in a merge function."
    );
  }

  let changeCapacity = actualInputsCapacity - sumXudtOutputCapacity;
  outputs.push({
    lock: fromLocks[0],
    capacity: append0x(changeCapacity.toString(16)),
  });
  outputsData.push("0x");

  console.debug("Change Capacity:", changeCapacity);
  console.debug("Updated Outputs:", outputs);
  console.debug("Updated Outputs Data:", outputsData);

  const emptyWitness = { lock: "", inputType: "", outputType: "" };
  const witnesses = inputs.map((_, index) =>
    index === 0 ? emptyWitness : "0x"
  );

  const cellDeps = [
    getSecp256k1CellDep(isMainnet),
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

  if (txFee === MAX_FEE) {
    const txSize = getTransactionSize(unsignedTx) + SECP256K1_WITNESS_LOCK_SIZE;
    const estimatedTxFee = calculateTransactionFee(txSize);
    changeCapacity -= estimatedTxFee;
    unsignedTx.outputs[unsignedTx.outputs.length - 1].capacity = append0x(
      changeCapacity.toString(16)
    );

    console.debug("Transaction size:", txSize);
    console.debug("Estimated transaction fee:", estimatedTxFee);
    console.debug("Updated change capacity:", changeCapacity);
    console.debug("Updated unsigned transaction:", unsignedTx);
  }

  return unsignedTx;
}

function collectAllUdtInputs(liveCells: IndexerCell[]): {
  inputs: CKBComponents.CellInput[];
  sumInputsCapacity: bigint;
  sumAmount: bigint;
} {
  const inputs = [];
  let sumInputsCapacity = BigInt(0);
  let sumAmount = BigInt(0);
  for (const cell of liveCells) {
    if (cell.outputData === "0x") {
      continue;
    }
    inputs.push({
      previousOutput: {
        txHash: cell.outPoint.txHash,
        index: cell.outPoint.index,
      },
      since: "0x0",
    });
    sumInputsCapacity = sumInputsCapacity + BigInt(cell.output.capacity);
    // XUDT cell.data = <amount: uint128> <xudt data (optional)>
    // Ref: https://blog.cryptape.com/enhance-sudts-programmability-with-xudt#heading-xudt-cell
    sumAmount += leToU128(remove0x(cell.outputData).slice(0, 32));
  }

  return { inputs, sumInputsCapacity, sumAmount };
}
