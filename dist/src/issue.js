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
exports.XUDT_TOKEN_INFO = exports.createIssueXudtTransaction = void 0;
const ckb_sdk_utils_1 = require("@nervosnetwork/ckb-sdk-utils");
const ckb_1 = require("@rgbpp-sdk/ckb");
const convert_ts_1 = require("./convert.ts");
/**
 * Creates an unsigned transaction for issuing xUDT assets with a unique cell as the token info cell.
 * @param xudtTotalAmount The total amount of xUDT asset to be issued
 * @param tokenInfo The xUDT token information including decimal, name, and symbol
 * @param ckbAddress The CKB address for the transaction
 * @param collector The collector instance used to fetch cells and collect inputs
 * @param isMainnet A boolean indicating whether the network is mainnet or testnet
 * @returns An unsigned transaction object
 */
function createIssueXudtTransaction(xudtTotalAmount, tokenInfo, ckbAddress, collector, // Adjust the type according to your actual collector type
isMainnet) {
    return __awaiter(this, void 0, void 0, function* () {
        const issueLock = (0, ckb_sdk_utils_1.addressToScript)(ckbAddress);
        // Fetching empty cells and adding debug information
        let emptyCells = yield collector.getCells({
            lock: issueLock,
        });
        console.debug("Fetched empty cells:", emptyCells);
        if (!emptyCells || emptyCells.length === 0) {
            throw new ckb_1.NoLiveCellError("The address has no empty cells");
        }
        // Filtering cells without a type and adding debug information
        emptyCells = emptyCells.filter((cell) => !cell.output.type);
        console.debug("Filtered empty cells without a type:", emptyCells);
        // Calculate the capacity required for the xUDT cell and add debug information
        const xudtCapacity = (0, ckb_1.calculateUdtCellCapacity)(issueLock);
        console.debug("Calculated xUDT cell capacity:", xudtCapacity);
        // Calculate the capacity required for the xUDT token info cell and add debug information
        const xudtInfoCapacity = (0, ckb_1.calculateXudtTokenInfoCellCapacity)(tokenInfo, issueLock);
        console.debug("Calculated xUDT token info cell capacity:", xudtInfoCapacity);
        // Set the transaction fee to the maximum fee and add debug information
        const txFee = ckb_1.MAX_FEE;
        console.debug("Set transaction fee to maximum fee:", txFee);
        // Collect inputs for the transaction and add debug information
        const { inputs, sumInputsCapacity } = collector.collectInputs(emptyCells, xudtCapacity + xudtInfoCapacity, txFee, {
            minCapacity: ckb_1.MIN_CAPACITY,
        });
        console.debug("Collected inputs:", inputs);
        console.debug("Sum of inputs capacity:", sumInputsCapacity);
        // Define the xUDT type script and add debug information
        const xudtType = Object.assign(Object.assign({}, (0, ckb_1.getXudtTypeScript)(isMainnet)), { args: (0, ckb_1.append0x)((0, ckb_sdk_utils_1.scriptToHash)(issueLock)) });
        console.debug("Defined xUDT type script:", xudtType);
        console.log("xUDT type script", xudtType);
        // Calculate the change capacity and add debug information
        let changeCapacity = sumInputsCapacity - xudtCapacity - xudtInfoCapacity;
        console.debug("Calculated change capacity:", changeCapacity);
        // Define the outputs and add debug information
        const outputs = [
            {
                lock: issueLock,
                type: xudtType,
                capacity: (0, ckb_1.append0x)(xudtCapacity.toString(16)),
            },
            {
                lock: issueLock,
                type: Object.assign(Object.assign({}, (0, ckb_1.getUniqueTypeScript)(isMainnet)), { args: (0, ckb_1.generateUniqueTypeArgs)(inputs[0], 1) }),
                capacity: (0, ckb_1.append0x)(xudtInfoCapacity.toString(16)),
            },
            {
                lock: issueLock,
                capacity: (0, ckb_1.append0x)(changeCapacity.toString(16)),
            },
        ];
        console.debug("Defined outputs:", outputs);
        // Calculate the total amount and add debug information
        const totalAmount = xudtTotalAmount * BigInt(Math.pow(10, tokenInfo.decimal));
        console.debug("Calculated total amount:", totalAmount);
        // Define the outputs data and add debug information
        const outputsData = [
            (0, ckb_1.append0x)((0, ckb_1.u128ToLe)(totalAmount)),
            (0, ckb_1.encodeRgbppTokenInfo)(tokenInfo),
            "0x",
        ];
        console.debug("Defined outputs data:", outputsData);
        // Define the empty witness and add debug information
        const emptyWitness = { lock: "", inputType: "", outputType: "" };
        console.debug("Defined empty witness:", emptyWitness);
        // Define the witnesses and add debug information
        const witnesses = inputs.map((_, index) => (index === 0 ? emptyWitness : "0x"));
        console.debug("Defined witnesses:", witnesses);
        // Define the cell dependencies and add debug information
        const cellDeps = [
            (0, ckb_1.getSecp256k1CellDep)(isMainnet),
            ...(yield (0, ckb_1.fetchTypeIdCellDeps)(isMainnet, { xudt: true, unique: true })),
        ];
        console.debug("Defined cell dependencies:", cellDeps);
        // Define the unsigned transaction and add debug information
        const unsignedTx = {
            version: "0x0",
            cellDeps,
            headerDeps: [],
            inputs,
            outputs,
            outputsData,
            witnesses,
        };
        console.debug("Defined unsigned transaction:", unsignedTx);
        // Adjust the transaction fee if necessary and add debug information
        if (txFee === ckb_1.MAX_FEE) {
            const txSize = (0, ckb_sdk_utils_1.getTransactionSize)(unsignedTx) + ckb_1.SECP256K1_WITNESS_LOCK_SIZE;
            const estimatedTxFee = (0, ckb_1.calculateTransactionFee)(txSize);
            changeCapacity -= estimatedTxFee;
            unsignedTx.outputs[unsignedTx.outputs.length - 1].capacity = (0, ckb_1.append0x)(changeCapacity.toString(16));
            console.debug("Adjusted transaction fee:", estimatedTxFee);
            console.debug("Updated change capacity:", changeCapacity);
        }
        console.info("Unsigned transaction created:", unsignedTx);
        return unsignedTx;
    });
}
exports.createIssueXudtTransaction = createIssueXudtTransaction;
// Example usage:
exports.XUDT_TOKEN_INFO = {
    decimal: 8,
    name: "XUDT Test Token",
    symbol: "XTT",
};
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
    const unsignedTx = yield createIssueXudtTransaction(BigInt(21000000), exports.XUDT_TOKEN_INFO, ckbAddress, collector, isMainnet);
    console.log("Unsigned Transaction:", unsignedTx);
    const txSkeleton = yield (0, convert_ts_1.convertToTxSkeleton)(unsignedTx, collector);
    console.log("Transaction Skeleton:", txSkeleton);
}))();
