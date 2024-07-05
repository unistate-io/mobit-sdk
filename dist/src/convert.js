"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToTxSkeleton = exports.EMPTY_WITNESS = exports.Byte32Vec = exports.Byte32 = exports.BytesOpt = exports.Bytes = exports.createFixedHexBytesCodec = void 0;
const BaseComponents = __importStar(require("@ckb-lumos/base"));
const helpers_1 = require("@ckb-lumos/helpers");
const codec_1 = require("@ckb-lumos/codec");
function convertCellDep(cellDep) {
    if (!cellDep.outPoint) {
        throw new Error("CellDep outPoint is required but was not provided.");
    }
    return {
        outPoint: cellDep.outPoint,
        depType: cellDep.depType,
    };
}
function convertCellOutput(cellOutput) {
    return {
        capacity: cellOutput.capacity,
        lock: cellOutput.lock,
        type: cellOutput.type ? cellOutput.type : undefined,
    };
}
function convertCellInput(cellInput) {
    if (!cellInput.previousOutput) {
        throw new Error("CellInput previousOutput is required but was not provided.");
    }
    return {
        previousOutput: cellInput.previousOutput,
        since: cellInput.since,
    };
}
function convertLiveCell(liveCell) {
    if (!liveCell.data) {
        throw new Error("LiveCell data is required but was not provided.");
    }
    return {
        cellOutput: convertCellOutput(liveCell.output),
        data: liveCell.data.content,
    };
}
const { table, option, vector, byteVecOf } = codec_1.molecule;
const { Uint8 } = codec_1.number;
const { bytify, hexify } = codec_1.bytes;
function createFixedHexBytesCodec(byteLength) {
    return (0, codec_1.createFixedBytesCodec)({
        byteLength,
        pack: (hex) => bytify(hex),
        unpack: (buf) => hexify(buf),
    });
}
exports.createFixedHexBytesCodec = createFixedHexBytesCodec;
exports.Bytes = byteVecOf({ pack: bytify, unpack: hexify });
exports.BytesOpt = option(exports.Bytes);
exports.Byte32 = createFixedHexBytesCodec(32);
exports.Byte32Vec = vector(exports.Byte32);
const Script = table({
    codeHash: exports.Byte32,
    hashType: Uint8,
    args: exports.Bytes,
}, ['codeHash', 'hashType', 'args']);
const ScriptOpt = option(Script);
const ScriptVecOpt = option(vector(Script));
const xudtWitnessType = table({
    owner_script: ScriptOpt,
    owner_signature: exports.BytesOpt,
    raw_extension_data: ScriptVecOpt,
    extension_data: vector(exports.Bytes),
}, ['owner_script', 'owner_signature', 'raw_extension_data', 'extension_data']);
const EMPTY_WITNESS = (() => {
    /* 65-byte zeros in hex */
    const lockWitness = '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
    const inputTypeWitness = xudtWitnessType.pack({ extension_data: [] });
    const outputTypeWitness = xudtWitnessType.pack({ extension_data: [] });
    const witnessArgs = BaseComponents.blockchain.WitnessArgs.pack({
        lock: lockWitness,
        inputType: inputTypeWitness,
        outputType: outputTypeWitness,
    });
    return codec_1.bytes.hexify(witnessArgs);
})();
exports.EMPTY_WITNESS = EMPTY_WITNESS;
function convertToTxSkeleton(rawTransaction, collector) {
    return __awaiter(this, void 0, void 0, function* () {
        const fetcher = (outPoint) => collector.getLiveCell(outPoint).then((cell) => convertLiveCell(cell));
        const transaction = Object.assign(Object.assign({}, rawTransaction), { witnesses: rawTransaction.witnesses.map((witness) => {
                if (typeof witness === 'string') {
                    return witness;
                }
                else {
                    return EMPTY_WITNESS;
                }
            }), inputs: rawTransaction.inputs.map(convertCellInput), outputs: rawTransaction.outputs.map(convertCellOutput), cellDeps: rawTransaction.cellDeps.map(convertCellDep) });
        let txSkeleton = (0, helpers_1.TransactionSkeleton)();
        txSkeleton = txSkeleton.update("cellDeps", (cellDeps) => cellDeps.push(...transaction.cellDeps));
        txSkeleton = txSkeleton.update("headerDeps", (headerDeps) => headerDeps.push(...transaction.headerDeps));
        const inputCells = yield Promise.all(transaction.inputs.map((input) => fetcher(input.previousOutput)));
        txSkeleton = txSkeleton.update("inputs", (inputs) => inputs.push(...inputCells));
        txSkeleton = txSkeleton.update("inputSinces", (inputSinces) => transaction.inputs.reduce((map, input, i) => map.set(i, input.since), inputSinces));
        const outputCells = transaction.outputs.map((output, index) => {
            var _a;
            return ({
                cellOutput: output,
                data: (_a = transaction.outputsData[index]) !== null && _a !== void 0 ? _a : "0x",
            });
        });
        txSkeleton = txSkeleton.update("outputs", (outputs) => outputs.push(...outputCells));
        txSkeleton = txSkeleton.update("witnesses", (witnesses) => witnesses.push(...transaction.witnesses));
        txSkeleton = txSkeleton.update("signingEntries", (signingEntries) => signingEntries.push());
        return txSkeleton;
    });
}
exports.convertToTxSkeleton = convertToTxSkeleton;
