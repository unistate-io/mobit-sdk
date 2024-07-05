"use strict";
/* eslint-disable @typescript-eslint/no-non-null-assertion, @typescript-eslint/explicit-module-boundary-types */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SECP_SIGNATURE_PLACEHOLDER = exports.ensureScript = exports.prepareSigningEntries = exports.hashWitness = exports.isAcpAddress = exports.isAcpScript = exports.isXudtScript = exports.isSudtScript = exports.isDaoScript = exports.isSecp256k1Blake160MultisigAddress = exports.isSecp256k1Blake160MultisigScript = exports.isOmnilockAddress = exports.isOmnilockScript = exports.isSecp256k1Blake160Address = exports.isSecp256k1Blake160Script = exports.generateDaoScript = exports.addCellDep = void 0;
const immutable_1 = require("immutable");
const helpers_1 = require("@ckb-lumos/helpers");
const codec_1 = require("@ckb-lumos/codec");
const base_1 = require("@ckb-lumos/base");
const { CKBHasher, ckbHash } = base_1.utils;
const number_1 = require("@ckb-lumos/codec/lib/number");
function addCellDep(txSkeleton, newCellDep) {
    const cellDep = txSkeleton.get("cellDeps").find((cellDep) => {
        return (cellDep.depType === newCellDep.depType &&
            new base_1.values.OutPointValue(cellDep.outPoint, { validate: false }).equals(new base_1.values.OutPointValue(newCellDep.outPoint, { validate: false })));
    });
    if (!cellDep) {
        txSkeleton = txSkeleton.update("cellDeps", (cellDeps) => {
            return cellDeps.push({
                outPoint: newCellDep.outPoint,
                depType: newCellDep.depType,
            });
        });
    }
    return txSkeleton;
}
exports.addCellDep = addCellDep;
function generateDaoScript(config) {
    const template = config.SCRIPTS.DAO;
    return {
        codeHash: template.CODE_HASH,
        hashType: template.HASH_TYPE,
        args: "0x",
    };
}
exports.generateDaoScript = generateDaoScript;
function isSecp256k1Blake160Script(script, config) {
    const template = config.SCRIPTS.SECP256K1_BLAKE160;
    return (script.codeHash === template.CODE_HASH &&
        script.hashType === template.HASH_TYPE);
}
exports.isSecp256k1Blake160Script = isSecp256k1Blake160Script;
function isSecp256k1Blake160Address(address, config) {
    const script = (0, helpers_1.parseAddress)(address, { config });
    return isSecp256k1Blake160Script(script, config);
}
exports.isSecp256k1Blake160Address = isSecp256k1Blake160Address;
function isOmnilockScript(script, config) {
    const template = config.SCRIPTS.OMNILOCK;
    return (script.codeHash === template.CODE_HASH &&
        script.hashType === template.HASH_TYPE);
}
exports.isOmnilockScript = isOmnilockScript;
function isOmnilockAddress(address, config) {
    const script = (0, helpers_1.parseAddress)(address, { config });
    return isOmnilockScript(script, config);
}
exports.isOmnilockAddress = isOmnilockAddress;
function isSecp256k1Blake160MultisigScript(script, config) {
    const template = config.SCRIPTS.SECP256K1_BLAKE160_MULTISIG;
    return (script.codeHash === template.CODE_HASH &&
        script.hashType === template.HASH_TYPE);
}
exports.isSecp256k1Blake160MultisigScript = isSecp256k1Blake160MultisigScript;
function isSecp256k1Blake160MultisigAddress(address, config) {
    const script = (0, helpers_1.parseAddress)(address, { config });
    return isSecp256k1Blake160MultisigScript(script, config);
}
exports.isSecp256k1Blake160MultisigAddress = isSecp256k1Blake160MultisigAddress;
function isDaoScript(script, config) {
    const template = config.SCRIPTS.DAO;
    return (!!script &&
        script.codeHash === template.CODE_HASH &&
        script.hashType === template.HASH_TYPE);
}
exports.isDaoScript = isDaoScript;
function isSudtScript(script, config) {
    const template = config.SCRIPTS.SUDT;
    if (!template) {
        throw new Error(`SUDT script not defined in config!`);
    }
    return (!!script &&
        script.codeHash === template.CODE_HASH &&
        script.hashType === template.HASH_TYPE);
}
exports.isSudtScript = isSudtScript;
function isXudtScript(script, config) {
    const template = config.SCRIPTS.XUDT;
    if (!template) {
        throw new Error(`SUDT script not defined in config!`);
    }
    return (!!script &&
        script.codeHash === template.CODE_HASH &&
        script.hashType === template.HASH_TYPE);
}
exports.isXudtScript = isXudtScript;
function isAcpScript(script, config) {
    const template = config.SCRIPTS.ANYONE_CAN_PAY;
    if (!template) {
        throw new Error(`ANYONE_CAN_PAY script not defined in config!`);
    }
    return (!!script &&
        script.codeHash === template.CODE_HASH &&
        script.hashType === template.HASH_TYPE);
}
exports.isAcpScript = isAcpScript;
function isAcpAddress(address, config) {
    const script = (0, helpers_1.parseAddress)(address, { config });
    return isAcpScript(script, config);
}
exports.isAcpAddress = isAcpAddress;
/**
 * Hash a witness in a hasher
 * @param hasher The hasher object which should have a `update` method.
 * @param witness witness data, the inputs to hasher will derived from it
 */
function hashWitness(hasher, witness) {
    // https://github.com/nervosnetwork/ckb-system-scripts/blob/a7b7c75662ed950c9bd024e15f83ce702a54996e/c/secp256k1_blake160_sighash_all.c#L81
    const len = codec_1.bytes.hexify(number_1.Uint64.pack(codec_1.bytes.bytify(witness).length));
    // https://github.com/nervosnetwork/ckb-system-scripts/blob/a7b7c75662ed950c9bd024e15f83ce702a54996e/c/secp256k1_blake160_sighash_all.c#L214-L215
    hasher.update(len);
    hasher.update(witness);
}
exports.hashWitness = hashWitness;
/* eslint-enable camelcase, @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types */
function prepareSigningEntries(txSkeleton, config, scriptType) {
    const template = config.SCRIPTS[scriptType];
    if (!template) {
        throw new Error(`Provided config does not have ${scriptType} script setup!`);
    }
    let processedArgs = (0, immutable_1.Set)();
    const tx = (0, helpers_1.createTransactionFromSkeleton)(txSkeleton);
    const txHash = ckbHash(base_1.blockchain.RawTransaction.pack(tx));
    const inputs = txSkeleton.get("inputs");
    const witnesses = txSkeleton.get("witnesses");
    let signingEntries = txSkeleton.get("signingEntries");
    for (let i = 0; i < inputs.size; i++) {
        const input = inputs.get(i);
        if (template.CODE_HASH === input.cellOutput.lock.codeHash &&
            template.HASH_TYPE === input.cellOutput.lock.hashType &&
            !processedArgs.has(input.cellOutput.lock.args)) {
            processedArgs = processedArgs.add(input.cellOutput.lock.args);
            const lockValue = new base_1.values.ScriptValue(input.cellOutput.lock, {
                validate: false,
            });
            const hasher = new CKBHasher();
            hasher.update(txHash);
            if (i >= witnesses.size) {
                throw new Error(`The first witness in the script group starting at input index ${i} does not exist, maybe some other part has invalidly tampered the transaction?`);
            }
            hashWitness(hasher, witnesses.get(i));
            for (let j = i + 1; j < inputs.size && j < witnesses.size; j++) {
                const otherInput = inputs.get(j);
                if (lockValue.equals(new base_1.values.ScriptValue(otherInput.cellOutput.lock, {
                    validate: false,
                }))) {
                    hashWitness(hasher, witnesses.get(j));
                }
            }
            for (let j = inputs.size; j < witnesses.size; j++) {
                hashWitness(hasher, witnesses.get(j));
            }
            const signingEntry = {
                type: "witness_args_lock",
                index: i,
                message: hasher.digestHex(),
            };
            signingEntries = signingEntries.push(signingEntry);
        }
    }
    txSkeleton = txSkeleton.set("signingEntries", signingEntries);
    return txSkeleton;
}
exports.prepareSigningEntries = prepareSigningEntries;
function ensureScript(script, config, scriptType) {
    const template = config.SCRIPTS[scriptType];
    if (!template) {
        throw new Error(`Provided config does not have ${scriptType} script setup!`);
    }
    if (template.CODE_HASH !== script.codeHash ||
        template.HASH_TYPE !== script.hashType) {
        throw new Error(`Provided script is not ${scriptType} script!`);
    }
}
exports.ensureScript = ensureScript;
/* 65-byte zeros in hex */
exports.SECP_SIGNATURE_PLACEHOLDER = "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
exports.default = {
    addCellDep,
    generateDaoScript,
    isSecp256k1Blake160Script,
    isSecp256k1Blake160MultisigScript,
    isDaoScript,
    isSudtScript,
    prepareSigningEntries,
    isSecp256k1Blake160Address,
    isSecp256k1Blake160MultisigAddress,
    ensureScript,
    isAcpScript,
    isAcpAddress,
};
