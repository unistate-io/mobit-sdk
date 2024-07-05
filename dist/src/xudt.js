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
exports.burnXudt = exports.mergeXudtCells = exports.packAmount = exports.unpackAmount = exports.ownerForXudt = exports.transfer = exports.issueToken = void 0;
const base_1 = require("@ckb-lumos/base");
const { computeScriptHash } = base_1.utils;
const common_scripts_1 = require("@ckb-lumos/common-scripts");
const { CellCollector: LocktimeCellCollector } = common_scripts_1.locktimePool;
const { CellCollector: AnyoneCanPayCellCollector } = common_scripts_1.anyoneCanPay;
const helpers_1 = require("@ckb-lumos/helpers");
const immutable_1 = require("immutable");
const config_manager_1 = require("@ckb-lumos/config-manager");
const { ScriptValue } = base_1.values;
const bi_1 = require("@ckb-lumos/bi");
const codec_1 = require("@ckb-lumos/codec");
const helper_1 = require("./helper");
/**
 * Issue an xUDT cell
 *
 * @param txSkeleton
 * @param fromInfo
 * @param amount
 * @param capacity
 * @param tipHeader
 * @param options
 */
function issueToken(txSkeleton, fromInfo, amount, capacity, tipHeader, { config = undefined } = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        config = config || (0, config_manager_1.getConfig)();
        const template = config.SCRIPTS.XUDT;
        if (!template) {
            throw new Error("Provided config does not have XUDT script setup!");
        }
        txSkeleton = (0, helper_1.addCellDep)(txSkeleton, {
            outPoint: {
                txHash: template.TX_HASH,
                index: template.INDEX,
            },
            depType: template.DEP_TYPE,
        });
        const fromScript = (0, common_scripts_1.parseFromInfo)(fromInfo, { config }).fromScript;
        const toScript = fromScript;
        const xudtTypeScript = {
            codeHash: template.CODE_HASH,
            hashType: template.HASH_TYPE,
            args: computeScriptHash(fromScript),
        };
        const targetOutput = {
            cellOutput: {
                capacity: "0x0",
                lock: toScript,
                type: xudtTypeScript,
            },
            data: codec_1.bytes.hexify(codec_1.number.Uint128LE.pack(amount)),
            outPoint: undefined,
            blockHash: undefined,
        };
        if (!capacity) {
            capacity = (0, helpers_1.minimalCellCapacityCompatible)(targetOutput);
        }
        const _capacity = bi_1.BI.from(capacity);
        targetOutput.cellOutput.capacity = "0x" + _capacity.toString(16);
        txSkeleton = txSkeleton.update("outputs", (outputs) => {
            return outputs.push(targetOutput);
        });
        const outputIndex = txSkeleton.get("outputs").size - 1;
        // fix entry
        txSkeleton = txSkeleton.update("fixedEntries", (fixedEntries) => {
            return fixedEntries.push({
                field: "outputs",
                index: outputIndex,
            });
        });
        txSkeleton = yield common_scripts_1.common.injectCapacity(txSkeleton, [fromInfo], bi_1.BI.from(bi_1.BI.from(targetOutput.cellOutput.capacity)), undefined, tipHeader, {
            config,
        });
        return txSkeleton;
    });
}
exports.issueToken = issueToken;
/**
 * @param txSkeleton
 * @param fromInfos
 * @param xudtToken
 * @param toAddress
 * @param amount
 * @param changeAddress if not provided, will use first fromInfo
 * @param capacity
 * @param tipHeader
 * @param options When `splitChangeCell = true` && change amount > 0 && change capacity >= minimalCellCapacity(change cell with xudt) + minimalCellCapacity(change cell without xudt), change cell will split to two change cells, one with xudt and one without.
 */
function transfer(txSkeleton, fromInfos, xudtToken, toAddress, amount, changeAddress, capacity, tipHeader, { config = undefined, LocktimePoolCellCollector = LocktimeCellCollector, splitChangeCell = false, } = {}) {
    var _a, e_1, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        config = config || (0, config_manager_1.getConfig)();
        let _amount = bi_1.BI.from(amount);
        let _capacity = capacity ? bi_1.BI.from(capacity) : undefined;
        const XUDT_SCRIPT = config.SCRIPTS.XUDT;
        if (!XUDT_SCRIPT) {
            throw new Error("Provided config does not have XUDT script setup!");
        }
        if (fromInfos.length === 0) {
            throw new Error("`fromInfos` can't be empty!");
        }
        if (!toAddress) {
            throw new Error("You must provide a to address!");
        }
        const toScript = (0, helpers_1.parseAddress)(toAddress, { config });
        const fromScripts = fromInfos.map((fromInfo) => (0, common_scripts_1.parseFromInfo)(fromInfo, { config }).fromScript);
        const changeOutputLockScript = changeAddress
            ? (0, helpers_1.parseAddress)(changeAddress, { config })
            : fromScripts[0];
        if (_amount.lte(0)) {
            throw new Error("amount must be greater than 0");
        }
        const xudtType = _generateXudtScript(xudtToken, config);
        const cellProvider = txSkeleton.get("cellProvider");
        if (!cellProvider) {
            throw new Error("Cell provider is missing!");
        }
        // if toScript is an anyone-can-pay script
        let toAddressInputCapacity = bi_1.BI.from(0);
        let toAddressInputAmount = bi_1.BI.from(0);
        if ((0, helper_1.isAcpScript)(toScript, config)) {
            const toAddressCellCollector = new AnyoneCanPayCellCollector(toAddress, cellProvider, {
                config,
                queryOptions: {
                    type: xudtType,
                    data: "any",
                },
            });
            const toAddressInput = (yield toAddressCellCollector.collect().next()).value;
            if (!toAddressInput) {
                throw new Error(`toAddress ANYONE_CAN_PAY input not found!`);
            }
            txSkeleton = txSkeleton.update("inputs", (inputs) => {
                return inputs.push(toAddressInput);
            });
            txSkeleton = txSkeleton.update("witnesses", (witnesses) => {
                return witnesses.push("0x");
            });
            toAddressInputCapacity = bi_1.BI.from(toAddressInput.cellOutput.capacity);
            toAddressInputAmount = unpackAmount(toAddressInput.data);
        }
        const targetOutput = {
            cellOutput: {
                capacity: "0x0",
                lock: toScript,
                type: xudtType,
            },
            data: codec_1.bytes.hexify(codec_1.number.Uint128LE.pack(_amount)),
            outPoint: undefined,
            blockHash: undefined,
        };
        if ((0, helper_1.isAcpScript)(toScript, config)) {
            if (!_capacity) {
                _capacity = bi_1.BI.from(0);
            }
            targetOutput.cellOutput.capacity = "0x" +
                toAddressInputCapacity.add(_capacity).toString(16);
            targetOutput.data = codec_1.bytes.hexify(codec_1.number.Uint128LE.pack(toAddressInputAmount.add(_amount)));
        }
        else {
            if (!_capacity) {
                _capacity = bi_1.BI.from((0, helpers_1.minimalCellCapacityCompatible)(targetOutput));
            }
            targetOutput.cellOutput.capacity = "0x" + _capacity.toString(16);
        }
        // collect cells with which includes xUDT info
        txSkeleton = txSkeleton.update("outputs", (outputs) => {
            return outputs.push(targetOutput);
        });
        txSkeleton = txSkeleton.update("fixedEntries", (fixedEntries) => {
            return fixedEntries.push({
                field: "outputs",
                index: txSkeleton.get("outputs").size - 1,
            });
        });
        txSkeleton = (0, helper_1.addCellDep)(txSkeleton, {
            outPoint: {
                txHash: XUDT_SCRIPT.TX_HASH,
                index: XUDT_SCRIPT.INDEX,
            },
            depType: XUDT_SCRIPT.DEP_TYPE,
        });
        // collect cells
        const changeCell = {
            cellOutput: {
                capacity: "0x0",
                lock: changeOutputLockScript,
                type: xudtType,
            },
            data: codec_1.bytes.hexify(codec_1.number.Uint128LE.pack(0)),
            outPoint: undefined,
            blockHash: undefined,
        };
        const changeCellWithoutXudt = {
            cellOutput: {
                capacity: "0x0",
                lock: changeOutputLockScript,
                type: undefined,
            },
            data: "0x",
            outPoint: undefined,
            blockHash: undefined,
        };
        let changeCapacity = bi_1.BI.from(0);
        let changeAmount = bi_1.BI.from(0);
        let previousInputs = (0, immutable_1.Set)();
        for (const input of txSkeleton.get("inputs")) {
            previousInputs = previousInputs.add(`${input.outPoint.txHash}_${input.outPoint.index}`);
        }
        let cellCollectorInfos = (0, immutable_1.List)();
        if (tipHeader) {
            fromInfos.forEach((fromInfo, index) => {
                const locktimePoolCellCollector = new LocktimePoolCellCollector(fromInfo, cellProvider, {
                    config,
                    tipHeader,
                    queryOptions: {
                        type: xudtType,
                        data: "any",
                    },
                });
                cellCollectorInfos = cellCollectorInfos.push({
                    cellCollector: locktimePoolCellCollector,
                    index,
                });
            });
        }
        fromInfos.forEach((fromInfo, index) => {
            const secpCollector = new common_scripts_1.secp256k1Blake160.CellCollector(fromInfo, cellProvider, {
                config,
                queryOptions: {
                    type: xudtType,
                    data: "any",
                },
            });
            const multisigCollector = new common_scripts_1.secp256k1Blake160Multisig.CellCollector(fromInfo, cellProvider, {
                config,
                queryOptions: {
                    type: xudtType,
                    data: "any",
                },
            });
            const acpCollector = new common_scripts_1.anyoneCanPay.CellCollector(fromInfo, cellProvider, {
                config,
                queryOptions: {
                    type: xudtType,
                    data: "any",
                },
            });
            cellCollectorInfos = cellCollectorInfos.push({
                cellCollector: secpCollector,
                index,
            }, {
                cellCollector: multisigCollector,
                index,
            }, {
                cellCollector: acpCollector,
                index,
                isAnyoneCanPay: true,
                destroyable: (0, common_scripts_1.parseFromInfo)(fromInfo, { config }).destroyable,
            });
        });
        if (tipHeader) {
            fromInfos.forEach((fromInfo, index) => {
                const locktimeCellCollector = new LocktimePoolCellCollector(fromInfo, cellProvider, {
                    config,
                    tipHeader,
                });
                cellCollectorInfos = cellCollectorInfos.push({
                    cellCollector: locktimeCellCollector,
                    index,
                });
            });
        }
        fromInfos.forEach((fromInfo, index) => {
            const secpCollector = new common_scripts_1.secp256k1Blake160.CellCollector(fromInfo, cellProvider, {
                config,
            });
            const multisigCollector = new common_scripts_1.secp256k1Blake160Multisig.CellCollector(fromInfo, cellProvider, {
                config,
            });
            const acpCollector = new common_scripts_1.anyoneCanPay.CellCollector(fromInfo, cellProvider, {
                config,
            });
            cellCollectorInfos = cellCollectorInfos.push({
                cellCollector: secpCollector,
                index,
            }, {
                cellCollector: multisigCollector,
                index,
            }, {
                cellCollector: acpCollector,
                index,
                isAnyoneCanPay: true,
                destroyable: (0, common_scripts_1.parseFromInfo)(fromInfo, { config }).destroyable,
            });
        });
        for (const { index, cellCollector, isAnyoneCanPay, destroyable, } of cellCollectorInfos) {
            try {
                for (var _d = true, _e = (e_1 = void 0, __asyncValues(cellCollector.collect())), _f; _f = yield _e.next(), _a = _f.done, !_a;) {
                    _c = _f.value;
                    _d = false;
                    try {
                        const inputCell = _c;
                        // skip inputs already exists in txSkeleton.inputs
                        const key = `${inputCell.outPoint.txHash}_${inputCell.outPoint.index}`;
                        if (previousInputs.has(key)) {
                            continue;
                        }
                        previousInputs = previousInputs.add(key);
                        const fromInfo = fromInfos[index];
                        txSkeleton = yield common_scripts_1.common.setupInputCell(txSkeleton, inputCell, fromInfo, {
                            config,
                        });
                        // remove output which added by `setupInputCell`
                        const lastOutputIndex = txSkeleton.get("outputs").size - 1;
                        txSkeleton = txSkeleton.update("outputs", (outputs) => {
                            return outputs.remove(lastOutputIndex);
                        });
                        // remove output fixedEntry
                        const fixedEntryIndex = txSkeleton
                            .get("fixedEntries")
                            .findIndex((fixedEntry) => {
                            return (fixedEntry.field === "outputs" &&
                                fixedEntry.index === lastOutputIndex);
                        });
                        if (fixedEntryIndex >= 0) {
                            txSkeleton = txSkeleton.update("fixedEntries", (fixedEntries) => {
                                return fixedEntries.remove(fixedEntryIndex);
                            });
                        }
                        const inputCapacity = bi_1.BI.from(inputCell.cellOutput.capacity);
                        const inputAmount = inputCell.cellOutput.type
                            ? unpackAmount(inputCell.data)
                            : bi_1.BI.from(0);
                        let deductCapacity = isAnyoneCanPay && !destroyable
                            ? inputCapacity.sub((0, helpers_1.minimalCellCapacityCompatible)(inputCell))
                            : inputCapacity;
                        let deductAmount = inputAmount;
                        if (deductCapacity.gt(_capacity)) {
                            deductCapacity = bi_1.BI.from(_capacity);
                        }
                        _capacity = _capacity.sub(deductCapacity);
                        const currentChangeCapacity = inputCapacity.sub(deductCapacity);
                        if (!isAnyoneCanPay || (isAnyoneCanPay && destroyable)) {
                            changeCapacity = changeCapacity.add(currentChangeCapacity);
                        }
                        if (deductAmount.gt(_amount)) {
                            deductAmount = _amount;
                        }
                        _amount = _amount.sub(deductAmount);
                        const currentChangeAmount = inputAmount.sub(deductAmount);
                        if (!isAnyoneCanPay || (isAnyoneCanPay && destroyable)) {
                            changeAmount = changeAmount.add(currentChangeAmount);
                        }
                        if (isAnyoneCanPay && !destroyable) {
                            const acpChangeCell = {
                                cellOutput: {
                                    capacity: "0x" + currentChangeCapacity.toString(16),
                                    lock: inputCell.cellOutput.lock,
                                    type: inputCell.cellOutput.type,
                                },
                                data: inputCell.cellOutput.type
                                    ? codec_1.bytes.hexify(codec_1.number.Uint128LE.pack(currentChangeAmount))
                                    : "0x",
                            };
                            txSkeleton = txSkeleton.update("outputs", (outputs) => {
                                return outputs.push(acpChangeCell);
                            });
                            if (inputCell.cellOutput.type) {
                                txSkeleton = txSkeleton.update("fixedEntries", (fixedEntries) => {
                                    return fixedEntries.push({
                                        field: "outputs",
                                        index: txSkeleton.get("outputs").size - 1,
                                    });
                                });
                            }
                        }
                        // changeAmount = 0n, the change output no need to include xudt type script
                        if (_capacity.eq(0) &&
                            _amount.eq(0) &&
                            ((changeCapacity.eq(0) && changeAmount.eq(0)) ||
                                (changeCapacity.gt((0, helpers_1.minimalCellCapacityCompatible)(changeCellWithoutXudt)) &&
                                    changeAmount.eq(0)))) {
                            changeCell.cellOutput.type = undefined;
                            changeCell.data = "0x";
                            break;
                        }
                        if (_capacity.eq(0) &&
                            _amount.eq(0) &&
                            changeCapacity.gt((0, helpers_1.minimalCellCapacityCompatible)(changeCellWithoutXudt)) &&
                            changeAmount.gt(0)) {
                            break;
                        }
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
        }
        // if change cell is an anyone-can-pay cell and exists in txSkeleton.get("outputs") and not in fixedEntries
        // 1. change lock script is acp
        // 2. lock and type are equal to output OutputA in outputs
        // 3. OutputA is not fixed.
        let changeOutputIndex = -1;
        if ((0, helper_1.isAcpScript)(changeCell.cellOutput.lock, config) &&
            (changeOutputIndex = txSkeleton.get("outputs").findIndex((output) => {
                return (new ScriptValue(changeCell.cellOutput.lock, {
                    validate: false,
                }).equals(new ScriptValue(output.cellOutput.lock, { validate: false })) &&
                    ((changeAmount.eq(0) &&
                        !changeCell.cellOutput.type &&
                        !output.cellOutput.type) ||
                        (changeAmount.gte(0) &&
                            !!changeCell.cellOutput.type &&
                            !!output.cellOutput.type &&
                            new ScriptValue(changeCell.cellOutput.type, {
                                validate: false,
                            }).equals(new ScriptValue(output.cellOutput.type, { validate: false })))));
            })) !== -1 &&
            txSkeleton.get("fixedEntries").findIndex((fixedEntry) => {
                return (fixedEntry.field === "output" &&
                    fixedEntry.index === changeOutputIndex);
            }) === -1) {
            const originOutput = txSkeleton
                .get("outputs")
                .get(changeOutputIndex);
            const clonedOutput = JSON.parse(JSON.stringify(originOutput));
            clonedOutput.cellOutput.capacity = "0x" +
                bi_1.BI.from(originOutput.cellOutput.capacity)
                    .add(changeCapacity)
                    .toString(16);
            if (changeAmount.gt(0)) {
                clonedOutput.data = codec_1.bytes.hexify(codec_1.number.Uint128LE.pack(unpackAmount(originOutput.data).add(changeAmount)));
            }
            const minimalChangeCellCapcaity = bi_1.BI.from((0, helpers_1.minimalCellCapacityCompatible)(changeCell));
            const minimalChangeCellWithoutXudtCapacity = bi_1.BI.from((0, helpers_1.minimalCellCapacityCompatible)(changeCellWithoutXudt));
            let splitFlag = false;
            if (changeAmount.gt(0) &&
                splitChangeCell &&
                changeCapacity.gte(minimalChangeCellCapcaity.add(minimalChangeCellWithoutXudtCapacity))) {
                clonedOutput.cellOutput.capacity = originOutput.cellOutput.capacity;
                changeCellWithoutXudt.cellOutput.capacity = "0x" +
                    changeCapacity.toString(16);
                splitFlag = true;
            }
            txSkeleton = txSkeleton.update("outputs", (outputs) => {
                return outputs.set(changeOutputIndex, clonedOutput);
            });
            if (splitFlag) {
                txSkeleton = txSkeleton.update("outputs", (outputs) => {
                    return outputs.push(changeCellWithoutXudt);
                });
            }
        }
        else if (changeCapacity.gte((0, helpers_1.minimalCellCapacityCompatible)(changeCell))) {
            changeCell.cellOutput.capacity = "0x" + changeCapacity.toString(16);
            if (changeAmount.gt(0)) {
                changeCell.data = codec_1.bytes.hexify(codec_1.number.Uint128LE.pack(changeAmount));
            }
            const minimalChangeCellCapcaity = bi_1.BI.from((0, helpers_1.minimalCellCapacityCompatible)(changeCell));
            const minimalChangeCellWithoutXudtCapacity = bi_1.BI.from((0, helpers_1.minimalCellCapacityCompatible)(changeCellWithoutXudt));
            let splitFlag = false;
            if (changeAmount.gt(0) && splitChangeCell) {
                if (changeCapacity.gte(minimalChangeCellCapcaity.add(minimalChangeCellWithoutXudtCapacity))) {
                    changeCell.cellOutput.capacity = "0x" +
                        minimalChangeCellCapcaity.toString(16);
                    changeCellWithoutXudt.cellOutput.capacity = "0x" +
                        changeCapacity.sub(minimalChangeCellCapcaity).toString(16);
                    splitFlag = true;
                }
            }
            txSkeleton = txSkeleton.update("outputs", (outputs) => outputs.push(changeCell));
            if (changeAmount.gt(0)) {
                txSkeleton = txSkeleton.update("fixedEntries", (fixedEntries) => {
                    return fixedEntries.push({
                        field: "outputs",
                        index: txSkeleton.get("outputs").size - 1,
                    });
                });
            }
            if (splitFlag) {
                txSkeleton = txSkeleton.update("outputs", (outputs) => {
                    return outputs.push(changeCellWithoutXudt);
                });
            }
        }
        else if (changeAmount.gt(0) &&
            changeCapacity.lt((0, helpers_1.minimalCellCapacityCompatible)(changeCell))) {
            throw new Error("Not enough capacity for change in from infos!");
        }
        if (_capacity.gt(0)) {
            throw new Error("Not enough capacity in from infos!");
        }
        if (_amount.gt(0)) {
            throw new Error("Not enough amount in from infos!");
        }
        return txSkeleton;
    });
}
exports.transfer = transfer;
function _generateXudtScript(token, config) {
    const XUDT_SCRIPT = config.SCRIPTS.XUDT;
    // TODO: check token is a valid hash
    return {
        codeHash: XUDT_SCRIPT.CODE_HASH,
        hashType: XUDT_SCRIPT.HASH_TYPE,
        args: token,
    };
}
/**
 * Compute xudt token by owner from info.
 *
 * @param fromInfo
 * @param options
 */
function ownerForXudt(fromInfo, { config = undefined } = {}) {
    config = config || (0, config_manager_1.getConfig)();
    const { fromScript } = (0, common_scripts_1.parseFromInfo)(fromInfo, { config });
    const lockHash = computeScriptHash(fromScript);
    return lockHash;
}
exports.ownerForXudt = ownerForXudt;
function unpackAmount(data) {
    return codec_1.number.Uint128LE.unpack(codec_1.bytes.bytify(data).slice(0, 16));
}
exports.unpackAmount = unpackAmount;
function packAmount(amount) {
    return codec_1.bytes.hexify(codec_1.number.Uint128LE.pack(amount));
}
exports.packAmount = packAmount;
exports.default = {
    issueToken,
    transfer,
    ownerForXudt,
    packAmount,
    unpackAmount,
};
/**
 * Merge xUDT cells of the same type into a larger single xUDT cell.
 *
 * @param txSkeleton - The transaction skeleton to which the merged cell will be added.
 * @param fromInfo - Information about the source of the cells to be merged.
 * @param xudtToken - The token type of the xUDT cells to be merged.
 * @param changeAddress - The address to which the change capacity will be sent.
 * @param tipHeader - The tip header of the blockchain.
 * @param options - Additional options for the function.
 * @returns A promise that resolves to the updated transaction skeleton.
 */
function mergeXudtCells(txSkeleton, fromInfo, xudtToken, changeAddress, tipHeader, { config = undefined } = {}) {
    var _a, e_2, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        // Ensure the configuration is set or get the default configuration.
        config = config || (0, config_manager_1.getConfig)();
        // Retrieve the XUDT script configuration.
        const XUDT_SCRIPT = config.SCRIPTS.XUDT;
        // Check if the XUDT script configuration is available.
        if (!XUDT_SCRIPT) {
            throw new Error("Provided config does not have XUDT script setup!");
        }
        // Parse the fromInfo to get the fromScript.
        const fromScript = (0, common_scripts_1.parseFromInfo)(fromInfo, { config }).fromScript;
        // Parse the changeAddress to get the changeOutputLockScript.
        const changeOutputLockScript = (0, helpers_1.parseAddress)(changeAddress, { config });
        // Generate the xudtType script using the provided xudtToken and configuration.
        const xudtType = _generateXudtScript(xudtToken, config);
        // Retrieve the cell provider from the transaction skeleton.
        const cellProvider = txSkeleton.get("cellProvider");
        if (!cellProvider) {
            throw new Error("Cell provider is missing!");
        }
        // Create a cell collector to collect xUDT cells of the specified type.
        const cellCollector = new common_scripts_1.secp256k1Blake160.CellCollector(fromInfo, cellProvider, {
            config,
            queryOptions: {
                type: xudtType,
                data: "any",
            },
        });
        // Initialize total amount and total capacity for the collected cells.
        let totalAmount = bi_1.BI.from(0);
        let totalCapacity = bi_1.BI.from(0);
        const inputCells = [];
        try {
            // Collect all xUDT cells and calculate the total amount and capacity.
            for (var _d = true, _e = __asyncValues(cellCollector.collect()), _f; _f = yield _e.next(), _a = _f.done, !_a;) {
                _c = _f.value;
                _d = false;
                try {
                    const inputCell = _c;
                    inputCells.push(inputCell);
                    totalAmount = totalAmount.add(unpackAmount(inputCell.data));
                    totalCapacity = totalCapacity.add(bi_1.BI.from(inputCell.cellOutput.capacity));
                }
                finally {
                    _d = true;
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
            }
            finally { if (e_2) throw e_2.error; }
        }
        // Check if any xUDT cells were found.
        if (inputCells.length === 0) {
            throw new Error("No xUDT cells found to merge!");
        }
        // Add the collected input cells to the transaction skeleton.
        txSkeleton = txSkeleton.update("inputs", (inputs) => {
            return inputs.concat(inputCells);
        });
        // Create the merged output cell with the total amount and type.
        const mergedOutput = {
            cellOutput: {
                capacity: "0x0",
                lock: fromScript,
                type: xudtType,
            },
            data: codec_1.bytes.hexify(codec_1.number.Uint128LE.pack(totalAmount)),
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
        txSkeleton = (0, helper_1.addCellDep)(txSkeleton, {
            outPoint: {
                txHash: XUDT_SCRIPT.TX_HASH,
                index: XUDT_SCRIPT.INDEX,
            },
            depType: XUDT_SCRIPT.DEP_TYPE,
        });
        txSkeleton = yield common_scripts_1.common.injectCapacity(txSkeleton, [fromInfo], totalCapacity, undefined, tipHeader, {
            config,
        });
        return txSkeleton;
    });
}
exports.mergeXudtCells = mergeXudtCells;
/**
 * Burn xUDT cell and convert it to a regular CKB cell.
 *
 * @param txSkeleton - The transaction skeleton to which the burned cell will be added.
 * @param fromInfo - Information about the source of the cell to be burned.
 * @param xudtToken - The token type of the xUDT cell to be burned.
 * @param amount - The amount of xUDT to be burned.
 * @param changeAddress - The address to which the change capacity will be sent.
 * @param tipHeader - The tip header of the blockchain.
 * @param options - Additional options for the function.
 * @returns A promise that resolves to the updated transaction skeleton.
 */
function burnXudt(txSkeleton, fromInfo, xudtToken, amount, changeAddress, tipHeader, { config = undefined } = {}) {
    var _a, e_3, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        // Ensure the configuration is set or get the default configuration.
        config = config || (0, config_manager_1.getConfig)();
        // Retrieve the XUDT script configuration.
        const XUDT_SCRIPT = config.SCRIPTS.XUDT;
        // Check if the XUDT script configuration is available.
        if (!XUDT_SCRIPT) {
            throw new Error("Provided config does not have XUDT script setup!");
        }
        // Parse the fromInfo to get the fromScript.
        const fromScript = (0, common_scripts_1.parseFromInfo)(fromInfo, { config }).fromScript;
        // Parse the changeAddress to get the changeOutputLockScript.
        const changeOutputLockScript = (0, helpers_1.parseAddress)(changeAddress, { config });
        // Generate the xudtType script using the provided xudtToken and configuration.
        const xudtType = _generateXudtScript(xudtToken, config);
        // Retrieve the cell provider from the transaction skeleton.
        const cellProvider = txSkeleton.get("cellProvider");
        if (!cellProvider) {
            throw new Error("Cell provider is missing!");
        }
        // Create a cell collector to collect xUDT cells of the specified type.
        const cellCollector = new common_scripts_1.secp256k1Blake160.CellCollector(fromInfo, cellProvider, {
            config,
            queryOptions: {
                type: xudtType,
                data: "any",
            },
        });
        // Initialize total amount and total capacity for the collected cells.
        let totalAmount = bi_1.BI.from(0);
        let totalCapacity = bi_1.BI.from(0);
        const inputCells = [];
        try {
            // Collect all xUDT cells and calculate the total amount and capacity.
            for (var _d = true, _e = __asyncValues(cellCollector.collect()), _f; _f = yield _e.next(), _a = _f.done, !_a;) {
                _c = _f.value;
                _d = false;
                try {
                    const inputCell = _c;
                    inputCells.push(inputCell);
                    totalAmount = totalAmount.add(unpackAmount(inputCell.data));
                    totalCapacity = totalCapacity.add(bi_1.BI.from(inputCell.cellOutput.capacity));
                }
                finally {
                    _d = true;
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
            }
            finally { if (e_3) throw e_3.error; }
        }
        // Check if any xUDT cells were found.
        if (inputCells.length === 0) {
            throw new Error("No xUDT cells found to burn!");
        }
        // Check if the total amount of xUDT is sufficient to burn the requested amount.
        if (totalAmount.lt(bi_1.BI.from(amount))) {
            throw new Error("Insufficient xUDT balance to burn the requested amount!");
        }
        // Add the collected input cells to the transaction skeleton.
        txSkeleton = txSkeleton.update("inputs", (inputs) => {
            return inputs.concat(inputCells);
        });
        // Create the burned output cell without the xUDT type.
        const burnedOutput = {
            cellOutput: {
                capacity: "0x0",
                lock: fromScript,
                type: undefined,
            },
            data: "0x",
            outPoint: undefined,
            blockHash: undefined,
        };
        // Calculate the minimal capacity required for the burned output cell.
        const burnedCapacity = (0, helpers_1.minimalCellCapacityCompatible)(burnedOutput);
        burnedOutput.cellOutput.capacity = "0x" + burnedCapacity.toString(16);
        // Add the burned output cell to the transaction skeleton.
        txSkeleton = txSkeleton.update("outputs", (outputs) => {
            return outputs.push(burnedOutput);
        });
        // Calculate the change capacity.
        const changeCapacity = totalCapacity.sub(burnedCapacity);
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
        txSkeleton = (0, helper_1.addCellDep)(txSkeleton, {
            outPoint: {
                txHash: XUDT_SCRIPT.TX_HASH,
                index: XUDT_SCRIPT.INDEX,
            },
            depType: XUDT_SCRIPT.DEP_TYPE,
        });
        txSkeleton = yield common_scripts_1.common.injectCapacity(txSkeleton, [fromInfo], totalCapacity, undefined, tipHeader, {
            config,
        });
        return txSkeleton;
    });
}
exports.burnXudt = burnXudt;
