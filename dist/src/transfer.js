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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransferXudtTransaction = void 0;
const ckb_sdk_utils_1 = require("@nervosnetwork/ckb-sdk-utils");
const ckb_1 = require("@rgbpp-sdk/ckb");
const issue_1 = require("./issue");
/**
 * transferXudt can be used to mint xUDT assets or transfer xUDT assets.
 * @param xudtType The xUDT type script that comes from 1-issue-xudt
 * @param receivers The receiver includes toAddress and transferAmount
 * @param ckbAddress The CKB address for the transaction
 * @param collector The collector instance used to fetch cells and collect inputs
 * @param isMainnet A boolean indicating whether the network is mainnet or testnet
 * @returns An unsigned transaction object
 */
function createTransferXudtTransaction(xudtType, receivers, ckbAddress, collector, isMainnet) {
    return __awaiter(this, void 0, void 0, function* () {
        const fromLock = (0, ckb_sdk_utils_1.addressToScript)(ckbAddress);
        const xudtCells = yield collector.getCells({
            lock: fromLock,
            type: xudtType,
        });
        console.debug("Fetched empty cells:", xudtCells);
        if (!xudtCells || xudtCells.length === 0) {
            throw new ckb_1.NoXudtLiveCellError("The address has no xudt cells");
        }
        const sumTransferAmount = receivers
            .map((receiver) => receiver.transferAmount)
            .reduce((prev, current) => prev + current, BigInt(0));
        console.debug("Sum Transfer Amount:", sumTransferAmount);
        let sumXudtOutputCapacity = receivers
            .map(({ toAddress }) => (0, ckb_1.calculateUdtCellCapacity)((0, ckb_sdk_utils_1.addressToScript)(toAddress)))
            .reduce((prev, current) => prev + current, BigInt(0));
        console.debug("Sum XUDT Output Capacity:", sumXudtOutputCapacity);
        const { inputs: udtInputs, sumInputsCapacity: sumXudtInputsCapacity, sumAmount, } = collector.collectUdtInputs({
            liveCells: xudtCells,
            needAmount: sumTransferAmount,
        });
        console.debug("Sum XUDT Inputs Capacity:", sumXudtInputsCapacity);
        console.debug("Sum Amount:", sumAmount);
        let actualInputsCapacity = sumXudtInputsCapacity;
        let inputs = udtInputs;
        const outputs = receivers.map(({ toAddress }) => ({
            lock: (0, ckb_sdk_utils_1.addressToScript)(toAddress),
            type: xudtType,
            capacity: (0, ckb_1.append0x)((0, ckb_1.calculateUdtCellCapacity)((0, ckb_sdk_utils_1.addressToScript)(toAddress)).toString(16)),
        }));
        const outputsData = receivers.map(({ transferAmount }) => (0, ckb_1.append0x)((0, ckb_1.u128ToLe)(transferAmount)));
        console.debug("Outputs:", outputs);
        console.debug("Outputs Data:", outputsData);
        if (sumAmount > sumTransferAmount) {
            const xudtChangeCapacity = (0, ckb_1.calculateUdtCellCapacity)(fromLock);
            outputs.push({
                lock: fromLock,
                type: xudtType,
                capacity: (0, ckb_1.append0x)(xudtChangeCapacity.toString(16)),
            });
            outputsData.push((0, ckb_1.append0x)((0, ckb_1.u128ToLe)(sumAmount - sumTransferAmount)));
            sumXudtOutputCapacity += xudtChangeCapacity;
            console.debug("XUDT Change Capacity:", xudtChangeCapacity);
            console.debug("Updated Outputs:", outputs);
            console.debug("Updated Outputs Data:", outputsData);
        }
        const txFee = ckb_1.MAX_FEE;
        if (sumXudtInputsCapacity <= sumXudtOutputCapacity) {
            let emptyCells = yield collector.getCells({
                lock: fromLock,
            });
            console.debug("Fetched Empty Cells:", emptyCells);
            if (!emptyCells || emptyCells.length === 0) {
                throw new ckb_1.NoLiveCellError("The address has no empty cells");
            }
            emptyCells = emptyCells.filter((cell) => !cell.output.type);
            const needCapacity = sumXudtOutputCapacity - sumXudtInputsCapacity;
            const { inputs: emptyInputs, sumInputsCapacity: sumEmptyCapacity } = collector.collectInputs(emptyCells, needCapacity, txFee, { minCapacity: ckb_1.MIN_CAPACITY });
            inputs = [...inputs, ...emptyInputs];
            actualInputsCapacity += sumEmptyCapacity;
            console.debug("Need Capacity:", needCapacity);
            console.debug("Empty Inputs:", emptyInputs);
            console.debug("Sum Empty Capacity:", sumEmptyCapacity);
        }
        let changeCapacity = actualInputsCapacity - sumXudtOutputCapacity;
        outputs.push({
            lock: fromLock,
            capacity: (0, ckb_1.append0x)(changeCapacity.toString(16)),
        });
        outputsData.push("0x");
        console.debug("Change Capacity:", changeCapacity);
        console.debug("Updated Outputs:", outputs);
        console.debug("Updated Outputs Data:", outputsData);
        const emptyWitness = { lock: "", inputType: "", outputType: "" };
        const witnesses = inputs.map((_, index) => (index === 0 ? emptyWitness : "0x"));
        console.debug("Witnesses:", witnesses);
        const cellDeps = [
            (0, ckb_1.getSecp256k1CellDep)(isMainnet),
            ...(yield (0, ckb_1.fetchTypeIdCellDeps)(isMainnet, { xudt: true })),
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
        if (txFee === ckb_1.MAX_FEE) {
            const txSize = (0, ckb_sdk_utils_1.getTransactionSize)(unsignedTx) + ckb_1.SECP256K1_WITNESS_LOCK_SIZE;
            const estimatedTxFee = (0, ckb_1.calculateTransactionFee)(txSize);
            changeCapacity -= estimatedTxFee;
            unsignedTx.outputs[unsignedTx.outputs.length - 1].capacity = (0, ckb_1.append0x)(changeCapacity.toString(16));
            console.debug("Transaction Size:", txSize);
            console.debug("Estimated Transaction Fee:", estimatedTxFee);
            console.debug("Updated Change Capacity:", changeCapacity);
            console.debug("Updated Unsigned Transaction:", unsignedTx);
        }
        return unsignedTx;
    });
}
exports.createTransferXudtTransaction = createTransferXudtTransaction;
(() => __awaiter(void 0, void 0, void 0, function* () {
    const CKB_PRIVATE_KEY = "0x2d8e14b2ec747af0f840183317482e2046b799f2e02e6f39588b873d12e3c9e1";
    const secp256k1Lock = Object.assign(Object.assign({}, ckb_sdk_utils_1.systemScripts.SECP256K1_BLAKE160), { args: (0, ckb_sdk_utils_1.bytesToHex)((0, ckb_sdk_utils_1.blake160)((0, ckb_sdk_utils_1.privateKeyToPublicKey)(CKB_PRIVATE_KEY))) });
    const isMainnet = false; // or false depending on the network
    const ckbAddress = (0, ckb_sdk_utils_1.scriptToAddress)(secp256k1Lock, isMainnet);
    console.info("CKB Address:", ckbAddress);
    // const collector = new Collector({
    //     ckbNodeUrl: 'https://mainnet.ckbapp.dev',
    //     ckbIndexerUrl: 'https://mainnet.ckbapp.dev/indexer',
    // });
    const collector = new ckb_1.Collector({
        ckbNodeUrl: "https://testnet.ckbapp.dev",
        ckbIndexerUrl: "https://testnet.ckb.dev",
    });
    const xudtType = {
        codeHash: '0x25c29dc317811a6f6f3985a7a9ebc4838bd388d19d0feeecf0bcd60f6c0975bb',
        hashType: 'type',
        args: '0x6b33c69bdb25fac3d73e3c9e55f88785de27a54d722b4ab3455212f9a1b1645c',
    };
    const unsignedTx = yield createTransferXudtTransaction(xudtType, [
        {
            toAddress: 'ckt1qrfrwcdnvssswdwpn3s9v8fp87emat306ctjwsm3nmlkjg8qyza2cqgqq92pncevj8c3nwz7f3mlx2fwqn6l44y73yr5swl5',
            transferAmount: BigInt(1000) * BigInt(Math.pow(10, issue_1.XUDT_TOKEN_INFO.decimal)),
        },
        {
            toAddress: 'ckt1qyqpyw8j7tlu3v44am8d54066zrzk4vz5lvqat8fpf',
            transferAmount: BigInt(2000) * BigInt(Math.pow(10, issue_1.XUDT_TOKEN_INFO.decimal)),
        },
    ], ckbAddress, collector, isMainnet);
    console.log("Unsigned Transaction:", unsignedTx);
}))();
