import { addressToScript, bytesToHex, getTransactionSize } from "@nervosnetwork/ckb-sdk-utils";
import { append0x, calculateRgbppClusterCellCapacity, calculateTransactionFee, Collector, fetchTypeIdCellDeps, generateClusterCreateCoBuild, generateClusterId, getClusterTypeDep, getClusterTypeScript, getSecp256k1CellDep, Hex, MAX_FEE, NoLiveCellError, RawClusterData, SECP256K1_WITNESS_LOCK_SIZE } from "@rgbpp-sdk/ckb";
import { packRawClusterData } from "@spore-sdk/core";


interface ClusterCreateTransactionParams {
    ckbAddress: string;
    // The collector that collects CKB live cells and transactions
    collector: Collector;
    // True is for BTC and CKB Mainnet, false is for BTC and CKB Testnet
    isMainnet: boolean;
    // The cluster's data, including name and description.
    clusterData: RawClusterData;
}

export async function createClusterTransaction({
    ckbAddress, collector, isMainnet, clusterData
}: ClusterCreateTransactionParams): Promise<CKBComponents.RawTransactionToSign> {
    const createrLock = addressToScript(ckbAddress);

    let emptyCells = await collector.getCells({
        lock: createrLock,
    });

    console.debug("Fetched empty cells:", emptyCells);

    if (!emptyCells || emptyCells.length === 0) {
        throw new NoLiveCellError("The address has no empty cells");
    }

    // Filtering cells without a type and adding debug information
    emptyCells = emptyCells.filter((cell) => !cell.output.type);

    console.debug("Filtered empty cells without a type:", emptyCells);

    // The capacity required to launch cells is determined by the token info cell capacity, and transaction fee.
    const clusterCellCapacity = calculateRgbppClusterCellCapacity(clusterData);


    const txFee = MAX_FEE;
    const { inputs, sumInputsCapacity } = collector.collectInputs(emptyCells, clusterCellCapacity, txFee);
    const clusterId = generateClusterId(inputs[0], 0);

    const outputs: CKBComponents.CellOutput[] = [
        {
            lock: createrLock,
            type: {
                ...getClusterTypeScript(isMainnet),
                args: clusterId
            },
            capacity: append0x(clusterCellCapacity.toString(16)),
        },
    ];

    let changeCapacity = sumInputsCapacity - clusterCellCapacity;
    outputs.push({
        lock: createrLock,
        capacity: append0x(changeCapacity.toString(16)),
    });
    const outputsData: Hex[] = [bytesToHex(packRawClusterData(clusterData))];

    const cellDeps = [
        getClusterTypeDep(isMainnet), getSecp256k1CellDep(isMainnet)];
    const sporeCoBuild = generateClusterCreateCoBuild(outputs[0], outputsData[0]);
    const emptyWitness = { lock: '', inputType: '', outputType: '' };
    const witnesses = [emptyWitness, sporeCoBuild];

    const unsignedTx = {
        version: '0x0',
        cellDeps,
        headerDeps: [],
        inputs,
        outputs,
        outputsData,
        witnesses,
    };

    if (txFee === MAX_FEE) {
        const txSize = getTransactionSize(unsignedTx) + SECP256K1_WITNESS_LOCK_SIZE;
        const estimatedTxFee = calculateTransactionFee(txSize);
        changeCapacity -= estimatedTxFee;
        unsignedTx.outputs[unsignedTx.outputs.length - 1].capacity = append0x(changeCapacity.toString(16));
    }

    return unsignedTx;
}