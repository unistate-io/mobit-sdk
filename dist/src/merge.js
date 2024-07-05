"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeCkbCells = void 0;
const helpers_1 = require("@ckb-lumos/helpers");
const common_scripts_1 = require("@ckb-lumos/common-scripts");
const bi_1 = require("@ckb-lumos/bi");
const config_manager_1 = require("@ckb-lumos/config-manager");
const helper_1 = require("./helper");
const common_scripts_2 = require("@ckb-lumos/common-scripts");
/**
 * Merge multiple CKB cells into a single larger CKB cell to reduce the number of cells and potentially release redundant space.
 *
 * @param txSkeleton - The transaction skeleton to which the merged cell will be added.
 * @param fromInfo - Information about the source of the cells to be merged.
 * @param changeAddress - The address to which the change capacity will be sent.
 * @param tipHeader - The tip header of the blockchain.
 * @param options - Additional options for the function.
 * @returns A promise that resolves to the updated transaction skeleton.
 */
function mergeCkbCells(txSkeleton, fromInfo, changeAddress, tipHeader, { config = undefined, CellCollector = undefined } = {}) {
    var _a, e_1, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        // Ensure the configuration is set or get the default configuration.
        config = config || (0, config_manager_1.getConfig)();
        // Parse the fromInfo to get the fromScript.
        const fromScript = (0, common_scripts_1.parseFromInfo)(fromInfo, { config }).fromScript;
        // Parse the changeAddress to get the changeOutputLockScript.
        const changeOutputLockScript = (0, helpers_1.parseAddress)(changeAddress, { config });
        // Retrieve the cell provider from the transaction skeleton.
        const cellProvider = txSkeleton.get("cellProvider");
        if (!cellProvider) {
            throw new Error("Cell provider is missing!");
        }
        if (!CellCollector) {
            throw new Error("CellCollector is not provided!");
        }
        // Create a cell collector to collect CKB cells.
        const cellCollector = new CellCollector(fromInfo, cellProvider, {
            config,
            queryOptions: {
                type: undefined,
                data: "any",
            },
        });
        // Initialize total capacity for the collected cells.
        let totalCapacity = bi_1.BI.from(0);
        const inputCells = [];
        try {
            // Collect all CKB cells and calculate the total capacity.
            for (var _d = true, _e = __asyncValues(cellCollector.collect()), _f; _f = yield _e.next(), _a = _f.done, !_a;) {
                _c = _f.value;
                _d = false;
                try {
                    const inputCell = _c;
                    inputCells.push(inputCell);
                    totalCapacity = totalCapacity.add(bi_1.BI.from(inputCell.cellOutput.capacity));
                }
                finally {
                    _d = true;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
            }
            finally { if (e_1) throw e_1.error; }
        }
        // Check if any CKB cells were found.
        if (inputCells.length === 0) {
            throw new Error("No CKB cells found to merge!");
        }
        // Add the collected input cells to the transaction skeleton.
        txSkeleton = txSkeleton.update("inputs", (inputs) => {
            return inputs.concat(inputCells);
        });
        // Create the merged output cell.
        const mergedOutput = {
            cellOutput: {
                capacity: "0x0",
                lock: fromScript,
                type: undefined,
            },
            data: "0x",
            outPoint: undefined,
            blockHash: undefined,
        };
        // Calculate the minimal capacity required for the merged output cell.
        const mergedCapacity = (0, helpers_1.minimalCellCapacityCompatible)(mergedOutput);
        mergedOutput.cellOutput.capacity = "0x" + mergedCapacity.toString(16);
        // Add the merged output cell to the transaction skeleton.
        txSkeleton = txSkeleton.update("outputs", (outputs) => {
            return outputs.push(mergedOutput);
        });
        // Calculate the change capacity.
        const changeCapacity = totalCapacity.sub(mergedCapacity);
        const changeCell = {
            cellOutput: {
                capacity: "0x" + changeCapacity.toString(16),
                lock: changeOutputLockScript,
                type: undefined,
            },
            data: "0x",
            outPoint: undefined,
            blockHash: undefined,
        };
        if (changeCapacity.gt(0)) {
            txSkeleton = txSkeleton.update("outputs", (outputs) => {
                return outputs.push(changeCell);
            });
        }
        // Add the cell dependency for the transaction.
        txSkeleton = (0, helper_1.addCellDep)(txSkeleton, {
            outPoint: {
                txHash: config.SCRIPTS.SECP256K1_BLAKE160.TX_HASH,
                index: config.SCRIPTS.SECP256K1_BLAKE160.INDEX,
            },
            depType: config.SCRIPTS.SECP256K1_BLAKE160.DEP_TYPE,
        });
        // Inject the capacity into the transaction skeleton.
        txSkeleton = yield common_scripts_2.common.injectCapacity(txSkeleton, [fromInfo], totalCapacity, undefined, tipHeader, {
            config,
        });
        return txSkeleton;
    });
}
exports.mergeCkbCells = mergeCkbCells;
