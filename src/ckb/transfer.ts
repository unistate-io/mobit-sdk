import { addressToScript } from "@nervosnetwork/ckb-sdk-utils";
import {
  append0x,
  calculateUdtCellCapacity,
  Collector,
  fetchTypeIdCellDeps,
  getXudtTypeScript,
  NoXudtLiveCellError,
  u128ToLe,
} from "@rgbpp-sdk/ckb";
import { getAddressCellDeps, getIndexerCells } from "../helper";

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
      calculateUdtCellCapacity(addressToScript(toAddress)),
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
    append0x(u128ToLe(transferAmount)),
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

  const cellDeps = [
    ...(await getAddressCellDeps(isMainnet, ckbAddresses)),
    ...(isICKB(xudtArgs)
      ? [getICKBCellDep(isMainnet)]
      : await fetchTypeIdCellDeps(isMainnet, { xudt: true })),
  ];

  console.debug("Cell Deps:", cellDeps);

  const unsignedTx = {
    version: "0x0",
    cellDeps,
    headerDeps: [],
    inputs,
    outputs,
    outputsData,
    witnesses: [],
  };

  console.debug("Unsigned Transaction:", unsignedTx);

  return unsignedTx;
}

const ICKB_ARGS =
  "0xb73b6ab39d79390c6de90a09c96b290c331baf1798ed6f97aed02590929734e800000080";

function isICKB(xudtArgs: string): boolean {
  return xudtArgs === ICKB_ARGS;
}

const ICKB_CELL_DEP = {
  mainnet: {
    outPoint: {
      txHash:
        "0x621a6f38de3b9f453016780edac3b26bfcbfa3e2ecb47c2da275471a5d3ed165",
      index: "0x0",
    },
    depType: "depGroup",
  },
  testnet: {
    outPoint: {
      txHash:
        "0xf7ece4fb33d8378344cab11fcd6a4c6f382fd4207ac921cf5821f30712dcd311",
      index: "0x0",
    },
    depType: "depGroup",
  },
} as const;

function getICKBCellDep(isMainnet: boolean): CKBComponents.CellDep {
  return isMainnet ? ICKB_CELL_DEP.mainnet : ICKB_CELL_DEP.testnet;
}
