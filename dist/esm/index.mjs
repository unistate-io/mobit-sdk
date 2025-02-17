import * as __WEBPACK_EXTERNAL_MODULE__nervosnetwork_ckb_sdk_utils_375d3b61__ from "@nervosnetwork/ckb-sdk-utils";
import * as __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__ from "@rgbpp-sdk/ckb";
import * as __WEBPACK_EXTERNAL_MODULE_rgbpp__ from "rgbpp";
import * as __WEBPACK_EXTERNAL_MODULE__apollo_client_core_1f4aac3e__ from "@apollo/client/core";
import * as __WEBPACK_EXTERNAL_MODULE__apollo_client_cache_99886c3b__ from "@apollo/client/cache";
import * as __WEBPACK_EXTERNAL_MODULE__apollo_client_link_batch_http_5da59ebe__ from "@apollo/client/link/batch-http";
import * as __WEBPACK_EXTERNAL_MODULE__ckb_ccc_core_29c1d0e0__ from "@ckb-ccc/core";
import * as __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_btc_ad1ee031__ from "@rgbpp-sdk/btc";
class CkbHelper {
    collector;
    isMainnet;
    constructor(isMainnet){
        this.isMainnet = isMainnet;
        if (isMainnet) this.collector = new __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.Collector({
            ckbNodeUrl: "https://mainnet.ckbapp.dev",
            ckbIndexerUrl: "https://mainnet.ckbapp.dev/indexer"
        });
        else this.collector = new __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.Collector({
            ckbNodeUrl: "https://testnet.ckbapp.dev",
            ckbIndexerUrl: "https://testnet.ckb.dev"
        });
    }
}
const createBtcService = (btcTestnetType)=>{
    let btcServiceUrl;
    let btcServiceToken;
    if (void 0 === btcTestnetType) {
        btcServiceUrl = "https://api.rgbpp.io";
        btcServiceToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJNb2JpdCIsImF1ZCI6Im1vYml0LmFwcCIsImp0aSI6IjNjMTAzNGNmLTcwZWEtNDgzMy04MGUwLTRlMDA2NTNkNTY3YiIsImlhdCI6MTcxODM0Njg0OX0.97pGqGCPMpP9rVaqq1QNaDcjykQLThGildYJWu93DiM";
    } else if ("Signet" === btcTestnetType) {
        btcServiceUrl = "https://api.signet.rgbpp.io";
        btcServiceToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtb2JpdCIsImF1ZCI6Im1vYml0LmFwcCIsImp0aSI6IjcxNzk3YzcxLTgyMmUtNGJhZC04OWIwLTdmNWZhZThhNjZkNyIsImlhdCI6MTcyMjMyODg0MH0.HiSNr_d8iYjIea9s1wBfKP8KzaBmz_7pXJcy68YcCPY";
    } else {
        btcServiceUrl = "https://api.testnet.rgbpp.io";
        btcServiceToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtb2JpdCIsImF1ZCI6Im1vYml0LmFwcCIsImp0aSI6ImY1NDZjZDBkLTUzNzQtNGI4YS1iMGRlLWY4NTRjMDY1Y2ZkOCIsImlhdCI6MTcyMjMyODc3Mn0.NmtM_Y7jkTjNKgTwatyAP0YoUDtwwci6LUe13R1L9SM";
    }
    const btcServiceOrigin = "https://mobit.app";
    return __WEBPACK_EXTERNAL_MODULE_rgbpp__.BtcAssetsApi.fromToken(btcServiceUrl, btcServiceToken, btcServiceOrigin);
};
class BtcHelper {
    btcDataSource;
    btcTestnetType;
    btcService;
    wallet;
    networkType;
    constructor(wallet, networkType, btcTestnetType){
        this.btcTestnetType = btcTestnetType;
        this.networkType = networkType;
        this.btcService = createBtcService(btcTestnetType);
        this.btcDataSource = new __WEBPACK_EXTERNAL_MODULE_rgbpp__.DataSource(this.btcService, networkType);
        this.wallet = wallet;
    }
}
async function getIndexerCells({ ckbAddresses, type, collector }) {
    const fromLocks = ckbAddresses.map(__WEBPACK_EXTERNAL_MODULE__nervosnetwork_ckb_sdk_utils_375d3b61__.addressToScript);
    let indexerCells = [];
    console.debug("Starting to fetch indexer cells for addresses:", ckbAddresses);
    console.debug("Converted addresses to locks:", fromLocks);
    for (const lock of fromLocks){
        console.debug("Fetching cells for lock:", lock);
        try {
            const cells = await collector.getCells({
                lock,
                type
            });
            console.debug("Fetched cells for lock:", lock, "Cells:", cells);
            indexerCells = indexerCells.concat(cells);
        } catch (error) {
            console.error("Error fetching cells for lock:", lock, "Error:", error);
            throw error;
        }
    }
    console.debug("Total indexer cells fetched:", indexerCells);
    return indexerCells;
}
const ICKB_ARGS = "0xb73b6ab39d79390c6de90a09c96b290c331baf1798ed6f97aed02590929734e800000080";
function isICKB(xudtArgs) {
    return xudtArgs === ICKB_ARGS;
}
const ICKB_CELL_DEP = {
    mainnet: {
        outPoint: {
            txHash: "0x621a6f38de3b9f453016780edac3b26bfcbfa3e2ecb47c2da275471a5d3ed165",
            index: "0x0"
        },
        depType: "depGroup"
    },
    testnet: {
        outPoint: {
            txHash: "0xf7ece4fb33d8378344cab11fcd6a4c6f382fd4207ac921cf5821f30712dcd311",
            index: "0x0"
        },
        depType: "depGroup"
    }
};
function getICKBCellDep(isMainnet) {
    return isMainnet ? ICKB_CELL_DEP.mainnet : ICKB_CELL_DEP.testnet;
}
async function getCellDeps(isMainnet, xudtArgs) {
    if (isICKB(xudtArgs)) return [
        getICKBCellDep(isMainnet)
    ];
    return await (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.fetchTypeIdCellDeps)(isMainnet, {
        xudt: true
    });
}
const MintStatusMap = {
    [0]: 0,
    [1]: 1,
    [2]: 2
};
const ASSET_DETAILS_QUERY = (0, __WEBPACK_EXTERNAL_MODULE__apollo_client_core_1f4aac3e__.gql)`
  query AssetDetails($txHash: bytea!, $txIndex: Int!) {
    xudtCell: xudt_cell_by_pk(
      transaction_hash: $txHash
      transaction_index: $txIndex
    ) {
      amount
      is_consumed
      type_id
      addressByTypeId {
        script_args
        script_code_hash
        script_hash_type
        token_info {
          decimal
          name
          symbol
        }
        token_infos {
          decimal
          name
          symbol
          expected_supply
          mint_limit
          mint_status
          udt_hash
        }
      }
    }
    sporeActions: spore_actions_by_pk(tx: $txHash) {
      cluster {
        cluster_description
        cluster_name
        created_at
        id
        is_burned
        mutant_id
        owner_address
        updated_at
        addressByTypeId {
          script_args
          script_code_hash
          script_hash_type
        }
      }
      spore {
        cluster_id
        content
        content_type
        created_at
        id
        is_burned
        owner_address
        updated_at
        addressByTypeId {
          script_args
          script_code_hash
          script_hash_type
        }
      }
    }
  }
`;
const RAW_INSCRIPTION_INFO_QUERY = (0, __WEBPACK_EXTERNAL_MODULE__apollo_client_core_1f4aac3e__.gql)`
  query RawInscriptionInfo($udtHash: String!) {
    token_info(where: { udt_hash: { _eq: $udtHash } }) {
      decimal
      name
      symbol
      expected_supply
      mint_limit
      mint_status
      udt_hash
    }
  }
`;
class RgbppSDK {
    service;
    client;
    isMainnet;
    constructor(isMainnet, btcTestnetType){
        this.isMainnet = isMainnet;
        this.service = createBtcService(btcTestnetType);
        const graphqlEndpoint = isMainnet ? "https://mainnet.unistate.io/v1/graphql" : "https://testnet.unistate.io/v1/graphql";
        this.client = new __WEBPACK_EXTERNAL_MODULE__apollo_client_core_1f4aac3e__.ApolloClient({
            cache: new __WEBPACK_EXTERNAL_MODULE__apollo_client_cache_99886c3b__.InMemoryCache(),
            link: new __WEBPACK_EXTERNAL_MODULE__apollo_client_link_batch_http_5da59ebe__.BatchHttpLink({
                uri: graphqlEndpoint,
                batchMax: 5,
                batchInterval: 20
            }),
            defaultOptions: {
                watchQuery: {
                    fetchPolicy: "cache-and-network"
                }
            }
        });
    }
    async fetchTxsDetails(btcAddress, afterTxId) {
        try {
            return await this.service.getBtcTransactions(btcAddress, {
                after_txid: afterTxId
            });
        } catch (error) {
            console.error("Error fetching transactions:", error);
            throw error;
        }
    }
    async fetchAssetsAndQueryDetails(btcAddress) {
        try {
            const [balance, assets] = await Promise.all([
                this.service.getBtcBalance(btcAddress),
                this.service.getRgbppAssetsByBtcAddress(btcAddress)
            ]);
            const validAssets = assets.filter((asset)=>!!asset.outPoint);
            if (0 === validAssets.length) return {
                balance,
                assets: {
                    xudtCells: [],
                    sporeActions: []
                }
            };
            const assetDetails = await Promise.all(validAssets.map((asset)=>this.queryAssetDetails(asset.outPoint)));
            const processedXudtCells = await Promise.all(assetDetails.filter((result)=>!!result.xudtCell).map((result)=>this.processXudtCell(result.xudtCell)));
            const assetsResult = {
                xudtCells: processedXudtCells,
                sporeActions: assetDetails.flatMap((result)=>result.sporeActions ? [
                        result.sporeActions
                    ] : [])
            };
            return {
                balance,
                assets: assetsResult
            };
        } catch (error) {
            console.error("Error fetching assets and details:", error);
            throw error;
        }
    }
    xudtHash(script_args) {
        return this.removeHexPrefix((0, __WEBPACK_EXTERNAL_MODULE__nervosnetwork_ckb_sdk_utils_375d3b61__.scriptToHash)({
            ...(0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.getXudtTypeScript)(this.isMainnet),
            args: this.formatHexPrefix(script_args)
        }));
    }
    formatHexPrefix(hexString) {
        return `\\x${hexString.replace(/^0x/, "")}`;
    }
    removeHexPrefix(prefixedHexString) {
        return `0x${prefixedHexString.replace(/^\\x/, "")}`;
    }
    async queryRawInscriptionInfo(udtHash) {
        const { data } = await this.client.query({
            query: RAW_INSCRIPTION_INFO_QUERY,
            variables: {
                udtHash
            }
        });
        return data.token_info;
    }
    async queryAssetDetails(outPoint) {
        const { data } = await this.client.query({
            query: ASSET_DETAILS_QUERY,
            variables: {
                txHash: this.formatHexPrefix(outPoint.txHash),
                txIndex: Number(outPoint.index)
            }
        });
        return data;
    }
    async processXudtCell(cell) {
        if (!cell.addressByTypeId.token_info && 0 === cell.addressByTypeId.token_infos.length) {
            const rawInfo = await this.queryRawInscriptionInfo(this.xudtHash(cell.addressByTypeId.script_args));
            cell.addressByTypeId.token_infos = rawInfo;
        }
        return {
            amount: cell.amount,
            is_consumed: cell.is_consumed,
            type_id: cell.type_id,
            addressByTypeId: {
                token_info: cell.addressByTypeId.token_info,
                inscription_infos: cell.addressByTypeId.token_infos.map((info)=>({
                        ...info,
                        mint_status: this.validateMintStatus(info.mint_status)
                    })),
                script_args: cell.addressByTypeId.script_args,
                script_code_hash: cell.addressByTypeId.script_code_hash,
                script_hash_type: cell.addressByTypeId.script_hash_type
            }
        };
    }
    validateMintStatus(status) {
        const validStatus = MintStatusMap[status];
        if (void 0 === validStatus) throw new Error(`Invalid MintStatus: ${status}`);
        return validStatus;
    }
}
async function createBurnXudtTransaction({ xudtType, burnAmount, ckbAddress, collector, isMainnet }) {
    const fromLock = (0, __WEBPACK_EXTERNAL_MODULE__nervosnetwork_ckb_sdk_utils_375d3b61__.addressToScript)(ckbAddress);
    const xudtCells = await collector.getCells({
        lock: fromLock,
        type: xudtType
    });
    console.debug("Fetched xudt cells:", xudtCells);
    if (!xudtCells || 0 === xudtCells.length) throw new __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.NoXudtLiveCellError("The address has no xudt cells");
    const { inputs: udtInputs, sumAmount } = collector.collectUdtInputs({
        liveCells: xudtCells,
        needAmount: burnAmount
    });
    let inputs = udtInputs;
    console.debug("Collected inputs:", inputs);
    console.debug("Sum of amount:", sumAmount);
    if (sumAmount < burnAmount) throw new Error("Not enough xUDT tokens to burn");
    const outputs = [];
    const outputsData = [];
    if (sumAmount > burnAmount) {
        outputs.push({
            lock: fromLock,
            type: xudtType,
            capacity: "0x0"
        });
        outputsData.push((0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.append0x)((0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.u128ToLe)(sumAmount - burnAmount)));
        console.debug("Updated outputs:", outputs);
        console.debug("Updated outputs data:", outputsData);
    }
    const cellDeps = [
        ...await getCellDeps(isMainnet, xudtType.args)
    ];
    const unsignedTx = {
        version: "0x0",
        cellDeps,
        headerDeps: [],
        inputs,
        outputs,
        outputsData,
        witnesses: []
    };
    console.debug("Unsigned transaction:", unsignedTx);
    return unsignedTx;
}
async function createIssueXudtTransaction({ xudtTotalAmount, tokenInfo, ckbAddress, collector, isMainnet }) {
    const issueLock = (0, __WEBPACK_EXTERNAL_MODULE__nervosnetwork_ckb_sdk_utils_375d3b61__.addressToScript)(ckbAddress);
    let emptyCells = await collector.getCells({
        lock: issueLock
    });
    console.debug("Fetched empty cells:", emptyCells);
    if (!emptyCells || 0 === emptyCells.length) throw new __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.NoLiveCellError("The address has no empty cells");
    emptyCells = emptyCells.filter((cell)=>!cell.output.type);
    console.debug("Filtered empty cells without a type:", emptyCells);
    const { inputs } = collector.collectInputs(emptyCells, BigInt(0), BigInt(0), {
        minCapacity: __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.MIN_CAPACITY
    });
    console.debug("Collected inputs:", inputs);
    const xudtType = {
        ...(0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.getXudtTypeScript)(isMainnet),
        args: (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.append0x)((0, __WEBPACK_EXTERNAL_MODULE__nervosnetwork_ckb_sdk_utils_375d3b61__.scriptToHash)(issueLock))
    };
    console.debug("Defined xUDT type script:", xudtType);
    console.log("xUDT type script", xudtType);
    const outputs = [
        {
            lock: issueLock,
            type: xudtType,
            capacity: "0x0"
        },
        {
            lock: issueLock,
            type: {
                ...(0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.getUniqueTypeScript)(isMainnet),
                args: (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.generateUniqueTypeArgs)(inputs[0], 1)
            },
            capacity: "0x0"
        },
        {
            lock: issueLock,
            capacity: "0x0"
        }
    ];
    console.debug("Defined outputs:", outputs);
    const totalAmount = xudtTotalAmount * BigInt(10 ** tokenInfo.decimal);
    console.debug("Calculated total amount:", totalAmount);
    const outputsData = [
        (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.append0x)((0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.u128ToLe)(totalAmount)),
        (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.encodeRgbppTokenInfo)(tokenInfo),
        "0x"
    ];
    console.debug("Defined outputs data:", outputsData);
    const cellDeps = [
        ...await (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.fetchTypeIdCellDeps)(isMainnet, {
            xudt: true,
            unique: true
        })
    ];
    console.debug("Defined cell dependencies:", cellDeps);
    const unsignedTx = {
        version: "0x0",
        cellDeps,
        headerDeps: [],
        inputs,
        outputs,
        outputsData,
        witnesses: []
    };
    console.debug("Defined unsigned transaction:", unsignedTx);
    return unsignedTx;
}
const leapFromCkbToBtcTransaction = async ({ outIndex, btcTxId, xudtType, transferAmount, collector, ckbAddress, btcTestnetType })=>{
    const toRgbppLockArgs = (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.buildRgbppLockArgs)(outIndex, btcTxId);
    const ckbRawTx = await (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.genCkbJumpBtcVirtualTx)({
        collector,
        fromCkbAddress: ckbAddress,
        toRgbppLockArgs,
        xudtTypeBytes: (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.serializeScript)(xudtType),
        transferAmount,
        btcTestnetType,
        ckbFeeRate: BigInt(0),
        witnessLockPlaceholderSize: 0
    });
    const filteredOutputs = ckbRawTx.outputs.filter((output, index)=>void 0 !== output.type);
    const filteredOutputsData = ckbRawTx.outputsData.filter((_, index)=>void 0 !== ckbRawTx.outputs[index].type);
    const unsignedTx = {
        ...ckbRawTx,
        outputs: filteredOutputs,
        outputsData: filteredOutputsData,
        cellDeps: [
            ...ckbRawTx.cellDeps
        ],
        witnesses: []
    };
    return unsignedTx;
};
const leapSporeFromCkbToBtcTransaction = async ({ outIndex, btcTxId, sporeType, isMainnet, collector, ckbAddress, btcTestnetType })=>{
    const toRgbppLockArgs = (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.buildRgbppLockArgs)(outIndex, btcTxId);
    const ckbRawTx = await (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.genLeapSporeFromCkbToBtcRawTx)({
        collector,
        fromCkbAddress: ckbAddress,
        toRgbppLockArgs,
        sporeTypeBytes: (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.serializeScript)(sporeType),
        isMainnet,
        btcTestnetType,
        ckbFeeRate: BigInt(0),
        witnessLockPlaceholderSize: 0
    });
    const filteredOutputs = ckbRawTx.outputs.filter((output, index)=>void 0 !== output.type);
    const filteredOutputsData = ckbRawTx.outputsData.filter((_, index)=>void 0 !== ckbRawTx.outputs[index].type);
    const unsignedTx = {
        ...ckbRawTx,
        outputs: filteredOutputs,
        outputsData: filteredOutputsData,
        cellDeps: [
            ...ckbRawTx.cellDeps
        ],
        witnesses: []
    };
    return unsignedTx;
};
async function createMergeXudtTransaction({ xudtType, ckbAddresses, collector, isMainnet }, ckbAddress = ckbAddresses[0]) {
    const fromLock = (0, __WEBPACK_EXTERNAL_MODULE__nervosnetwork_ckb_sdk_utils_375d3b61__.addressToScript)(ckbAddress);
    const xudtCells = await getIndexerCells({
        ckbAddresses,
        type: xudtType,
        collector
    });
    console.debug("Fetched xudt cells:", xudtCells);
    if (!xudtCells || 0 === xudtCells.length) throw new __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.NoXudtLiveCellError("The addresses have no xudt cells");
    if (1 === xudtCells.length) throw new Error("Only one xudt cell found, no need to merge");
    const { inputs: udtInputs, sumInputsCapacity, sumAmount } = collectAllUdtInputs(xudtCells);
    const inputs = udtInputs;
    console.debug("Collected inputs:", inputs);
    console.debug("Sum of inputs capacity:", sumInputsCapacity);
    console.debug("Sum of amount:", sumAmount);
    const outputs = [
        {
            lock: fromLock,
            type: xudtType,
            capacity: "0x0"
        }
    ];
    const outputsData = [
        (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.append0x)((0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.u128ToLe)(sumAmount))
    ];
    const cellDeps = [
        ...await (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.fetchTypeIdCellDeps)(isMainnet, {
            xudt: true
        })
    ];
    const unsignedTx = {
        version: "0x0",
        cellDeps,
        headerDeps: [],
        inputs,
        outputs,
        outputsData,
        witnesses: []
    };
    console.debug("Unsigned transaction:", unsignedTx);
    return unsignedTx;
}
function collectAllUdtInputs(liveCells) {
    const inputs = [];
    let sumInputsCapacity = BigInt(0);
    let sumAmount = BigInt(0);
    for (const cell of liveCells)if ("0x" !== cell.outputData) {
        inputs.push({
            previousOutput: {
                txHash: cell.outPoint.txHash,
                index: cell.outPoint.index
            },
            since: "0x0"
        });
        sumInputsCapacity += BigInt(cell.output.capacity);
        sumAmount += (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.leToU128)((0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.remove0x)(cell.outputData).slice(0, 32));
    }
    return {
        inputs,
        sumInputsCapacity,
        sumAmount
    };
}
async function createTransferXudtTransaction({ xudtType, receivers, ckbAddresses, collector, isMainnet }, ckbAddress = ckbAddresses[0]) {
    const xudtCells = await getIndexerCells({
        ckbAddresses,
        type: xudtType,
        collector
    });
    console.debug("Fetched xudt cells:", xudtCells);
    if (!xudtCells || 0 === xudtCells.length) throw new __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.NoXudtLiveCellError("The addresses have no xudt cells");
    const sumTransferAmount = receivers.map((receiver)=>receiver.transferAmount).reduce((prev, current)=>prev + current, BigInt(0));
    console.debug("Sum Transfer Amount:", sumTransferAmount);
    let sumXudtOutputCapacity = receivers.map(({ toAddress })=>(0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.calculateUdtCellCapacity)((0, __WEBPACK_EXTERNAL_MODULE__nervosnetwork_ckb_sdk_utils_375d3b61__.addressToScript)(toAddress))).reduce((prev, current)=>prev + current, BigInt(0));
    console.debug("Sum XUDT Output Capacity:", sumXudtOutputCapacity);
    const { inputs: udtInputs, sumInputsCapacity: sumXudtInputsCapacity, sumAmount } = collector.collectUdtInputs({
        liveCells: xudtCells,
        needAmount: sumTransferAmount
    });
    console.debug("Sum XUDT Inputs Capacity:", sumXudtInputsCapacity);
    console.debug("Sum Amount:", sumAmount);
    let inputs = udtInputs;
    const outputs = receivers.map(({ toAddress })=>({
            lock: (0, __WEBPACK_EXTERNAL_MODULE__nervosnetwork_ckb_sdk_utils_375d3b61__.addressToScript)(toAddress),
            type: xudtType,
            capacity: "0x0"
        }));
    const outputsData = receivers.map(({ transferAmount })=>(0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.append0x)((0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.u128ToLe)(transferAmount)));
    console.debug("Outputs:", outputs);
    console.debug("Outputs Data:", outputsData);
    if (sumAmount > sumTransferAmount) {
        outputs.push({
            lock: (0, __WEBPACK_EXTERNAL_MODULE__nervosnetwork_ckb_sdk_utils_375d3b61__.addressToScript)(ckbAddress),
            type: xudtType,
            capacity: "0x0"
        });
        outputsData.push((0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.append0x)((0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.u128ToLe)(sumAmount - sumTransferAmount)));
        console.debug("Updated Outputs:", outputs);
        console.debug("Updated Outputs Data:", outputsData);
    }
    const cellDeps = [
        ...await getCellDeps(isMainnet, xudtType.args)
    ];
    console.debug("Cell Deps:", cellDeps);
    const unsignedTx = {
        version: "0x0",
        cellDeps,
        headerDeps: [],
        inputs,
        outputs,
        outputsData,
        witnesses: []
    };
    console.debug("Unsigned Transaction:", unsignedTx);
    return unsignedTx;
}
function convertToRawTransaction(rawTransactionToSign) {
    const witnesses = rawTransactionToSign.witnesses.map((witness)=>{
        if ("string" == typeof witness) return witness;
        return convertToWitness(witness);
    });
    return {
        version: rawTransactionToSign.version,
        cellDeps: rawTransactionToSign.cellDeps,
        headerDeps: rawTransactionToSign.headerDeps,
        inputs: rawTransactionToSign.inputs,
        outputs: rawTransactionToSign.outputs,
        outputsData: rawTransactionToSign.outputsData,
        witnesses
    };
}
function convertToWitness(witnessArgs) {
    const bytes = __WEBPACK_EXTERNAL_MODULE__ckb_ccc_core_29c1d0e0__.ccc.WitnessArgs.from(witnessArgs).toBytes();
    return Buffer.from(bytes).toString("hex");
}
function convertToOutPointLike(outPoint) {
    return {
        txHash: (0, __WEBPACK_EXTERNAL_MODULE__ckb_ccc_core_29c1d0e0__.hexFrom)(outPoint.txHash),
        index: (0, __WEBPACK_EXTERNAL_MODULE__ckb_ccc_core_29c1d0e0__.hexFrom)(outPoint.index)
    };
}
function convertToCellDepLike(cellDep) {
    if (!cellDep.outPoint) throw new Error("CellDep is missing required field: outPoint");
    return {
        outPoint: convertToOutPointLike(cellDep.outPoint),
        depType: cellDep.depType
    };
}
function convertToCellInputLike(cellInput) {
    if (!cellInput.previousOutput) throw new Error("CellInput is missing required field: previousOutput");
    return {
        previousOutput: convertToOutPointLike(cellInput.previousOutput),
        since: cellInput.since ? (0, __WEBPACK_EXTERNAL_MODULE__ckb_ccc_core_29c1d0e0__.hexFrom)(cellInput.since) : void 0
    };
}
function ConvertToTransactionLike(rawTransaction) {
    return {
        version: rawTransaction.version,
        cellDeps: rawTransaction.cellDeps.map(convertToCellDepLike),
        headerDeps: rawTransaction.headerDeps.map(__WEBPACK_EXTERNAL_MODULE__ckb_ccc_core_29c1d0e0__.hexFrom),
        inputs: rawTransaction.inputs.map(convertToCellInputLike),
        outputs: rawTransaction.outputs.map((output)=>({
                capacity: output.capacity,
                lock: {
                    args: (0, __WEBPACK_EXTERNAL_MODULE__ckb_ccc_core_29c1d0e0__.hexFrom)(output.lock.args),
                    codeHash: (0, __WEBPACK_EXTERNAL_MODULE__ckb_ccc_core_29c1d0e0__.hexFrom)(output.lock.codeHash),
                    hashType: output.lock.hashType
                },
                type: output.type ? {
                    args: (0, __WEBPACK_EXTERNAL_MODULE__ckb_ccc_core_29c1d0e0__.hexFrom)(output.type.args),
                    codeHash: (0, __WEBPACK_EXTERNAL_MODULE__ckb_ccc_core_29c1d0e0__.hexFrom)(output.type.codeHash),
                    hashType: output.type.hashType
                } : null
            })),
        outputsData: rawTransaction.outputsData.map(__WEBPACK_EXTERNAL_MODULE__ckb_ccc_core_29c1d0e0__.hexFrom),
        witnesses: rawTransaction.witnesses.map(__WEBPACK_EXTERNAL_MODULE__ckb_ccc_core_29c1d0e0__.hexFrom)
    };
}
function convertToTransaction(rawTransactionToSign) {
    const rawTransaction = convertToRawTransaction(rawTransactionToSign);
    const transactionLike = ConvertToTransactionLike(rawTransaction);
    const tx = __WEBPACK_EXTERNAL_MODULE__ckb_ccc_core_29c1d0e0__.ccc.Transaction.from(transactionLike);
    return tx;
}
async function signAndSendPsbt(psbt, wallet, service) {
    console.debug("Starting PSBT signing process...");
    console.debug("PSBT before signing:", psbt.toHex());
    try {
        console.debug("test");
        const signPbst = __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_btc_ad1ee031__.bitcoin.Psbt.fromHex(await wallet.signPsbt(psbt.toHex()));
        console.debug("PSBT after signing:", signPbst.toBase64());
        const tx = signPbst.extractTransaction();
        const txHex = tx.toHex();
        console.debug("Extracted transaction hex:", txHex);
        console.debug("Sending transaction to service...");
        const { txid } = await service.sendBtcTransaction(txHex);
        console.debug("Transaction sent successfully. TXID:", txid);
        const rawTxHex = (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_btc_ad1ee031__.transactionToHex)(tx, false);
        console.debug("Raw transaction hex (excluding witness):", rawTxHex);
        return {
            txHex,
            txId: txid,
            rawTxHex
        };
    } catch (error) {
        console.error("Error during PSBT signing or transaction sending:", error);
        throw error;
    }
}
const prepareLaunchCell = async ({ outIndex, btcTxId, rgbppTokenInfo, ckbAddress, collector, isMainnet, btcTestnetType })=>{
    const masterLock = (0, __WEBPACK_EXTERNAL_MODULE__nervosnetwork_ckb_sdk_utils_375d3b61__.addressToScript)(ckbAddress);
    console.log("ckb address: ", ckbAddress);
    const launchCellCapacity = (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.calculateRgbppCellCapacity)() + (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.calculateRgbppTokenInfoCellCapacity)(rgbppTokenInfo, isMainnet);
    let emptyCells = await collector.getCells({
        lock: masterLock
    });
    if (!emptyCells || 0 === emptyCells.length) throw new __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.NoLiveCellError("The address has no empty cells");
    emptyCells = emptyCells.filter((cell)=>!cell.output.type);
    const { inputs } = collector.collectInputs(emptyCells, launchCellCapacity, BigInt(0));
    const outputs = [
        {
            lock: (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.genRgbppLockScript)((0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.buildRgbppLockArgs)(outIndex, btcTxId), isMainnet, btcTestnetType),
            capacity: (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.append0x)(launchCellCapacity.toString(16))
        }
    ];
    const outputsData = [
        "0x",
        "0x"
    ];
    const unsignedTx = {
        version: "0x0",
        cellDeps: [],
        headerDeps: [],
        inputs,
        outputs,
        outputsData,
        witnesses: []
    };
    return unsignedTx;
};
const launchRgbppAsset = async ({ ownerRgbppLockArgs, rgbppTokenInfo, collector, isMainnet, btcTestnetType, btcAccount, btcDataSource, btcAccountPubkey, launchAmount, btcService, wallet }, btcFeeRate)=>{
    const ckbVirtualTxResult = await (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.genRgbppLaunchCkbVirtualTx)({
        collector: collector,
        ownerRgbppLockArgs,
        rgbppTokenInfo,
        launchAmount,
        isMainnet: isMainnet,
        btcTestnetType: btcTestnetType
    });
    const { commitment, ckbRawTx, needPaymasterCell } = ckbVirtualTxResult;
    console.log("RGB++ Asset type script args: ", ckbRawTx.outputs[0].type?.args);
    const psbt = await (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_btc_ad1ee031__.sendRgbppUtxos)({
        ckbVirtualTx: ckbRawTx,
        commitment,
        tos: [
            btcAccount
        ],
        needPaymaster: needPaymasterCell,
        ckbCollector: collector,
        from: btcAccount,
        fromPubkey: btcAccountPubkey,
        source: btcDataSource,
        feeRate: btcFeeRate
    });
    const { txId: btcTxId, rawTxHex: btcTxBytes } = await signAndSendPsbt(psbt, wallet, btcService);
    console.log(`BTC ${btcTestnetType} TxId: ${btcTxId}`);
    const interval = setInterval(async ()=>{
        try {
            console.log("Waiting for BTC tx and proof to be ready");
            const rgbppApiSpvProof = await btcService.getRgbppSpvProof(btcTxId, 0);
            clearInterval(interval);
            const newCkbRawTx = (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.updateCkbTxWithRealBtcTxId)({
                ckbRawTx,
                btcTxId,
                isMainnet
            });
            const ckbTx = await (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.appendCkbTxWitnesses)({
                ckbRawTx: newCkbRawTx,
                btcTxBytes,
                rgbppApiSpvProof
            });
            const txHash = await (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.sendCkbTx)({
                collector,
                signedTx: ckbTx
            });
            console.info(`RGB++ Asset has been launched and CKB tx hash is ${txHash}`);
        } catch (error) {
            console.error(error);
            throw error;
        }
    }, 30000);
    return {
        btcTxId
    };
};
const launchCombined = async ({ rgbppTokenInfo, collector, isMainnet, btcTestnetType, btcAccount, btcDataSource, btcAccountPubkey, launchAmount, ckbAddress, filterUtxo, btcService, wallet, cccSigner }, ckbFeeRate, btcFeeRate)=>{
    const { outIndex, btcTxId } = await fetchAndFilterUtxos(btcAccount, filterUtxo, btcService);
    const prepareLaunchCellTx = convertToTransaction(await prepareLaunchCell({
        outIndex,
        btcTxId,
        rgbppTokenInfo,
        ckbAddress,
        collector,
        isMainnet,
        btcTestnetType
    }));
    await prepareLaunchCellTx.completeFeeBy(cccSigner, ckbFeeRate);
    const txHash = await cccSigner.sendTransaction(prepareLaunchCellTx);
    console.info(`Launch cell has been created and the CKB tx hash ${txHash}`);
    const ownerRgbppLockArgs = (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.buildRgbppLockArgs)(outIndex, btcTxId);
    const { btcTxId: TxId } = await launchRgbppAsset({
        ownerRgbppLockArgs,
        rgbppTokenInfo,
        collector,
        isMainnet,
        btcAccount,
        btcDataSource,
        btcAccountPubkey,
        btcTestnetType,
        launchAmount,
        btcService,
        wallet
    }, btcFeeRate);
    return {
        btcTxId: TxId,
        ckbTxHash: txHash
    };
};
const prepareLaunchCellTransaction = async ({ ckbAddress, rgbppTokenInfo, collector, isMainnet, btcTestnetType, outIndex, btcTxId })=>{
    const prepareLaunchCellTx = await prepareLaunchCell({
        outIndex,
        btcTxId,
        rgbppTokenInfo,
        ckbAddress,
        collector,
        isMainnet,
        btcTestnetType
    });
    return prepareLaunchCellTx;
};
const prepareLauncherUnsignedPsbt = async ({ rgbppTokenInfo, collector, isMainnet, btcTestnetType, btcAccount, btcDataSource, btcAccountPubkey, launchAmount, outIndex, btcTxId }, btcFeeRate)=>{
    const ownerRgbppLockArgs = (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.buildRgbppLockArgs)(outIndex, btcTxId);
    const ckbVirtualTxResult = await (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.genRgbppLaunchCkbVirtualTx)({
        collector: collector,
        ownerRgbppLockArgs,
        rgbppTokenInfo,
        launchAmount,
        isMainnet: isMainnet,
        btcTestnetType: btcTestnetType
    });
    const { commitment, ckbRawTx, needPaymasterCell } = ckbVirtualTxResult;
    console.log("RGB++ Asset type script args: ", ckbRawTx.outputs[0].type?.args);
    const psbt = await (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_btc_ad1ee031__.sendRgbppUtxos)({
        ckbVirtualTx: ckbRawTx,
        commitment,
        tos: [
            btcAccount
        ],
        needPaymaster: needPaymasterCell,
        ckbCollector: collector,
        from: btcAccount,
        fromPubkey: btcAccountPubkey,
        source: btcDataSource,
        feeRate: btcFeeRate
    });
    return psbt;
};
const fetchAndFilterUtxos = async (btcAccount, filterUtxo, btcService)=>{
    const utxos = await btcService.getBtcUtxos(btcAccount, {
        only_non_rgbpp_utxos: true,
        only_confirmed: true,
        min_satoshi: 10000
    });
    const { outIndex, btcTxId } = await filterUtxo(utxos);
    return {
        outIndex,
        btcTxId
    };
};
const prepareClusterCell = async ({ outIndex, btcTxId, ckbAddress, clusterData, collector, isMainnet, btcTestnetType })=>{
    const masterLock = (0, __WEBPACK_EXTERNAL_MODULE__nervosnetwork_ckb_sdk_utils_375d3b61__.addressToScript)(ckbAddress);
    console.log("ckb address: ", ckbAddress);
    const clusterCellCapacity = (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.calculateRgbppClusterCellCapacity)(clusterData);
    let emptyCells = await collector.getCells({
        lock: masterLock
    });
    if (!emptyCells || 0 === emptyCells.length) throw new __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.NoLiveCellError("The address has no empty cells");
    emptyCells = emptyCells.filter((cell)=>!cell.output.type);
    const { inputs } = collector.collectInputs(emptyCells, clusterCellCapacity, BigInt(0));
    const outputs = [
        {
            lock: (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.genRgbppLockScript)((0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.buildRgbppLockArgs)(outIndex, btcTxId), isMainnet, btcTestnetType),
            capacity: (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.append0x)(clusterCellCapacity.toString(16))
        }
    ];
    const outputsData = [
        "0x"
    ];
    const unsignedTx = {
        version: "0x0",
        cellDeps: [],
        headerDeps: [],
        inputs,
        outputs,
        outputsData,
        witnesses: []
    };
    return unsignedTx;
};
const createCluster = async ({ ownerRgbppLockArgs, collector, clusterData, isMainnet, btcTestnetType, fromBtcAccount, fromBtcAccountPubkey, btcDataSource, btcService, wallet }, btcFeeRate = 30)=>{
    const ckbVirtualTxResult = await (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.genCreateClusterCkbVirtualTx)({
        collector,
        rgbppLockArgs: ownerRgbppLockArgs,
        clusterData,
        isMainnet,
        ckbFeeRate: BigInt(2000),
        btcTestnetType
    });
    const { commitment, ckbRawTx, clusterId, needPaymasterCell } = ckbVirtualTxResult;
    console.log("clusterId: ", clusterId);
    const psbt = await (0, __WEBPACK_EXTERNAL_MODULE_rgbpp__.sendRgbppUtxos)({
        ckbVirtualTx: ckbRawTx,
        commitment,
        tos: [
            fromBtcAccount
        ],
        needPaymaster: needPaymasterCell,
        ckbCollector: collector,
        from: fromBtcAccount,
        fromPubkey: fromBtcAccountPubkey,
        source: btcDataSource,
        feeRate: btcFeeRate
    });
    const { txId: btcTxId, rawTxHex: btcTxBytes } = await signAndSendPsbt(psbt, wallet, btcService);
    console.log("BTC TxId: ", btcTxId);
    const interval = setInterval(async ()=>{
        try {
            console.log("Waiting for BTC tx and proof to be ready");
            const rgbppApiSpvProof = await btcService.getRgbppSpvProof(btcTxId, 0);
            clearInterval(interval);
            const newCkbRawTx = (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.updateCkbTxWithRealBtcTxId)({
                ckbRawTx,
                btcTxId,
                isMainnet
            });
            console.log("The cluster rgbpp lock args: ", newCkbRawTx.outputs[0].lock.args);
            const ckbTx = await (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.appendCkbTxWitnesses)({
                ckbRawTx: newCkbRawTx,
                btcTxBytes,
                rgbppApiSpvProof
            });
            ckbTx.witnesses[ckbTx.witnesses.length - 1] = (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.generateClusterCreateCoBuild)(ckbTx.outputs[0], ckbTx.outputsData[0]);
            console.log(JSON.stringify(ckbTx));
            const txHash = await (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.sendCkbTx)({
                collector,
                signedTx: ckbTx
            });
            console.info(`RGB++ Cluster has been created and tx hash is ${txHash}`);
        } catch (error) {
            console.error(error);
            throw error;
        }
    }, 30000);
    return {
        btcTxId
    };
};
const createClusterCombined = async ({ ckbAddress, clusterData, collector, isMainnet, btcTestnetType, fromBtcAccount, fromBtcAccountPubkey, btcDataSource, wallet, btcService, filterUtxo, cccSigner }, ckbFeeRate, btcFeeRate = 30)=>{
    const { outIndex, btcTxId } = await fetchAndFilterUtxos(fromBtcAccount, filterUtxo, btcService);
    const prepareClusterCellTx = convertToTransaction(await prepareClusterCell({
        outIndex,
        btcTxId,
        clusterData,
        ckbAddress,
        collector,
        isMainnet,
        btcTestnetType
    }));
    await prepareClusterCellTx.completeFeeBy(cccSigner, ckbFeeRate);
    const txHash = await cccSigner.sendTransaction(prepareClusterCellTx);
    console.info(`Create Cluster cell has been created and the CKB tx hash ${txHash}`);
    const ownerRgbppLockArgs = (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.buildRgbppLockArgs)(outIndex, btcTxId);
    const { btcTxId: TxId } = await createCluster({
        ownerRgbppLockArgs,
        clusterData,
        collector,
        isMainnet,
        fromBtcAccount,
        btcDataSource,
        fromBtcAccountPubkey,
        btcTestnetType,
        btcService,
        wallet
    }, btcFeeRate);
    return {
        btcTxId: TxId,
        ckbTxHash: txHash
    };
};
const prepareClusterCellTransaction = async ({ ckbAddress, clusterData, collector, isMainnet, btcTestnetType, outIndex, btcTxId })=>{
    const prepareClusterCellTx = await prepareClusterCell({
        outIndex,
        btcTxId,
        clusterData,
        ckbAddress,
        collector,
        isMainnet,
        btcTestnetType
    });
    return prepareClusterCellTx;
};
const prepareCreateClusterUnsignedPsbt = async ({ collector, clusterData, isMainnet, btcTestnetType, fromBtcAccount, fromBtcAccountPubkey, btcDataSource, outIndex, btcTxId, btcFeeRate = 30 })=>{
    const ckbVirtualTxResult = await (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.genCreateClusterCkbVirtualTx)({
        collector,
        rgbppLockArgs: (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.buildRgbppLockArgs)(outIndex, btcTxId),
        clusterData,
        isMainnet,
        ckbFeeRate: BigInt(2000),
        btcTestnetType
    });
    const { commitment, ckbRawTx, needPaymasterCell } = ckbVirtualTxResult;
    const psbt = await (0, __WEBPACK_EXTERNAL_MODULE_rgbpp__.sendRgbppUtxos)({
        ckbVirtualTx: ckbRawTx,
        commitment,
        tos: [
            fromBtcAccount
        ],
        needPaymaster: needPaymasterCell,
        ckbCollector: collector,
        from: fromBtcAccount,
        fromPubkey: fromBtcAccountPubkey,
        source: btcDataSource,
        feeRate: btcFeeRate
    });
    return psbt;
};
const createSpores = async ({ clusterRgbppLockArgs, receivers, collector, isMainnet, btcTestnetType, fromBtcAccount, fromBtcAccountPubkey, btcDataSource, wallet, btcService, ckbAddress, cccSigner }, btcFeeRate = 120, ckbFeeRate)=>{
    const ckbVirtualTxResult = await (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.genCreateSporeCkbVirtualTx)({
        collector,
        sporeDataList: receivers.map((receiver)=>receiver.sporeData),
        clusterRgbppLockArgs,
        isMainnet,
        ckbFeeRate: BigInt(2000),
        btcTestnetType
    });
    const { commitment, ckbRawTx, sumInputsCapacity, clusterCell, needPaymasterCell } = ckbVirtualTxResult;
    const btcTos = [
        fromBtcAccount,
        ...receivers.map((receiver)=>receiver.toBtcAddress)
    ];
    const psbt = await (0, __WEBPACK_EXTERNAL_MODULE_rgbpp__.sendRgbppUtxos)({
        ckbVirtualTx: ckbRawTx,
        commitment,
        tos: btcTos,
        needPaymaster: needPaymasterCell,
        ckbCollector: collector,
        from: fromBtcAccount,
        fromPubkey: fromBtcAccountPubkey,
        source: btcDataSource,
        feeRate: btcFeeRate
    });
    const { txId: btcTxId, rawTxHex: btcTxBytes } = await signAndSendPsbt(psbt, wallet, btcService);
    console.log("BTC TxId: ", btcTxId);
    await btcService.sendRgbppCkbTransaction({
        btc_txid: btcTxId,
        ckb_virtual_result: ckbVirtualTxResult
    });
    const interval = setInterval(async ()=>{
        try {
            console.log("Waiting for BTC tx and proof to be ready");
            const rgbppApiSpvProof = await btcService.getRgbppSpvProof(btcTxId, 0);
            clearInterval(interval);
            const newCkbRawTx = (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.updateCkbTxWithRealBtcTxId)({
                ckbRawTx,
                btcTxId,
                isMainnet
            });
            console.log("The new cluster rgbpp lock args: ", newCkbRawTx.outputs[0].lock.args);
            const ckbTx = await (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.appendCkbTxWitnesses)({
                ckbRawTx: newCkbRawTx,
                btcTxBytes,
                rgbppApiSpvProof
            });
            console.log("Spore type scripts: ", JSON.stringify(ckbTx.outputs.slice(1).map((output)=>output.type)));
            ckbTx.witnesses[ckbTx.witnesses.length - 1] = (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.generateSporeCreateCoBuild)({
                sporeOutputs: ckbTx.outputs.slice(1),
                sporeOutputsData: ckbTx.outputsData.slice(1),
                clusterCell,
                clusterOutputCell: ckbTx.outputs[0]
            });
            const unsignedTx = convertToTransaction(await (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.buildAppendingIssuerCellToSporesCreateTx)({
                issuerAddress: ckbAddress,
                ckbRawTx: ckbTx,
                collector,
                sumInputsCapacity,
                ckbFeeRate: BigInt(0),
                witnessLockPlaceholderSize: 0
            }));
            await unsignedTx.completeFeeBy(cccSigner, ckbFeeRate);
            const txHash = await cccSigner.sendTransaction(unsignedTx);
            console.info(`RGB++ Spore has been created and tx hash is ${txHash}`);
        } catch (error) {
            console.error(error);
            throw error;
        }
    }, 30000);
    return {
        btcTxId
    };
};
const createSporesCombined = async ({ clusterType, receivers, collector, isMainnet, btcTestnetType, fromBtcAccount, fromBtcAccountPubkey, btcDataSource, wallet, btcService, ckbAddress, cccSigner }, btcFeeRate = 120, ckbFeeRate)=>{
    const clusterRgbppLockArgs = await fetchAndValidateAssets(fromBtcAccount, clusterType, btcService);
    const res = await createSpores({
        clusterRgbppLockArgs,
        receivers,
        collector,
        isMainnet,
        btcTestnetType,
        fromBtcAccount,
        fromBtcAccountPubkey,
        btcDataSource,
        wallet,
        btcService,
        ckbAddress,
        cccSigner
    }, btcFeeRate, ckbFeeRate);
    return res;
};
const prepareCreateSporeUnsignedTransaction = async ({ clusterRgbppLockArgs, receivers, collector, isMainnet, btcTestnetType, ckbAddress, ckbFeeRate })=>{
    const ckbVirtualTxResult = await (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.genCreateSporeCkbVirtualTx)({
        collector,
        sporeDataList: receivers.map((receiver)=>receiver.sporeData),
        clusterRgbppLockArgs,
        isMainnet,
        ckbFeeRate: BigInt(2000),
        btcTestnetType
    });
    const { ckbRawTx, sumInputsCapacity } = ckbVirtualTxResult;
    const unsignedTx = await (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.buildAppendingIssuerCellToSporesCreateTx)({
        issuerAddress: ckbAddress,
        ckbRawTx,
        collector,
        sumInputsCapacity,
        ckbFeeRate
    });
    return unsignedTx;
};
const prepareCreateSporeUnsignedPsbt = async ({ clusterRgbppLockArgs, receivers, collector, isMainnet, btcTestnetType, fromBtcAccount, fromBtcAccountPubkey, btcDataSource, btcFeeRate })=>{
    const ckbVirtualTxResult = await (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.genCreateSporeCkbVirtualTx)({
        collector,
        sporeDataList: receivers.map((receiver)=>receiver.sporeData),
        clusterRgbppLockArgs,
        isMainnet,
        ckbFeeRate: BigInt(2000),
        btcTestnetType
    });
    const { commitment, ckbRawTx, needPaymasterCell } = ckbVirtualTxResult;
    const btcTos = [
        fromBtcAccount,
        ...receivers.map((receiver)=>receiver.toBtcAddress)
    ];
    const psbt = await (0, __WEBPACK_EXTERNAL_MODULE_rgbpp__.sendRgbppUtxos)({
        ckbVirtualTx: ckbRawTx,
        commitment,
        tos: btcTos,
        needPaymaster: needPaymasterCell,
        ckbCollector: collector,
        from: fromBtcAccount,
        fromPubkey: fromBtcAccountPubkey,
        source: btcDataSource,
        feeRate: btcFeeRate
    });
    return psbt;
};
const fetchAndValidateAssets = async (fromBtcAccount, clusterType, btcService)=>{
    const assets = await btcService.getRgbppAssetsByBtcAddress(fromBtcAccount, {
        type_script: encodeURIComponent(JSON.stringify(clusterType))
    });
    if (0 === assets.length) throw new Error("No assets found for the given BTC address and type script.");
    return assets[0].cellOutput.lock.args;
};
const getRgbppLockArgsList = async ({ xudtType, fromBtcAccount, btcService })=>{
    const type_script = encodeURIComponent(JSON.stringify({
        codeHash: xudtType.codeHash,
        args: xudtType.args,
        hashType: xudtType.hashType
    }));
    console.log(type_script);
    const data = await btcService.getRgbppAssetsByBtcAddress(fromBtcAccount, {
        type_script,
        no_cache: false
    });
    console.log(data);
    const rgbppLockArgsList = data.map((asset)=>asset.cellOutput.lock.args);
    return {
        rgbppLockArgsList
    };
};
const distribute = async ({ rgbppLockArgsList, receivers, xudtType, collector, btcDataSource, btcTestnetType, isMainnet, fromBtcAccount, fromBtcAccountPubkey, wallet, btcService }, btcFeeRate)=>{
    const ckbVirtualTxResult = await (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.genBtcBatchTransferCkbVirtualTx)({
        collector,
        rgbppLockArgsList,
        xudtTypeBytes: (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.serializeScript)(xudtType),
        rgbppReceivers: receivers,
        isMainnet,
        btcTestnetType
    });
    const { commitment, ckbRawTx, needPaymasterCell } = ckbVirtualTxResult;
    const psbt = await (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_btc_ad1ee031__.sendRgbppUtxos)({
        ckbVirtualTx: ckbRawTx,
        commitment,
        tos: receivers.map((receiver)=>receiver.toBtcAddress),
        needPaymaster: needPaymasterCell,
        ckbCollector: collector,
        from: fromBtcAccount,
        fromPubkey: fromBtcAccountPubkey,
        source: btcDataSource,
        feeRate: btcFeeRate
    });
    const { txId: btcTxId } = await signAndSendPsbt(psbt, wallet, btcService);
    console.log(`BTC ${btcTestnetType} TxId: ${btcTxId}`);
    await btcService.sendRgbppCkbTransaction({
        btc_txid: btcTxId,
        ckb_virtual_result: ckbVirtualTxResult
    });
    try {
        const interval = setInterval(async ()=>{
            const { state, failedReason } = await btcService.getRgbppTransactionState(btcTxId);
            console.log("state", state);
            if ("completed" === state || "failed" === state) {
                clearInterval(interval);
                if ("completed" === state) {
                    const { txhash: txHash } = await btcService.getRgbppTransactionHash(btcTxId);
                    console.info(`Rgbpp asset has been transferred on BTC and the related CKB tx hash is ${txHash}`);
                } else console.warn(`Rgbpp CKB transaction failed and the reason is ${failedReason} `);
            }
        }, 30000);
    } catch (error) {
        console.error(error);
        throw error;
    }
    return {
        btcTxId
    };
};
const distributeCombined = async ({ xudtType, receivers, collector, btcDataSource, btcTestnetType, isMainnet, fromBtcAccount, fromBtcAccountPubkey, wallet, filterRgbppArgslist, btcService }, btcFeeRate)=>{
    const lockArgsListResponse = await getRgbppLockArgsList({
        xudtType,
        fromBtcAccount,
        btcService
    });
    const filteredLockArgsList = await filterRgbppArgslist(lockArgsListResponse.rgbppLockArgsList);
    const res = await distribute({
        rgbppLockArgsList: filteredLockArgsList,
        receivers,
        xudtType,
        collector,
        btcDataSource,
        btcTestnetType,
        isMainnet,
        fromBtcAccount,
        fromBtcAccountPubkey,
        wallet,
        btcService
    }, btcFeeRate);
    return res;
};
const prepareDistributeUnsignedPsbt = async ({ receivers, xudtType, collector, btcDataSource, btcTestnetType, isMainnet, fromBtcAccount, fromBtcAccountPubkey, btcFeeRate = 30, btcService, filterRgbppArgslist })=>{
    const lockArgsListResponse = await getRgbppLockArgsList({
        xudtType,
        fromBtcAccount,
        btcService
    });
    const filteredLockArgsList = await filterRgbppArgslist(lockArgsListResponse.rgbppLockArgsList);
    const ckbVirtualTxResult = await (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.genBtcBatchTransferCkbVirtualTx)({
        collector,
        rgbppLockArgsList: filteredLockArgsList,
        xudtTypeBytes: (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.serializeScript)(xudtType),
        rgbppReceivers: receivers,
        isMainnet,
        btcTestnetType
    });
    const { commitment, ckbRawTx, needPaymasterCell } = ckbVirtualTxResult;
    const psbt = await (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_btc_ad1ee031__.sendRgbppUtxos)({
        ckbVirtualTx: ckbRawTx,
        commitment,
        tos: receivers.map((receiver)=>receiver.toBtcAddress),
        needPaymaster: needPaymasterCell,
        ckbCollector: collector,
        from: fromBtcAccount,
        fromPubkey: fromBtcAccountPubkey,
        source: btcDataSource,
        feeRate: btcFeeRate
    });
    return psbt;
};
const leapFromBtcToCKB = async ({ rgbppLockArgsList, toCkbAddress, xudtType, transferAmount, isMainnet, collector, btcTestnetType, fromBtcAccountPubkey, fromBtcAccount, btcDataSource, btcService, wallet }, btcFeeRate)=>{
    const ckbVirtualTxResult = await (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.genBtcJumpCkbVirtualTx)({
        collector,
        rgbppLockArgsList,
        xudtTypeBytes: (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.serializeScript)(xudtType),
        transferAmount,
        toCkbAddress,
        isMainnet,
        btcTestnetType
    });
    const { commitment, ckbRawTx } = ckbVirtualTxResult;
    const psbt = await (0, __WEBPACK_EXTERNAL_MODULE_rgbpp__.sendRgbppUtxos)({
        ckbVirtualTx: ckbRawTx,
        commitment,
        tos: [
            fromBtcAccount
        ],
        ckbCollector: collector,
        from: fromBtcAccount,
        fromPubkey: fromBtcAccountPubkey,
        source: btcDataSource,
        feeRate: btcFeeRate
    });
    const { txId: btcTxId } = await signAndSendPsbt(psbt, wallet, btcService);
    console.log(`BTC ${btcTestnetType} TxId: ${btcTxId}`);
    await btcService.sendRgbppCkbTransaction({
        btc_txid: btcTxId,
        ckb_virtual_result: ckbVirtualTxResult
    });
    try {
        const interval = setInterval(async ()=>{
            const { state, failedReason } = await btcService.getRgbppTransactionState(btcTxId);
            console.log("state", state);
            if ("completed" === state || "failed" === state) {
                clearInterval(interval);
                if ("completed" === state) {
                    const { txhash: txHash } = await btcService.getRgbppTransactionHash(btcTxId);
                    console.info(`Rgbpp asset has been jumped from BTC to CKB and the related CKB tx hash is ${txHash}`);
                } else console.warn(`Rgbpp CKB transaction failed and the reason is ${failedReason} `);
            }
        }, 30000);
    } catch (error) {
        console.error(error);
        throw error;
    }
    return {
        btcTxId
    };
};
const leapFromBtcToCkbCombined = async ({ toCkbAddress, xudtType, transferAmount, collector, btcDataSource, btcTestnetType, isMainnet, fromBtcAccount, fromBtcAccountPubkey, wallet, btcService }, btcFeeRate)=>{
    const lockArgsListResponse = await getRgbppLockArgsList({
        xudtType,
        fromBtcAccount,
        btcService
    });
    const res = await leapFromBtcToCKB({
        rgbppLockArgsList: lockArgsListResponse.rgbppLockArgsList,
        toCkbAddress,
        xudtType,
        transferAmount,
        collector,
        btcDataSource,
        btcTestnetType,
        isMainnet,
        fromBtcAccount,
        fromBtcAccountPubkey,
        wallet,
        btcService
    }, btcFeeRate);
    return res;
};
const prepareLeapUnsignedPsbt = async ({ btcService, toCkbAddress, xudtType, transferAmount, isMainnet, collector, btcTestnetType, fromBtcAccount, fromBtcAccountPubkey, btcDataSource, btcFeeRate = 30 })=>{
    const lockArgsListResponse = await getRgbppLockArgsList({
        xudtType,
        fromBtcAccount,
        btcService
    });
    const ckbVirtualTxResult = await (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.genBtcJumpCkbVirtualTx)({
        collector,
        rgbppLockArgsList: lockArgsListResponse.rgbppLockArgsList,
        xudtTypeBytes: (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.serializeScript)(xudtType),
        transferAmount,
        toCkbAddress,
        isMainnet,
        btcTestnetType
    });
    const { commitment, ckbRawTx } = ckbVirtualTxResult;
    const psbt = await (0, __WEBPACK_EXTERNAL_MODULE_rgbpp__.sendRgbppUtxos)({
        ckbVirtualTx: ckbRawTx,
        commitment,
        tos: [
            fromBtcAccount
        ],
        ckbCollector: collector,
        from: fromBtcAccount,
        fromPubkey: fromBtcAccountPubkey,
        source: btcDataSource,
        feeRate: btcFeeRate
    });
    return psbt;
};
const transferSpore = async ({ sporeRgbppLockArgs, toBtcAddress, sporeType, collector, isMainnet, btcTestnetType, fromBtcAddress, fromBtcAddressPubkey, btcDataSource, btcService, wallet }, btcFeeRate = 30)=>{
    const sporeTypeBytes = (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.serializeScript)(sporeType);
    const ckbVirtualTxResult = await (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.genTransferSporeCkbVirtualTx)({
        collector,
        sporeRgbppLockArgs,
        sporeTypeBytes,
        isMainnet,
        btcTestnetType
    });
    const { commitment, ckbRawTx, needPaymasterCell } = ckbVirtualTxResult;
    const psbt = await (0, __WEBPACK_EXTERNAL_MODULE_rgbpp__.sendRgbppUtxos)({
        ckbVirtualTx: ckbRawTx,
        commitment,
        tos: [
            toBtcAddress
        ],
        needPaymaster: needPaymasterCell,
        ckbCollector: collector,
        from: fromBtcAddress,
        fromPubkey: fromBtcAddressPubkey,
        source: btcDataSource,
        feeRate: btcFeeRate
    });
    const { txId: btcTxId } = await signAndSendPsbt(psbt, wallet, btcService);
    console.log("BTC TxId: ", btcTxId);
    await btcService.sendRgbppCkbTransaction({
        btc_txid: btcTxId,
        ckb_virtual_result: ckbVirtualTxResult
    });
    try {
        const interval = setInterval(async ()=>{
            const { state, failedReason } = await btcService.getRgbppTransactionState(btcTxId);
            console.log("state", state);
            if ("completed" === state || "failed" === state) {
                clearInterval(interval);
                if ("completed" === state) {
                    const { txhash: txHash } = await btcService.getRgbppTransactionHash(btcTxId);
                    console.info(`Rgbpp spore has been transferred on BTC and the related CKB tx hash is ${txHash}`);
                } else console.warn(`Rgbpp CKB transaction failed and the reason is ${failedReason} `);
            }
        }, 30000);
    } catch (error) {
        let processedError;
        processedError = error instanceof Error ? error : new Error(String(error));
        console.error(processedError);
        return {
            error: processedError,
            btcTxId
        };
    }
    return {
        btcTxId
    };
};
const transferSporeCombined = async ({ toBtcAddress, sporeType, collector, isMainnet, btcTestnetType, fromBtcAddress, fromBtcAddressPubkey, btcDataSource, wallet, btcService }, btcFeeRate = 30)=>{
    const sporeRgbppLockArgs = await getSporeRgbppLockArgs({
        fromBtcAddress,
        sporeType,
        isMainnet,
        btcService
    });
    const res = await transferSpore({
        sporeRgbppLockArgs,
        toBtcAddress,
        sporeType,
        collector,
        isMainnet,
        btcTestnetType,
        fromBtcAddress,
        fromBtcAddressPubkey,
        btcDataSource,
        wallet,
        btcService
    }, btcFeeRate);
    return res;
};
const getSporeRgbppLockArgs = async ({ fromBtcAddress, sporeType, isMainnet, btcService })=>{
    const type_script = JSON.stringify(sporeType);
    console.log(type_script);
    try {
        const data = await btcService.getRgbppAssetsByBtcAddress(fromBtcAddress, {
            type_script: encodeURIComponent(type_script),
            no_cache: false
        });
        console.log(data);
        if (0 === data.length) throw new Error("No assets found for the given BTC address and type script.");
        const sporeRgbppLockArgs = data.map((asset)=>asset.cellOutput.lock.args);
        return sporeRgbppLockArgs[0];
    } catch (error) {
        console.error("Error fetching sporeRgbppLockArgs:", error);
        throw error;
    }
};
const prepareTransferSporeUnsignedPsbt = async ({ toBtcAddress, sporeType, collector, isMainnet, btcTestnetType, fromBtcAddress, fromBtcAddressPubkey, btcDataSource, btcService, btcFeeRate = 30 })=>{
    const sporeRgbppLockArgs = await getSporeRgbppLockArgs({
        fromBtcAddress,
        sporeType,
        isMainnet,
        btcService
    });
    const sporeTypeBytes = (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.serializeScript)(sporeType);
    const ckbVirtualTxResult = await (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.genTransferSporeCkbVirtualTx)({
        collector,
        sporeRgbppLockArgs,
        sporeTypeBytes,
        isMainnet,
        btcTestnetType
    });
    const { commitment, ckbRawTx, needPaymasterCell } = ckbVirtualTxResult;
    const psbt = await (0, __WEBPACK_EXTERNAL_MODULE_rgbpp__.sendRgbppUtxos)({
        ckbVirtualTx: ckbRawTx,
        commitment,
        tos: [
            toBtcAddress
        ],
        needPaymaster: needPaymasterCell,
        ckbCollector: collector,
        from: fromBtcAddress,
        fromPubkey: fromBtcAddressPubkey,
        source: btcDataSource,
        feeRate: btcFeeRate
    });
    return psbt;
};
const leapSporeFromBtcToCkb = async ({ sporeRgbppLockArgs, toCkbAddress, sporeType, collector, isMainnet, btcTestnetType, fromBtcAddress, fromBtcAddressPubkey, btcDataSource, wallet, btcService }, btcFeeRate = 30)=>{
    const sporeTypeBytes = (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.serializeScript)(sporeType);
    const ckbVirtualTxResult = await (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.genLeapSporeFromBtcToCkbVirtualTx)({
        collector,
        sporeRgbppLockArgs,
        sporeTypeBytes,
        toCkbAddress,
        isMainnet,
        btcTestnetType
    });
    const { commitment, ckbRawTx, needPaymasterCell } = ckbVirtualTxResult;
    const psbt = await (0, __WEBPACK_EXTERNAL_MODULE_rgbpp__.sendRgbppUtxos)({
        ckbVirtualTx: ckbRawTx,
        commitment,
        tos: [
            fromBtcAddress
        ],
        needPaymaster: needPaymasterCell,
        ckbCollector: collector,
        from: fromBtcAddress,
        fromPubkey: fromBtcAddressPubkey,
        source: btcDataSource,
        feeRate: btcFeeRate
    });
    const { txId: btcTxId } = await signAndSendPsbt(psbt, wallet, btcService);
    console.log("BTC TxId: ", btcTxId);
    await btcService.sendRgbppCkbTransaction({
        btc_txid: btcTxId,
        ckb_virtual_result: ckbVirtualTxResult
    });
    try {
        const interval = setInterval(async ()=>{
            const { state, failedReason } = await btcService.getRgbppTransactionState(btcTxId);
            console.log("state", state);
            if ("completed" === state || "failed" === state) {
                clearInterval(interval);
                if ("completed" === state) {
                    const { txhash: txHash } = await btcService.getRgbppTransactionHash(btcTxId);
                    console.info(`Rgbpp spore has been leaped from BTC to CKB and the related CKB tx hash is ${txHash}`);
                } else console.warn(`Rgbpp CKB transaction failed and the reason is ${failedReason} `);
            }
        }, 30000);
    } catch (error) {
        console.error(error);
        throw error;
    }
    return {
        btcTxId
    };
};
const leapSporeFromBtcToCkbCombined = async ({ toCkbAddress, sporeType, collector, isMainnet, btcTestnetType, fromBtcAddress, fromBtcAddressPubkey, btcDataSource, wallet, btcService }, btcFeeRate = 30)=>{
    const sporeRgbppLockArgs = await getSporeRgbppLockArgs({
        fromBtcAddress,
        sporeType,
        isMainnet,
        btcService
    });
    const res = await leapSporeFromBtcToCkb({
        sporeRgbppLockArgs,
        toCkbAddress,
        sporeType,
        collector,
        isMainnet,
        btcTestnetType,
        fromBtcAddress,
        fromBtcAddressPubkey,
        btcDataSource,
        wallet,
        btcService
    }, btcFeeRate);
    return res;
};
const prepareLeapSporeUnsignedPsbt = async ({ toCkbAddress, sporeType, collector, isMainnet, btcTestnetType, fromBtcAddress, fromBtcAddressPubkey, btcDataSource, btcFeeRate = 30, btcService })=>{
    const sporeRgbppLockArgs = await getSporeRgbppLockArgs({
        fromBtcAddress,
        sporeType,
        isMainnet,
        btcService
    });
    const sporeTypeBytes = (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.serializeScript)(sporeType);
    const ckbVirtualTxResult = await (0, __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_ckb_022d8c34__.genLeapSporeFromBtcToCkbVirtualTx)({
        collector,
        sporeRgbppLockArgs,
        sporeTypeBytes,
        toCkbAddress,
        isMainnet,
        btcTestnetType
    });
    const { commitment, ckbRawTx, needPaymasterCell } = ckbVirtualTxResult;
    const psbt = await (0, __WEBPACK_EXTERNAL_MODULE_rgbpp__.sendRgbppUtxos)({
        ckbVirtualTx: ckbRawTx,
        commitment,
        tos: [
            fromBtcAddress
        ],
        needPaymaster: needPaymasterCell,
        ckbCollector: collector,
        from: fromBtcAddress,
        fromPubkey: fromBtcAddressPubkey,
        source: btcDataSource,
        feeRate: btcFeeRate
    });
    return psbt;
};
const transfer = async ({ rgbppLockArgsList, toBtcAddress, xudtType, transferAmount, collector, btcDataSource, btcTestnetType, isMainnet, fromBtcAccount, fromBtcAccountPubkey, wallet, btcService }, btcFeeRate)=>{
    const { ckbVirtualTxResult, btcPsbtHex } = await (0, __WEBPACK_EXTERNAL_MODULE_rgbpp__.buildRgbppTransferTx)({
        ckb: {
            collector,
            xudtTypeArgs: xudtType.args,
            rgbppLockArgsList,
            transferAmount
        },
        btc: {
            fromAddress: fromBtcAccount,
            toAddress: toBtcAddress,
            fromPubkey: fromBtcAccountPubkey,
            dataSource: btcDataSource,
            testnetType: btcTestnetType,
            feeRate: btcFeeRate
        },
        isMainnet
    });
    console.log(btcPsbtHex);
    const psbt = __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_btc_ad1ee031__.bitcoin.Psbt.fromHex(btcPsbtHex);
    const { txId: btcTxId } = await signAndSendPsbt(psbt, wallet, btcService);
    console.log(`BTC ${btcTestnetType} TxId: ${btcTxId}`);
    await btcService.sendRgbppCkbTransaction({
        btc_txid: btcTxId,
        ckb_virtual_result: ckbVirtualTxResult
    });
    try {
        const interval = setInterval(async ()=>{
            const { state, failedReason } = await btcService.getRgbppTransactionState(btcTxId);
            console.log("state", state);
            if ("completed" === state || "failed" === state) {
                clearInterval(interval);
                if ("completed" === state) {
                    const { txhash: txHash } = await btcService.getRgbppTransactionHash(btcTxId);
                    console.info(`Rgbpp asset has been transferred on BTC and the related CKB tx hash is ${txHash}`);
                } else console.warn(`Rgbpp CKB transaction failed and the reason is ${failedReason} `);
            }
        }, 30000);
    } catch (error) {
        console.error(error);
        throw error;
    }
    return {
        btcTxId
    };
};
const transferCombined = async ({ toBtcAddress, xudtType, transferAmount, collector, btcDataSource, btcTestnetType, isMainnet, fromBtcAccount, fromBtcAccountPubkey, wallet, btcService }, btcFeeRate)=>{
    const lockArgsListResponse = await getRgbppLockArgsList({
        xudtType,
        fromBtcAccount,
        btcService
    });
    const res = await transfer({
        rgbppLockArgsList: lockArgsListResponse.rgbppLockArgsList,
        toBtcAddress,
        xudtType,
        transferAmount,
        collector,
        btcDataSource,
        btcTestnetType,
        isMainnet,
        fromBtcAccount,
        fromBtcAccountPubkey,
        wallet,
        btcService
    }, btcFeeRate);
    return res;
};
const prepareTransferUnsignedPsbt = async ({ btcService, toBtcAddress, xudtType, transferAmount, collector, btcDataSource, btcTestnetType, isMainnet, fromBtcAccount, fromBtcAccountPubkey, btcFeeRate = 30 })=>{
    const lockArgsListResponse = await getRgbppLockArgsList({
        xudtType,
        fromBtcAccount,
        btcService
    });
    const { btcPsbtHex } = await (0, __WEBPACK_EXTERNAL_MODULE_rgbpp__.buildRgbppTransferTx)({
        ckb: {
            collector,
            xudtTypeArgs: xudtType.args,
            rgbppLockArgsList: lockArgsListResponse.rgbppLockArgsList,
            transferAmount
        },
        btc: {
            fromAddress: fromBtcAccount,
            toAddress: toBtcAddress,
            fromPubkey: fromBtcAccountPubkey,
            dataSource: btcDataSource,
            testnetType: btcTestnetType,
            feeRate: btcFeeRate
        },
        isMainnet
    });
    const psbt = __WEBPACK_EXTERNAL_MODULE__rgbpp_sdk_btc_ad1ee031__.bitcoin.Psbt.fromHex(btcPsbtHex);
    return psbt;
};
export { BtcHelper, CkbHelper, RgbppSDK, convertToTransaction, createBtcService, createBurnXudtTransaction, createClusterCombined, createIssueXudtTransaction, createMergeXudtTransaction, createSporesCombined, createTransferXudtTransaction, distributeCombined, fetchAndFilterUtxos, fetchAndValidateAssets, launchCombined, leapFromBtcToCkbCombined, leapFromCkbToBtcTransaction, leapSporeFromBtcToCkbCombined, leapSporeFromCkbToBtcTransaction, prepareClusterCellTransaction, prepareCreateClusterUnsignedPsbt, prepareCreateSporeUnsignedPsbt, prepareCreateSporeUnsignedTransaction, prepareDistributeUnsignedPsbt, prepareLaunchCellTransaction, prepareLauncherUnsignedPsbt, prepareLeapSporeUnsignedPsbt, prepareLeapUnsignedPsbt, prepareTransferSporeUnsignedPsbt, prepareTransferUnsignedPsbt, transferCombined, transferSporeCombined };
