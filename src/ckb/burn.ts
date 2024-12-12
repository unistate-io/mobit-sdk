import { addressToScript } from "@nervosnetwork/ckb-sdk-utils";
import {
  append0x,
  calculateUdtCellCapacity,
  Collector,
  fetchTypeIdCellDeps,
  getXudtTypeScript,
  MIN_CAPACITY,
  NoLiveCellError,
  NoXudtLiveCellError,
  u128ToLe,
} from "@rgbpp-sdk/ckb";
import { getAddressCellDeps } from "../helper";

/**
 * Interface for parameters required to create a burn transaction for xUDT assets.
 */
export interface CreateBurnXudtTransactionParams {
  /**
   * The xUDT type script args, which is the unique identifier for the xUDT token type.
   */
  xudtArgs: string;

  /**
   * The amount of xUDT asset to be burned, representing the quantity of tokens that will be destroyed.
   */
  burnAmount: bigint;

  /**
   * The CKB address for the transaction, from which the tokens will be burned.
   */
  ckbAddress: string;

  /**
   * The collector instance used to fetch cells and collect inputs, responsible for gathering the necessary cells to construct the transaction.
   */
  collector: Collector;

  /**
   * A boolean indicating whether the network is mainnet or testnet, affecting the type script and cell dependencies.
   */
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
 * @returns {Promise<CKBComponents.RawTransactionToSign>} - An unsigned transaction object that can be signed and submitted to the network.
 */
export async function createBurnXudtTransaction({
  xudtArgs,
  burnAmount,
  ckbAddress,
  collector,
  isMainnet,
}: CreateBurnXudtTransactionParams): Promise<CKBComponents.RawTransactionToSign> {
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
    witnesses: [],
  };

  console.debug("Unsigned transaction:", unsignedTx);

  return unsignedTx;
}
