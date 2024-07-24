import * as BaseComponents from "@ckb-lumos/base";
import {
  bytes,
  createFixedBytesCodec,
  molecule,
  number,
} from "@ckb-lumos/codec";
import { BytesLike, FixedBytesCodec } from "@ckb-lumos/codec/lib/base";
import {
  TransactionSkeleton,
  TransactionSkeletonType,
} from "@ckb-lumos/helpers";
import { Collector } from "@rgbpp-sdk/ckb";

function convertCellDep(
  cellDep: CKBComponents.CellDep,
): BaseComponents.CellDep {
  if (!cellDep.outPoint) {
    throw new Error("CellDep outPoint is required but was not provided.");
  }
  return {
    outPoint: cellDep.outPoint,
    depType: cellDep.depType,
  };
}

function convertCellOutput(
  cellOutput: CKBComponents.CellOutput,
): BaseComponents.Output {
  return {
    capacity: cellOutput.capacity,
    lock: cellOutput.lock,
    type: cellOutput.type ? cellOutput.type : undefined,
  };
}

function convertCellInput(
  cellInput: CKBComponents.CellInput,
): BaseComponents.Input {
  if (!cellInput.previousOutput) {
    throw new Error(
      "CellInput previousOutput is required but was not provided.",
    );
  }
  return {
    previousOutput: cellInput.previousOutput,
    since: cellInput.since,
  };
}

function convertLiveCell(
  liveCell: CKBComponents.LiveCell,
  outPoint: BaseComponents.OutPoint,
): BaseComponents.Cell {
  return {
    cellOutput: convertCellOutput(liveCell.output),
    data: liveCell.data ? liveCell.data.content : "",
    outPoint,
  };
}

const { table, option, vector, byteVecOf } = molecule;

const { Uint8 } = number;

const { bytify, hexify } = bytes;

function createFixedHexBytesCodec(
  byteLength: number,
): FixedBytesCodec<string, BytesLike> {
  return createFixedBytesCodec({
    byteLength,
    pack: (hex) => bytify(hex),
    unpack: (buf) => hexify(buf),
  });
}

const Bytes = byteVecOf({ pack: bytify, unpack: hexify });

const BytesOpt = option(Bytes);
const Byte32 = createFixedHexBytesCodec(32);

const Script = table(
  {
    codeHash: Byte32,
    hashType: Uint8,
    args: Bytes,
  },
  ["codeHash", "hashType", "args"],
);
const ScriptOpt = option(Script);
const ScriptVecOpt = option(vector(Script));

const xudtWitnessType = table(
  {
    owner_script: ScriptOpt,
    owner_signature: BytesOpt,
    raw_extension_data: ScriptVecOpt,
    extension_data: vector(Bytes),
  },
  ["owner_script", "owner_signature", "raw_extension_data", "extension_data"],
);

const EMPTY_WITNESS: string = (() => {
  /* 65-byte zeros in hex */
  const lockWitness =
    "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

  const inputTypeWitness = xudtWitnessType.pack({ extension_data: [] });
  const outputTypeWitness = xudtWitnessType.pack({ extension_data: [] });
  const witnessArgs = BaseComponents.blockchain.WitnessArgs.pack({
    lock: lockWitness,
    inputType: inputTypeWitness,
    outputType: outputTypeWitness,
  });
  return bytes.hexify(witnessArgs);
})();

export async function convertToTxSkeleton(
  rawTransaction: CKBComponents.RawTransactionToSign,
  collector: Collector,
): Promise<TransactionSkeletonType> {
  console.debug("Starting conversion to TransactionSkeleton");

  console.debug("Mapping rawTransaction to transaction object");
  const transaction: import("@ckb-lumos/base").Transaction = {
    ...rawTransaction,
    witnesses: rawTransaction.witnesses.map((witness) => {
      console.debug(
        `Processing witness: ${
          typeof witness === "string" ? witness : "non-string witness"
        }`,
      );
      return typeof witness === "string" ? witness : EMPTY_WITNESS;
    }),
    inputs: rawTransaction.inputs.map((input) => {
      console.debug(`Converting cell input: ${JSON.stringify(input)}`);
      return convertCellInput(input);
    }),
    outputs: rawTransaction.outputs.map((output) => {
      console.debug(`Converting cell output: ${JSON.stringify(output)}`);
      return convertCellOutput(output);
    }),
    cellDeps: rawTransaction.cellDeps.map((cellDep) => {
      console.debug(`Converting cell dep: ${JSON.stringify(cellDep)}`);
      return convertCellDep(cellDep);
    }),
  };

  console.debug("Initializing TransactionSkeleton");
  let txSkeleton = TransactionSkeleton();

  console.debug("Updating cellDeps and headerDeps in TransactionSkeleton");
  txSkeleton = txSkeleton
    .update("cellDeps", (cellDeps) => {
      console.debug(`Adding cellDeps: ${JSON.stringify(transaction.cellDeps)}`);
      return cellDeps.push(...transaction.cellDeps);
    })
    .update("headerDeps", (headerDeps) => {
      console.debug(
        `Adding headerDeps: ${JSON.stringify(transaction.headerDeps)}`,
      );
      return headerDeps.push(...transaction.headerDeps);
    });

  console.debug("Fetching input cells");
  const inputCells = (await collector.getLiveCells(
    transaction.inputs.map((input) => input.previousOutput),
    true,
  )).map((cell, idx) => {
    return convertLiveCell(cell, transaction.inputs[idx].previousOutput);
  });

  console.debug("Updating inputs in TransactionSkeleton");
  txSkeleton = txSkeleton.update("inputs", (inputs) => {
    console.debug(`Adding inputCells: ${JSON.stringify(inputCells)}`);
    return inputs.push(...inputCells);
  });

  console.debug("Updating inputSinces in TransactionSkeleton");
  txSkeleton = txSkeleton.update("inputSinces", (inputSinces) => {
    console.debug("Mapping inputSinces");
    return transaction.inputs.reduce((map, input, i) => {
      console.debug(`Setting since for input at index ${i}: ${input.since}`);
      return map.set(i, input.since);
    }, inputSinces);
  });

  console.debug("Mapping output cells");
  const outputCells: Array<BaseComponents.Cell> = transaction.outputs.map(
    (output, index) => {
      console.debug(
        `Creating output cell for output at index ${index}: ${
          JSON.stringify(output)
        }`,
      );
      return {
        cellOutput: output,
        data: transaction.outputsData[index] ?? "0x",
      };
    },
  );

  console.debug("Updating outputs and witnesses in TransactionSkeleton");
  txSkeleton = txSkeleton
    .update("outputs", (outputs) => {
      console.debug(`Adding outputCells: ${JSON.stringify(outputCells)}`);
      return outputs.push(...outputCells);
    })
    .update("witnesses", (witnesses) => {
      console.debug(
        `Adding witnesses: ${JSON.stringify(transaction.witnesses)}`,
      );
      return witnesses.push(...transaction.witnesses);
    });

  console.debug("Conversion to TransactionSkeleton completed");
  return txSkeleton;
}
