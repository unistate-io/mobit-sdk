import { addressToScript, scriptToHash } from "@nervosnetwork/ckb-sdk-utils";
import {
  append0x,
  calculateUdtCellCapacity,
  calculateXudtTokenInfoCellCapacity,
  Collector,
  encodeRgbppTokenInfo,
  fetchTypeIdCellDeps,
  generateUniqueTypeArgs,
  getUniqueTypeScript,
  getXudtTypeScript,
  MIN_CAPACITY,
  NoLiveCellError,
  RgbppTokenInfo,
  u128ToLe,
} from "@rgbpp-sdk/ckb";
import { getAddressCellDeps } from "../helper";

/**
 * Interface for parameters required to create an issue xUDT transaction.
 */
export interface CreateIssueXudtTransactionParams {
  /**
   * The total amount of xUDT asset to be issued.
   */
  xudtTotalAmount: bigint;
  /**
   * The xUDT token information including decimal, name, and symbol.
   */
  tokenInfo: RgbppTokenInfo;
  /**
   * The CKB address for the transaction.
   */
  ckbAddress: string;
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
 * Creates an unsigned transaction for issuing xUDT assets with a unique cell as the token info cell.
 *
 * @param {CreateIssueXudtTransactionParams} params - An object containing the parameters for the transaction.
 * @param {bigint} params.xudtTotalAmount - The total amount of xUDT asset to be issued.
 * @param {RgbppTokenInfo} params.tokenInfo - The xUDT token information including decimal, name, and symbol.
 * @param {string} params.ckbAddress - The CKB address for the transaction.
 * @param {Collector} params.collector - The collector instance used to fetch cells and collect inputs.
 * @param {boolean} params.isMainnet - A boolean indicating whether the network is mainnet or testnet.
 *
 * @returns {Promise<CKBComponents.RawTransactionToSign>} A promise that resolves to an unsigned transaction object.
 */
export async function createIssueXudtTransaction({
  xudtTotalAmount,
  tokenInfo,
  ckbAddress,
  collector,
  isMainnet,
}: CreateIssueXudtTransactionParams): Promise<CKBComponents.RawTransactionToSign> {
  const issueLock = addressToScript(ckbAddress);

  // Fetching empty cells and adding debug information
  let emptyCells = await collector.getCells({
    lock: issueLock,
  });

  console.debug("Fetched empty cells:", emptyCells);

  if (!emptyCells || emptyCells.length === 0) {
    throw new NoLiveCellError("The address has no empty cells");
  }

  // Filtering cells without a type and adding debug information
  emptyCells = emptyCells.filter((cell) => !cell.output.type);

  console.debug("Filtered empty cells without a type:", emptyCells);
  // Calculate the capacity required for the xUDT cell and add debug information
  const xudtCapacity = calculateUdtCellCapacity(issueLock);
  console.debug("Calculated xUDT cell capacity:", xudtCapacity);

  // Calculate the capacity required for the xUDT token info cell and add debug information
  const xudtInfoCapacity = calculateXudtTokenInfoCellCapacity(
    tokenInfo,
    issueLock,
  );
  console.debug("Calculated xUDT token info cell capacity:", xudtInfoCapacity);

  // Collect inputs for the transaction and add debug information
  const { inputs, sumInputsCapacity } = collector.collectInputs(
    emptyCells,
    xudtCapacity + xudtInfoCapacity,
    BigInt(0),
    {
      minCapacity: MIN_CAPACITY,
    },
  );
  console.debug("Collected inputs:", inputs);
  console.debug("Sum of inputs capacity:", sumInputsCapacity);

  // Define the xUDT type script and add debug information
  const xudtType: CKBComponents.Script = {
    ...getXudtTypeScript(isMainnet),
    args: append0x(scriptToHash(issueLock)),
  };
  console.debug("Defined xUDT type script:", xudtType);

  console.log("xUDT type script", xudtType);
  // Calculate the change capacity and add debug information
  let changeCapacity = sumInputsCapacity - xudtCapacity - xudtInfoCapacity;
  console.debug("Calculated change capacity:", changeCapacity);

  // Define the outputs and add debug information
  const outputs: CKBComponents.CellOutput[] = [
    {
      lock: issueLock,
      type: xudtType,
      capacity: append0x(xudtCapacity.toString(16)),
    },
    {
      lock: issueLock,
      type: {
        ...getUniqueTypeScript(isMainnet),
        args: generateUniqueTypeArgs(inputs[0], 1),
      },
      capacity: append0x(xudtInfoCapacity.toString(16)),
    },
    {
      lock: issueLock,
      capacity: append0x(changeCapacity.toString(16)),
    },
  ];
  console.debug("Defined outputs:", outputs);

  // Calculate the total amount and add debug information
  const totalAmount = xudtTotalAmount * BigInt(10 ** tokenInfo.decimal);
  console.debug("Calculated total amount:", totalAmount);

  // Define the outputs data and add debug information
  const outputsData = [
    append0x(u128ToLe(totalAmount)),
    encodeRgbppTokenInfo(tokenInfo),
    "0x",
  ];
  console.debug("Defined outputs data:", outputsData);

  // Define the cell dependencies and add debug information
  const cellDeps = [
    ...(await getAddressCellDeps(isMainnet, [ckbAddress])),
    ...(await fetchTypeIdCellDeps(isMainnet, { xudt: true, unique: true })),
  ];
  console.debug("Defined cell dependencies:", cellDeps);

  // Define the unsigned transaction and add debug information
  const unsignedTx: CKBComponents.RawTransactionToSign = {
    version: "0x0",
    cellDeps,
    headerDeps: [],
    inputs,
    outputs,
    outputsData,
    witnesses: [],
  };
  console.debug("Defined unsigned transaction:", unsignedTx);

  return unsignedTx;
}
