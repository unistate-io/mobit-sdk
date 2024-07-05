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
exports.createIssueXudtTransaction = createIssueXudtTransaction;
const ckb_sdk_utils_1 = require("@nervosnetwork/ckb-sdk-utils");
const ckb_1 = require("@rgbpp-sdk/ckb");
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
        let emptyCells = yield collector.getCells({
            lock: issueLock,
        });
        if (!emptyCells || emptyCells.length === 0) {
            throw new ckb_1.NoLiveCellError('The address has no empty cells');
        }
        emptyCells = emptyCells.filter((cell) => !cell.output.type);
        const xudtCapacity = (0, ckb_1.calculateUdtCellCapacity)(issueLock);
        const xudtInfoCapacity = (0, ckb_1.calculateXudtTokenInfoCellCapacity)(tokenInfo, issueLock);
        const txFee = ckb_1.MAX_FEE;
        const { inputs, sumInputsCapacity } = collector.collectInputs(emptyCells, xudtCapacity + xudtInfoCapacity, txFee, {
            minCapacity: ckb_1.MIN_CAPACITY,
        });
        const xudtType = Object.assign(Object.assign({}, (0, ckb_1.getXudtTypeScript)(isMainnet)), { args: (0, ckb_1.append0x)((0, ckb_sdk_utils_1.scriptToHash)(issueLock)) });
        console.log('xUDT type script', xudtType);
        let changeCapacity = sumInputsCapacity - xudtCapacity - xudtInfoCapacity;
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
        const totalAmount = xudtTotalAmount * BigInt(Math.pow(10, tokenInfo.decimal));
        const outputsData = [(0, ckb_1.append0x)((0, ckb_1.u128ToLe)(totalAmount)), (0, ckb_1.encodeRgbppTokenInfo)(tokenInfo), '0x'];
        const emptyWitness = { lock: '', inputType: '', outputType: '' };
        const witnesses = inputs.map((_, index) => (index === 0 ? emptyWitness : '0x'));
        const cellDeps = [
            (0, ckb_1.getSecp256k1CellDep)(isMainnet),
            ...(yield (0, ckb_1.fetchTypeIdCellDeps)(isMainnet, { xudt: true, unique: true })),
        ];
        const unsignedTx = {
            version: '0x0',
            cellDeps,
            headerDeps: [],
            inputs,
            outputs,
            outputsData,
            witnesses,
        };
        if (txFee === ckb_1.MAX_FEE) {
            const txSize = (0, ckb_sdk_utils_1.getTransactionSize)(unsignedTx) + ckb_1.SECP256K1_WITNESS_LOCK_SIZE;
            const estimatedTxFee = (0, ckb_1.calculateTransactionFee)(txSize);
            changeCapacity -= estimatedTxFee;
            unsignedTx.outputs[unsignedTx.outputs.length - 1].capacity = (0, ckb_1.append0x)(changeCapacity.toString(16));
        }
        console.info('Unsigned transaction created:', unsignedTx);
        return unsignedTx;
    });
}
// Example usage:
const XUDT_TOKEN_INFO = {
    decimal: 8,
    name: 'XUDT Test Token',
    symbol: 'XTT',
};
(() => __awaiter(void 0, void 0, void 0, function* () {
    const ckbAddress = 'ckb1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsq2v6qwegvppjgpyu80mwk9pat67y8tmv4qnttsj8';
    const collector = new ckb_1.Collector({
        ckbNodeUrl: 'https://mainnet.ckbapp.dev',
        ckbIndexerUrl: 'https://mainnet.ckbapp.dev/indexer',
    });
    const isMainnet = true; // or false depending on the network
    const unsignedTx = yield createIssueXudtTransaction(BigInt(21000000), XUDT_TOKEN_INFO, ckbAddress, collector, isMainnet);
    console.log('Unsigned Transaction:', unsignedTx);
}))();
