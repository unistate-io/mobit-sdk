"use strict";
// The require scope
var __webpack_require__ = {};
/************************************************************************/ // webpack/runtime/define_property_getters
(()=>{
    __webpack_require__.d = function(exports1, definition) {
        for(var key in definition)if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports1, key)) Object.defineProperty(exports1, key, {
            enumerable: true,
            get: definition[key]
        });
    };
})();
// webpack/runtime/has_own_property
(()=>{
    __webpack_require__.o = function(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    };
})();
// webpack/runtime/make_namespace_object
(()=>{
    // define __esModule on exports
    __webpack_require__.r = function(exports1) {
        if ('undefined' != typeof Symbol && Symbol.toStringTag) Object.defineProperty(exports1, Symbol.toStringTag, {
            value: 'Module'
        });
        Object.defineProperty(exports1, '__esModule', {
            value: true
        });
    };
})();
/************************************************************************/ var __webpack_exports__ = {};
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);
// EXPORTS
__webpack_require__.d(__webpack_exports__, {
    leapFromBtcToCkbCombined: ()=>/* reexport */ leapFromBtcToCkbCombined,
    transferSporeCombined: ()=>/* reexport */ transferSporeCombined,
    prepareDistributeUnsignedPsbt: ()=>/* reexport */ prepareDistributeUnsignedPsbt,
    prepareClusterCellTransaction: ()=>/* reexport */ prepareClusterCellTransaction,
    fetchAndFilterUtxos: ()=>/* reexport */ fetchAndFilterUtxos,
    prepareCreateClusterUnsignedPsbt: ()=>/* reexport */ prepareCreateClusterUnsignedPsbt,
    CkbHelper: ()=>/* reexport */ CkbHelper,
    createClusterCombined: ()=>/* reexport */ createClusterCombined,
    fetchAndValidateAssets: ()=>/* reexport */ fetchAndValidateAssets,
    createBtcService: ()=>/* reexport */ createBtcService,
    prepareLeapSporeUnsignedPsbt: ()=>/* reexport */ prepareLeapSporeUnsignedPsbt,
    transferCombined: ()=>/* reexport */ transferCombined,
    BtcHelper: ()=>/* reexport */ BtcHelper,
    distributeCombined: ()=>/* reexport */ distributeCombined,
    launchCombined: ()=>/* reexport */ launchCombined,
    createSporesCombined: ()=>/* reexport */ createSporesCombined,
    prepareTransferUnsignedPsbt: ()=>/* reexport */ prepareTransferUnsignedPsbt,
    leapFromCkbToBtcTransaction: ()=>/* reexport */ leapFromCkbToBtcTransaction,
    prepareCreateSporeUnsignedPsbt: ()=>/* reexport */ prepareCreateSporeUnsignedPsbt,
    leapSporeFromCkbToBtcTransaction: ()=>/* reexport */ leapSporeFromCkbToBtcTransaction,
    prepareLaunchCellTransaction: ()=>/* reexport */ prepareLaunchCellTransaction,
    createTransferXudtTransaction: ()=>/* reexport */ createTransferXudtTransaction,
    prepareCreateSporeUnsignedTransaction: ()=>/* reexport */ prepareCreateSporeUnsignedTransaction,
    createBurnXudtTransaction: ()=>/* reexport */ createBurnXudtTransaction,
    prepareLauncherUnsignedPsbt: ()=>/* reexport */ prepareLauncherUnsignedPsbt,
    createIssueXudtTransaction: ()=>/* reexport */ createIssueXudtTransaction,
    prepareTransferSporeUnsignedPsbt: ()=>/* reexport */ prepareTransferSporeUnsignedPsbt,
    convertToTransaction: ()=>/* reexport */ convertToTransaction,
    RgbppSDK: ()=>/* reexport */ RgbppSDK,
    prepareLeapUnsignedPsbt: ()=>/* reexport */ prepareLeapUnsignedPsbt,
    createMergeXudtTransaction: ()=>/* reexport */ createMergeXudtTransaction,
    leapSporeFromBtcToCkbCombined: ()=>/* reexport */ leapSporeFromBtcToCkbCombined
});
const helper_namespaceObject = require("@ckb-lumos/common-scripts/lib/helper");
const config_namespaceObject = require("@ckb-lumos/lumos/config");
const ckb_sdk_utils_namespaceObject = require("@nervosnetwork/ckb-sdk-utils");
const ckb_namespaceObject = require("@rgbpp-sdk/ckb");
const external_rgbpp_namespaceObject = require("rgbpp");
/**
 * CkbHelper class provides utility methods for interacting with the CKB (Nervos Network) blockchain.
 */ class CkbHelper {
    /**
   * The collector instance used for collecting data from the CKB blockchain.
   */ collector;
    /**
   * A boolean indicating whether the helper is interacting with the mainnet.
   */ isMainnet;
    /**
   * Constructs a new CkbHelper instance.
   * @param {boolean} isMainnet - A boolean indicating whether the helper is interacting with the mainnet or testnet.
   */ constructor(isMainnet){
        this.isMainnet = isMainnet;
        if (isMainnet) this.collector = new ckb_namespaceObject.Collector({
            ckbNodeUrl: "https://mainnet.ckbapp.dev",
            ckbIndexerUrl: "https://mainnet.ckbapp.dev/indexer"
        });
        else this.collector = new ckb_namespaceObject.Collector({
            ckbNodeUrl: "https://testnet.ckbapp.dev",
            ckbIndexerUrl: "https://testnet.ckb.dev"
        });
    }
}
/**
 * Creates a BTC service instance.
 * @param {BTCTestnetType} btcTestnetType - The type of BTC testnet.
 * @returns {BtcAssetsApi} A BtcAssetsApi instance.
 */ const createBtcService = (btcTestnetType)=>{
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
    return external_rgbpp_namespaceObject.BtcAssetsApi.fromToken(btcServiceUrl, btcServiceToken, btcServiceOrigin);
};
/**
 * BtcHelper class provides utility methods for interacting with the Bitcoin network, including managing data sources and services.
 */ class BtcHelper {
    /**
   * The data source used for interacting with the Bitcoin network.
   */ btcDataSource;
    /**
   * Optional parameter specifying the type of Bitcoin testnet.
   */ btcTestnetType;
    /**
   * The service used for managing Bitcoin assets.
   */ btcService;
    /**
   * The wallet instance used for signing transactions.
   */ wallet;
    /**
   * The type of network the helper is interacting with.
   */ networkType;
    /**
   * Constructs a new BtcHelper instance.
   * @param {AbstractWallet} wallet - An instance of a wallet that implements the AbstractWallet interface.
   * @param {NetworkType} networkType - The type of network (e.g., Mainnet, Testnet) the helper will interact with.
   * @param {BTCTestnetType} btcTestnetType - Optional parameter specifying the type of Bitcoin testnet (e.g., Signet, Testnet3).
   */ constructor(wallet, networkType, btcTestnetType){
        this.btcTestnetType = btcTestnetType;
        this.networkType = networkType;
        this.btcService = createBtcService(btcTestnetType);
        this.btcDataSource = new external_rgbpp_namespaceObject.DataSource(this.btcService, networkType);
        this.wallet = wallet;
    }
}
/**
 * Fetches indexer cells for given addresses.
 * @param {Object} params - The parameters object.
 * @param {string[]} params.ckbAddresses - The list of CKB addresses.
 * @param {Collector} params.collector - The collector instance.
 * @param {CKBComponents.Script} [params.type] - Optional type script.
 * @returns {Promise<IndexerCell[]>} A promise that resolves to an array of IndexerCell.
 */ async function getIndexerCells({ ckbAddresses, type, collector }) {
    const fromLocks = ckbAddresses.map(ckb_sdk_utils_namespaceObject.addressToScript);
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
/**
 * Gets cell dependencies for given addresses.
 * @param {boolean} isMainnet - Whether the network is mainnet.
 * @param {string[]} ckbAddresses - The list of CKB addresses.
 * @returns {Promise<CKBComponents.CellDep[]>} A promise that resolves to an array of CellDep.
 */ async function getAddressCellDeps(isMainnet, ckbAddresses) {
    let config;
    config = isMainnet ? config_namespaceObject.MAINNET : config_namespaceObject.TESTNET;
    const scripts = config.SCRIPTS;
    const cellDeps = [];
    const isOmnilock = ckbAddresses.some((address)=>(0, helper_namespaceObject.isOmnilockAddress)(address, config));
    const isAcp = ckbAddresses.some((address)=>(0, helper_namespaceObject.isAcpAddress)(address, config));
    const isSecp = ckbAddresses.some((address)=>(0, helper_namespaceObject.isSecp256k1Blake160Address)(address, config));
    const isSecpMult = ckbAddresses.some((address)=>(0, helper_namespaceObject.isSecp256k1Blake160MultisigAddress)(address, config));
    if (isOmnilock) {
        const omnilock = scripts.OMNILOCK;
        if (!omnilock) throw new Error("OMNILOCK script configuration is missing.");
        cellDeps.push({
            outPoint: {
                txHash: omnilock.TX_HASH,
                index: omnilock.INDEX
            },
            depType: omnilock.DEP_TYPE
        });
    }
    if (isAcp) {
        const acp = scripts.ANYONE_CAN_PAY;
        if (!acp) throw new Error("ANYONE_CAN_PAY script configuration is missing.");
        cellDeps.push({
            outPoint: {
                txHash: acp.TX_HASH,
                index: acp.INDEX
            },
            depType: acp.DEP_TYPE
        });
    }
    if (isSecp) {
        const secp = scripts.SECP256K1_BLAKE160;
        if (!secp) throw new Error("SECP256K1_BLAKE160 script configuration is missing.");
        cellDeps.push({
            outPoint: {
                txHash: secp.TX_HASH,
                index: secp.INDEX
            },
            depType: secp.DEP_TYPE
        });
    }
    if (isSecpMult) {
        const secpMult = scripts.SECP256K1_BLAKE160_MULTISIG;
        if (!secpMult) throw new Error("SECP256K1_BLAKE160_MULTISIG script configuration is missing.");
        cellDeps.push({
            outPoint: {
                txHash: secpMult.TX_HASH,
                index: secpMult.INDEX
            },
            depType: secpMult.DEP_TYPE
        });
    }
    return cellDeps;
}
const core_namespaceObject = require("@apollo/client/core");
const cache_namespaceObject = require("@apollo/client/cache");
const batch_http_namespaceObject = require("@apollo/client/link/batch-http");
// Mapping for MintStatus, used for validation
const MintStatusMap = {
    [0]: 0,
    [1]: 1,
    [2]: 2
};
// GraphQL query constants
const ASSET_DETAILS_QUERY = (0, core_namespaceObject.gql)`
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
const RAW_INSCRIPTION_INFO_QUERY = (0, core_namespaceObject.gql)`
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
/**
 * RgbppSDK class for interacting with RGBPP services and GraphQL endpoints.
 */ class RgbppSDK {
    /**
   * The BTC assets service used for fetching BTC-related data.
   */ service;
    /**
   * ApolloClient instance for making GraphQL queries.
   */ client;
    /**
   * Indicates whether the SDK is operating on the mainnet.
   */ isMainnet;
    /**
   * Constructs an instance of RgbppSDK.
   * @param {boolean} isMainnet - Whether the network is mainnet.
   * @param {BTCTestnetType} [btcTestnetType] - The type of BTC testnet.
   */ constructor(isMainnet, btcTestnetType){
        this.isMainnet = isMainnet;
        this.service = createBtcService(btcTestnetType);
        const graphqlEndpoint = isMainnet ? "https://ckb-graph.unistate.io/v1/graphql" : "https://unistate-ckb-test.unistate.io/v1/graphql";
        this.client = new core_namespaceObject.ApolloClient({
            cache: new cache_namespaceObject.InMemoryCache(),
            link: new batch_http_namespaceObject.BatchHttpLink({
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
    /**
   * Fetches transaction details.
   * @param {string} btcAddress - The BTC address.
   * @param {string} [afterTxId] - Optional, used for pagination.
   * @returns {Promise<BtcApiTransaction[]>} An array of transaction details.
   */ async fetchTxsDetails(btcAddress, afterTxId) {
        try {
            return await this.service.getBtcTransactions(btcAddress, {
                after_txid: afterTxId
            });
        } catch (error) {
            console.error("Error fetching transactions:", error);
            throw error;
        }
    }
    /**
   * Fetches assets and query details.
   * @param {string} btcAddress - The BTC address.
   * @returns {Promise<QueryResult>} The query result, including balance and asset details.
   */ async fetchAssetsAndQueryDetails(btcAddress) {
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
    /**
   * Gets the XUDT hash.
   * @param {string} script_args - The script arguments.
   * @returns {string} The XUDT hash.
   */ xudtHash(script_args) {
        return this.removeHexPrefix((0, ckb_sdk_utils_namespaceObject.scriptToHash)({
            ...(0, ckb_namespaceObject.getXudtTypeScript)(this.isMainnet),
            args: this.formatHexPrefix(script_args)
        }));
    }
    /**
   * Formats the hexadecimal prefix.
   * @param {string} hexString - The hexadecimal string.
   * @returns {string} The formatted string.
   */ formatHexPrefix(hexString) {
        return `\\x${hexString.replace(/^0x/, "")}`;
    }
    /**
   * Removes the hexadecimal prefix.
   * @param {string} prefixedHexString - The prefixed hexadecimal string.
   * @returns {string} The string without the prefix.
   */ removeHexPrefix(prefixedHexString) {
        return `0x${prefixedHexString.replace(/^\\x/, "")}`;
    }
    /**
   * Queries the raw inscription information.
   * @param {string} udtHash - The UDT hash.
   * @returns {Promise<RawInscriptionInfo[]>} An array of raw inscription information.
   */ async queryRawInscriptionInfo(udtHash) {
        const { data } = await this.client.query({
            query: RAW_INSCRIPTION_INFO_QUERY,
            variables: {
                udtHash
            }
        });
        return data.token_info;
    }
    /**
   * Queries the asset details.
   * @param {OutPoint} outPoint - The outpoint.
   * @returns {Promise<GraphQLResponse>} The GraphQL response.
   */ async queryAssetDetails(outPoint) {
        const { data } = await this.client.query({
            query: ASSET_DETAILS_QUERY,
            variables: {
                txHash: this.formatHexPrefix(outPoint.txHash),
                txIndex: Number(outPoint.index)
            }
        });
        return data;
    }
    /**
   * Processes the XUDT cell.
   * @param {XudtCell} cell - The XUDT cell.
   * @returns {Promise<ProcessedXudtCell>} The processed XUDT cell.
   */ async processXudtCell(cell) {
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
                script_args: cell.addressByTypeId.script_args
            }
        };
    }
    /**
   * Validates the mint status.
   * @param {number} status - The status value.
   * @returns {MintStatus} The validated MintStatus.
   */ validateMintStatus(status) {
        const validStatus = MintStatusMap[status];
        if (void 0 === validStatus) throw new Error(`Invalid MintStatus: ${status}`);
        return validStatus;
    }
}
/**
 * Creates an unsigned transaction for burning xUDT assets.
 *
 * This function constructs a transaction that burns a specified amount of xUDT tokens from a given CKB address.
 * It fetches the necessary cells, collects inputs, and constructs the transaction outputs accordingly.
 *
 * @param {CreateBurnXudtTransactionParams} params - The parameters for creating the burn transaction.
 * @param {string} params.xudtArgs - The xUDT type script args, which is the unique identifier for the xUDT token type.
 * @param {bigint} params.burnAmount - The amount of xUDT asset to be burned, representing the quantity of tokens that will be destroyed.
 * @param {string} params.ckbAddress - The CKB address for the transaction, from which the tokens will be burned.
 * @param {Collector} params.collector - The collector instance used to fetch cells and collect inputs, responsible for gathering the necessary cells to construct the transaction.
 * @param {boolean} params.isMainnet - A boolean indicating whether the network is mainnet or testnet, affecting the type script and cell dependencies.
 * @returns {Promise<CKBComponents.RawTransactionToSign>} - An unsigned transaction object that can be signed and submitted to the network.
 */ async function createBurnXudtTransaction({ xudtArgs, burnAmount, ckbAddress, collector, isMainnet }) {
    const xudtType = {
        ...(0, ckb_namespaceObject.getXudtTypeScript)(isMainnet),
        args: xudtArgs
    };
    const fromLock = (0, ckb_sdk_utils_namespaceObject.addressToScript)(ckbAddress);
    const xudtCells = await collector.getCells({
        lock: fromLock,
        type: xudtType
    });
    console.debug("Fetched xudt cells:", xudtCells);
    if (!xudtCells || 0 === xudtCells.length) throw new ckb_namespaceObject.NoXudtLiveCellError("The address has no xudt cells");
    const { inputs: udtInputs, sumInputsCapacity, sumAmount } = collector.collectUdtInputs({
        liveCells: xudtCells,
        needAmount: burnAmount
    });
    let inputs = udtInputs;
    console.debug("Collected inputs:", inputs);
    console.debug("Sum of inputs capacity:", sumInputsCapacity);
    console.debug("Sum of amount:", sumAmount);
    if (sumAmount < burnAmount) throw new Error("Not enough xUDT tokens to burn");
    const outputs = [];
    const outputsData = [];
    let sumXudtOutputCapacity = BigInt(0);
    if (sumAmount > burnAmount) {
        const xudtChangeCapacity = (0, ckb_namespaceObject.calculateUdtCellCapacity)(fromLock);
        outputs.push({
            lock: fromLock,
            type: xudtType,
            capacity: (0, ckb_namespaceObject.append0x)(xudtChangeCapacity.toString(16))
        });
        outputsData.push((0, ckb_namespaceObject.append0x)((0, ckb_namespaceObject.u128ToLe)(sumAmount - burnAmount)));
        console.debug("XUDT change capacity:", xudtChangeCapacity);
        console.debug("Updated outputs:", outputs);
        console.debug("Updated outputs data:", outputsData);
    }
    const cellDeps = [
        ...await getAddressCellDeps(isMainnet, [
            ckbAddress
        ]),
        ...await (0, ckb_namespaceObject.fetchTypeIdCellDeps)(isMainnet, {
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
/**
 * Creates an unsigned transaction for issuing xUDT assets with a unique cell as the token info cell.
 *
 * @param {CreateIssueXudtTransactionParams} params - An object containing the parameters for the transaction.
 * @param {bigint} params.xudtTotalAmount - The total amount of xUDT asset to be issued.
 * @param {RgbppTokenInfo} params.tokenInfo - The xUDT token information including decimal, name, and symbol.
 * @param {string} params.ckbAddress - The CKB address for the transaction.
 * @param {Collector} params.collector - The collector instance used to fetch cells and collect inputs.
 * @param {boolean} params.isMainnet - A boolean indicating whether the network is mainnet or testnet.
 *
 * @returns {Promise<CKBComponents.RawTransactionToSign>} A promise that resolves to an unsigned transaction object.
 */ async function createIssueXudtTransaction({ xudtTotalAmount, tokenInfo, ckbAddress, collector, isMainnet }) {
    const issueLock = (0, ckb_sdk_utils_namespaceObject.addressToScript)(ckbAddress);
    // Fetching empty cells and adding debug information
    let emptyCells = await collector.getCells({
        lock: issueLock
    });
    console.debug("Fetched empty cells:", emptyCells);
    if (!emptyCells || 0 === emptyCells.length) throw new ckb_namespaceObject.NoLiveCellError("The address has no empty cells");
    // Filtering cells without a type and adding debug information
    emptyCells = emptyCells.filter((cell)=>!cell.output.type);
    console.debug("Filtered empty cells without a type:", emptyCells);
    // Calculate the capacity required for the xUDT cell and add debug information
    const xudtCapacity = (0, ckb_namespaceObject.calculateUdtCellCapacity)(issueLock);
    console.debug("Calculated xUDT cell capacity:", xudtCapacity);
    // Calculate the capacity required for the xUDT token info cell and add debug information
    const xudtInfoCapacity = (0, ckb_namespaceObject.calculateXudtTokenInfoCellCapacity)(tokenInfo, issueLock);
    console.debug("Calculated xUDT token info cell capacity:", xudtInfoCapacity);
    // Collect inputs for the transaction and add debug information
    const { inputs, sumInputsCapacity } = collector.collectInputs(emptyCells, xudtCapacity + xudtInfoCapacity, BigInt(0), {
        minCapacity: ckb_namespaceObject.MIN_CAPACITY
    });
    console.debug("Collected inputs:", inputs);
    console.debug("Sum of inputs capacity:", sumInputsCapacity);
    // Define the xUDT type script and add debug information
    const xudtType = {
        ...(0, ckb_namespaceObject.getXudtTypeScript)(isMainnet),
        args: (0, ckb_namespaceObject.append0x)((0, ckb_sdk_utils_namespaceObject.scriptToHash)(issueLock))
    };
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
            capacity: (0, ckb_namespaceObject.append0x)(xudtCapacity.toString(16))
        },
        {
            lock: issueLock,
            type: {
                ...(0, ckb_namespaceObject.getUniqueTypeScript)(isMainnet),
                args: (0, ckb_namespaceObject.generateUniqueTypeArgs)(inputs[0], 1)
            },
            capacity: (0, ckb_namespaceObject.append0x)(xudtInfoCapacity.toString(16))
        },
        {
            lock: issueLock,
            capacity: (0, ckb_namespaceObject.append0x)(changeCapacity.toString(16))
        }
    ];
    console.debug("Defined outputs:", outputs);
    // Calculate the total amount and add debug information
    const totalAmount = xudtTotalAmount * BigInt(10 ** tokenInfo.decimal);
    console.debug("Calculated total amount:", totalAmount);
    // Define the outputs data and add debug information
    const outputsData = [
        (0, ckb_namespaceObject.append0x)((0, ckb_namespaceObject.u128ToLe)(totalAmount)),
        (0, ckb_namespaceObject.encodeRgbppTokenInfo)(tokenInfo),
        "0x"
    ];
    console.debug("Defined outputs data:", outputsData);
    // Define the cell dependencies and add debug information
    const cellDeps = [
        ...await getAddressCellDeps(isMainnet, [
            ckbAddress
        ]),
        ...await (0, ckb_namespaceObject.fetchTypeIdCellDeps)(isMainnet, {
            xudt: true,
            unique: true
        })
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
        witnesses: []
    };
    console.debug("Defined unsigned transaction:", unsignedTx);
    return unsignedTx;
}
/**
 * Leap from CKB to BTC
 *
 * This function facilitates the transfer of assets from the CKB (Nervos Network) blockchain to the BTC (Bitcoin) blockchain.
 * It constructs the necessary arguments and transactions to move the specified amount of assets, identified by their type arguments,
 * from a CKB address to a BTC transaction. The function also handles the signing and sending of the transaction.
 *
 * @param {LeapToBtcTransactionParams} params - The parameters required for the leap operation.
 * @param {number} params.outIndex - The output index in the BTC transaction.
 * @param {string} params.btcTxId - The transaction ID of the BTC transaction.
 * @param {string} params.xudtTypeArgs - The type arguments for the XUDT (User Defined Token) on CKB.
 * @param {bigint} params.transferAmount - The amount of assets to transfer.
 * @param {boolean} params.isMainnet - Indicates whether the operation is on the mainnet.
 * @param {Collector} params.collector - The collector instance used for collecting cells.
 * @param {string} params.ckbAddress - The CKB address from which the assets are being transferred.
 * @param {BTCTestnetType} [params.btcTestnetType] - The type of BTC testnet, if applicable.
 *
 * @returns {Promise<CKBComponents.RawTransactionToSign>} - The unsigned raw transaction to sign.
 */ const leapFromCkbToBtcTransaction = async ({ outIndex, btcTxId, xudtTypeArgs, transferAmount, isMainnet, collector, ckbAddress, btcTestnetType })=>{
    const toRgbppLockArgs = (0, ckb_namespaceObject.buildRgbppLockArgs)(outIndex, btcTxId);
    const xudtType = {
        ...(0, ckb_namespaceObject.getXudtTypeScript)(isMainnet),
        args: xudtTypeArgs
    };
    const ckbRawTx = await (0, ckb_namespaceObject.genCkbJumpBtcVirtualTx)({
        collector,
        fromCkbAddress: ckbAddress,
        toRgbppLockArgs,
        xudtTypeBytes: (0, ckb_namespaceObject.serializeScript)(xudtType),
        transferAmount,
        btcTestnetType,
        ckbFeeRate: BigInt(0),
        witnessLockPlaceholderSize: 0
    });
    const unsignedTx = {
        ...ckbRawTx,
        cellDeps: [
            ...ckbRawTx.cellDeps,
            ...await getAddressCellDeps(isMainnet, [
                ckbAddress
            ])
        ],
        witnesses: []
    };
    return unsignedTx;
};
/**
 * Leap a spore from CKB to BTC.
 *
 * @param {LeapSporeToBtcTransactionParams} params - The parameters for leaping a spore from CKB to BTC.
 * @param {number} params.outIndex - The output index of the spore.
 * @param {string} params.btcTxId - The transaction ID of the BTC transaction.
 * @param {string} params.sporeTypeArgs - The type arguments for the spore.
 * @param {boolean} params.isMainnet - A flag indicating whether the operation is on the mainnet.
 * @param {Collector} params.collector - The collector instance.
 * @param {string} params.ckbAddress - The CKB address.
 * @param {BTCTestnetType} [params.btcTestnetType] - (Optional) The type of BTC testnet.
 * @returns {Promise<CKBComponents.RawTransactionToSign>} A promise that resolves to the unsigned raw transaction to sign.
 */ const leapSporeFromCkbToBtcTransaction = async ({ outIndex, btcTxId, sporeTypeArgs, isMainnet, collector, ckbAddress, btcTestnetType })=>{
    const toRgbppLockArgs = (0, ckb_namespaceObject.buildRgbppLockArgs)(outIndex, btcTxId);
    const sporeType = {
        ...(0, ckb_namespaceObject.getSporeTypeScript)(isMainnet),
        args: sporeTypeArgs
    };
    const ckbRawTx = await (0, ckb_namespaceObject.genLeapSporeFromCkbToBtcRawTx)({
        collector,
        fromCkbAddress: ckbAddress,
        toRgbppLockArgs,
        sporeTypeBytes: (0, ckb_namespaceObject.serializeScript)(sporeType),
        isMainnet,
        btcTestnetType,
        ckbFeeRate: BigInt(0),
        witnessLockPlaceholderSize: 0
    });
    const unsignedTx = {
        ...ckbRawTx,
        cellDeps: [
            ...ckbRawTx.cellDeps,
            ...await getAddressCellDeps(isMainnet, [
                ckbAddress
            ])
        ],
        witnesses: []
    };
    return unsignedTx;
};
/**
 * Merges multiple xUDT cells into a single xUDT cell and returns the remaining capacity as a separate cell.
 * @param {CreateMergeXudtTransactionParams} params - The parameters object.
 * @param {string} params.xudtArgs - The xUDT type script args.
 * @param {string[]} params.ckbAddresses - The CKB addresses involved in the transaction.
 * @param {Collector} params.collector - The collector instance used to fetch cells and collect inputs.
 * @param {boolean} params.isMainnet - A boolean indicating whether the transaction is for the mainnet or testnet.
 * @param {string} [ckbAddress=params.ckbAddresses[0]] - The address for the output cell, defaulting to the first address in the input address set.
 * @returns {Promise<CKBComponents.RawTransactionToSign>} An unsigned transaction object.
 */ async function createMergeXudtTransaction({ xudtArgs, ckbAddresses, collector, isMainnet }, ckbAddress = ckbAddresses[0]) {
    const fromLock = (0, ckb_sdk_utils_namespaceObject.addressToScript)(ckbAddress);
    const xudtType = {
        ...(0, ckb_namespaceObject.getXudtTypeScript)(isMainnet),
        args: xudtArgs
    };
    const xudtCells = await getIndexerCells({
        ckbAddresses,
        type: xudtType,
        collector
    });
    console.debug("Fetched xudt cells:", xudtCells);
    if (!xudtCells || 0 === xudtCells.length) throw new ckb_namespaceObject.NoXudtLiveCellError("The addresses have no xudt cells");
    if (1 === xudtCells.length) throw new Error("Only one xudt cell found, no need to merge");
    const { inputs: udtInputs, sumInputsCapacity, sumAmount } = collectAllUdtInputs(xudtCells);
    const inputs = udtInputs;
    console.debug("Collected inputs:", inputs);
    console.debug("Sum of inputs capacity:", sumInputsCapacity);
    console.debug("Sum of amount:", sumAmount);
    const mergedXudtCapacity = (0, ckb_namespaceObject.calculateUdtCellCapacity)(fromLock);
    const outputs = [
        {
            lock: fromLock,
            type: xudtType,
            capacity: (0, ckb_namespaceObject.append0x)(mergedXudtCapacity.toString(16))
        }
    ];
    const outputsData = [
        (0, ckb_namespaceObject.append0x)((0, ckb_namespaceObject.u128ToLe)(sumAmount))
    ];
    const cellDeps = [
        ...await getAddressCellDeps(isMainnet, ckbAddresses),
        ...await (0, ckb_namespaceObject.fetchTypeIdCellDeps)(isMainnet, {
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
    for (const cell of liveCells){
        if ("0x" !== cell.outputData) {
            inputs.push({
                previousOutput: {
                    txHash: cell.outPoint.txHash,
                    index: cell.outPoint.index
                },
                since: "0x0"
            });
            sumInputsCapacity += BigInt(cell.output.capacity);
            // XUDT cell.data = <amount: uint128> <xudt data (optional)>
            // Ref: https://blog.cryptape.com/enhance-sudts-programmability-with-xudt#heading-xudt-cell
            sumAmount += (0, ckb_namespaceObject.leToU128)((0, ckb_namespaceObject.remove0x)(cell.outputData).slice(0, 32));
        }
    }
    return {
        inputs,
        sumInputsCapacity,
        sumAmount
    };
}
/**
 * Creates an unsigned transaction for transferring xUDT assets. This function can also be used to mint xUDT assets.
 *
 * @param {CreateTransferXudtTransactionParams} params - The parameters for creating the transaction.
 * @param {string} params.xudtArgs - The xUDT type script args.
 * @param {Array<{ toAddress: string, transferAmount: bigint }>} params.receivers - An array of receiver objects containing `toAddress` and `transferAmount`.
 * @param {Array<string>} params.ckbAddresses - The CKB addresses for the transaction.
 * @param {Collector} params.collector - The collector instance used to fetch cells and collect inputs.
 * @param {boolean} params.isMainnet - A boolean indicating whether the network is mainnet or testnet.
 * @param {string} [ckbAddress=params.ckbAddresses[0]] - The address for the output cell, defaulting to the first address in the input address set.
 *
 * @returns {Promise<CKBComponents.RawTransactionToSign>} A promise that resolves to an unsigned transaction object.
 *
 * @throws {NoXudtLiveCellError} If the address has no xudt cells.
 * @throws {NoLiveCellError} If the address has no empty cells.
 */ async function createTransferXudtTransaction({ xudtArgs, receivers, ckbAddresses, collector, isMainnet }, ckbAddress = ckbAddresses[0]) {
    const xudtType = {
        ...(0, ckb_namespaceObject.getXudtTypeScript)(isMainnet),
        args: xudtArgs
    };
    const xudtCells = await getIndexerCells({
        ckbAddresses,
        type: xudtType,
        collector
    });
    console.debug("Fetched xudt cells:", xudtCells);
    if (!xudtCells || 0 === xudtCells.length) throw new ckb_namespaceObject.NoXudtLiveCellError("The addresses have no xudt cells");
    const sumTransferAmount = receivers.map((receiver)=>receiver.transferAmount).reduce((prev, current)=>prev + current, BigInt(0));
    console.debug("Sum Transfer Amount:", sumTransferAmount);
    let sumXudtOutputCapacity = receivers.map(({ toAddress })=>(0, ckb_namespaceObject.calculateUdtCellCapacity)((0, ckb_sdk_utils_namespaceObject.addressToScript)(toAddress))).reduce((prev, current)=>prev + current, BigInt(0));
    console.debug("Sum XUDT Output Capacity:", sumXudtOutputCapacity);
    const { inputs: udtInputs, sumInputsCapacity: sumXudtInputsCapacity, sumAmount } = collector.collectUdtInputs({
        liveCells: xudtCells,
        needAmount: sumTransferAmount
    });
    console.debug("Sum XUDT Inputs Capacity:", sumXudtInputsCapacity);
    console.debug("Sum Amount:", sumAmount);
    let inputs = udtInputs;
    const outputs = receivers.map(({ toAddress })=>({
            lock: (0, ckb_sdk_utils_namespaceObject.addressToScript)(toAddress),
            type: xudtType,
            capacity: (0, ckb_namespaceObject.append0x)((0, ckb_namespaceObject.calculateUdtCellCapacity)((0, ckb_sdk_utils_namespaceObject.addressToScript)(toAddress)).toString(16))
        }));
    const outputsData = receivers.map(({ transferAmount })=>(0, ckb_namespaceObject.append0x)((0, ckb_namespaceObject.u128ToLe)(transferAmount)));
    console.debug("Outputs:", outputs);
    console.debug("Outputs Data:", outputsData);
    if (sumAmount > sumTransferAmount) {
        const xudtChangeCapacity = (0, ckb_namespaceObject.calculateUdtCellCapacity)((0, ckb_sdk_utils_namespaceObject.addressToScript)(ckbAddress));
        outputs.push({
            lock: (0, ckb_sdk_utils_namespaceObject.addressToScript)(ckbAddress),
            type: xudtType,
            capacity: (0, ckb_namespaceObject.append0x)(xudtChangeCapacity.toString(16))
        });
        outputsData.push((0, ckb_namespaceObject.append0x)((0, ckb_namespaceObject.u128ToLe)(sumAmount - sumTransferAmount)));
        sumXudtOutputCapacity += xudtChangeCapacity;
        console.debug("XUDT Change Capacity:", xudtChangeCapacity);
        console.debug("Updated Outputs:", outputs);
        console.debug("Updated Outputs Data:", outputsData);
    }
    const cellDeps = [
        ...await getAddressCellDeps(isMainnet, ckbAddresses),
        ...await (0, ckb_namespaceObject.fetchTypeIdCellDeps)(isMainnet, {
            xudt: true
        })
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
const external_ckb_ccc_core_namespaceObject = require("@ckb-ccc/core");
/**
 * Converts a CKBComponents.RawTransactionToSign to a CKBComponents.RawTransaction.
 * @param {CKBComponents.RawTransactionToSign} rawTransactionToSign - The raw transaction to sign to convert.
 * @returns {CKBComponents.RawTransaction} The converted raw transaction.
 */ function convertToRawTransaction(rawTransactionToSign) {
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
    const bytes = external_ckb_ccc_core_namespaceObject.ccc.WitnessArgs.from(witnessArgs).toBytes();
    return Buffer.from(bytes).toString("hex");
}
/**
 * Converts a CKBComponents.OutPoint to a ccc.OutPointLike.
 * @param {CKBComponents.OutPoint} outPoint - The out point to convert.
 * @returns {ccc.OutPointLike} The converted out point.
 */ function convertToOutPointLike(outPoint) {
    return {
        txHash: (0, external_ckb_ccc_core_namespaceObject.hexFrom)(outPoint.txHash),
        index: (0, external_ckb_ccc_core_namespaceObject.hexFrom)(outPoint.index)
    };
}
/**
 * Converts a CKBComponents.CellDep to a ccc.CellDepLike.
 * @param {CKBComponents.CellDep} cellDep - The cell dep to convert.
 * @returns {ccc.CellDepLike} The converted cell dep.
 */ function convertToCellDepLike(cellDep) {
    if (!cellDep.outPoint) throw new Error("CellDep is missing required field: outPoint");
    return {
        outPoint: convertToOutPointLike(cellDep.outPoint),
        depType: cellDep.depType
    };
}
/**
 * Converts a CKBComponents.CellInput to a ccc.CellInputLike.
 * @param {CKBComponents.CellInput} cellInput - The cell input to convert.
 * @returns {ccc.CellInputLike} The converted cell input.
 */ function convertToCellInputLike(cellInput) {
    if (!cellInput.previousOutput) throw new Error("CellInput is missing required field: previousOutput");
    return {
        previousOutput: convertToOutPointLike(cellInput.previousOutput),
        since: cellInput.since ? (0, external_ckb_ccc_core_namespaceObject.hexFrom)(cellInput.since) : void 0
    };
}
function ConvertToTransactionLike(rawTransaction) {
    return {
        version: rawTransaction.version,
        cellDeps: rawTransaction.cellDeps.map(convertToCellDepLike),
        headerDeps: rawTransaction.headerDeps.map(external_ckb_ccc_core_namespaceObject.hexFrom),
        inputs: rawTransaction.inputs.map(convertToCellInputLike),
        outputs: rawTransaction.outputs.map((output)=>({
                capacity: output.capacity,
                lock: {
                    args: (0, external_ckb_ccc_core_namespaceObject.hexFrom)(output.lock.args),
                    codeHash: (0, external_ckb_ccc_core_namespaceObject.hexFrom)(output.lock.codeHash),
                    hashType: output.lock.hashType
                },
                type: output.type ? {
                    args: (0, external_ckb_ccc_core_namespaceObject.hexFrom)(output.type.args),
                    codeHash: (0, external_ckb_ccc_core_namespaceObject.hexFrom)(output.type.codeHash),
                    hashType: output.type.hashType
                } : null
            })),
        outputsData: rawTransaction.outputsData.map(external_ckb_ccc_core_namespaceObject.hexFrom),
        witnesses: rawTransaction.witnesses.map(external_ckb_ccc_core_namespaceObject.hexFrom)
    };
}
/**
 * Converts a CKBComponents.RawTransactionToSign to a ccc.Transaction.
 * @param {CKBComponents.RawTransactionToSign} rawTransactionToSign - The raw transaction to sign to convert.
 * @returns {ccc.Transaction} The converted transaction object.
 */ function convertToTransaction(rawTransactionToSign) {
    const rawTransaction = convertToRawTransaction(rawTransactionToSign);
    const transactionLike = ConvertToTransactionLike(rawTransaction);
    const tx = external_ckb_ccc_core_namespaceObject.ccc.Transaction.from(transactionLike);
    return tx;
}
const btc_namespaceObject = require("@rgbpp-sdk/btc");
async function signAndSendPsbt(psbt, wallet, service) {
    console.debug("Starting PSBT signing process...");
    console.debug("PSBT before signing:", psbt.toHex());
    try {
        console.debug("test");
        const signPbst = btc_namespaceObject.bitcoin.Psbt.fromHex(await wallet.signPsbt(psbt.toHex()));
        console.debug("PSBT after signing:", signPbst.toBase64());
        const tx = signPbst.extractTransaction();
        const txHex = tx.toHex();
        console.debug("Extracted transaction hex:", txHex);
        console.debug("Sending transaction to service...");
        const { txid } = await service.sendBtcTransaction(txHex);
        console.debug("Transaction sent successfully. TXID:", txid);
        const rawTxHex = (0, btc_namespaceObject.transactionToHex)(tx, false);
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
    const masterLock = (0, ckb_sdk_utils_namespaceObject.addressToScript)(ckbAddress);
    console.log("ckb address: ", ckbAddress);
    // The capacity required to launch cells is determined by the token info cell capacity, and transaction fee.
    const launchCellCapacity = (0, ckb_namespaceObject.calculateRgbppCellCapacity)() + (0, ckb_namespaceObject.calculateRgbppTokenInfoCellCapacity)(rgbppTokenInfo, isMainnet);
    let emptyCells = await collector.getCells({
        lock: masterLock
    });
    if (!emptyCells || 0 === emptyCells.length) throw new ckb_namespaceObject.NoLiveCellError("The address has no empty cells");
    emptyCells = emptyCells.filter((cell)=>!cell.output.type);
    const { inputs } = collector.collectInputs(emptyCells, launchCellCapacity, BigInt(0));
    const outputs = [
        {
            lock: (0, ckb_namespaceObject.genRgbppLockScript)((0, ckb_namespaceObject.buildRgbppLockArgs)(outIndex, btcTxId), isMainnet, btcTestnetType),
            capacity: (0, ckb_namespaceObject.append0x)(launchCellCapacity.toString(16))
        }
    ];
    const outputsData = [
        "0x",
        "0x"
    ];
    const cellDeps = [
        ...await getAddressCellDeps(isMainnet, [
            ckbAddress
        ])
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
    return unsignedTx;
};
const launchRgbppAsset = async ({ ownerRgbppLockArgs, rgbppTokenInfo, collector, isMainnet, btcTestnetType, btcAccount, btcDataSource, btcAccountPubkey, launchAmount, btcService, wallet }, btcFeeRate)=>{
    const ckbVirtualTxResult = await (0, ckb_namespaceObject.genRgbppLaunchCkbVirtualTx)({
        collector: collector,
        ownerRgbppLockArgs,
        rgbppTokenInfo,
        launchAmount,
        isMainnet: isMainnet,
        btcTestnetType: btcTestnetType
    });
    const { commitment, ckbRawTx, needPaymasterCell } = ckbVirtualTxResult;
    console.log("RGB++ Asset type script args: ", ckbRawTx.outputs[0].type?.args);
    // Send BTC tx
    const psbt = await (0, btc_namespaceObject.sendRgbppUtxos)({
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
            // Update CKB transaction with the real BTC txId
            const newCkbRawTx = (0, ckb_namespaceObject.updateCkbTxWithRealBtcTxId)({
                ckbRawTx,
                btcTxId,
                isMainnet
            });
            const ckbTx = await (0, ckb_namespaceObject.appendCkbTxWitnesses)({
                ckbRawTx: newCkbRawTx,
                btcTxBytes,
                rgbppApiSpvProof
            });
            const txHash = await (0, ckb_namespaceObject.sendCkbTx)({
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
/**
 * Launches an RGB++ asset by preparing a launch cell and subsequently sending a BTC transaction.
 *
 * @param params - An object containing the necessary parameters for launching the RGB++ asset.
 * @param {RgbppTokenInfo} params.rgbppTokenInfo - Information about the RGB++ token to be launched.
 * @param {Collector} params.collector - The collector instance used to gather cells.
 * @param {boolean} params.isMainnet - A boolean indicating whether the operation is on the mainnet.
 * @param {BTCTestnetType} [params.btcTestnetType] - (Optional) The type of BTC testnet to use.
 * @param {string} params.btcAccount - The BTC account address.
 * @param {string} [params.btcAccountPubkey] - The public key of the BTC account.
 * @param {DataSource} params.btcDataSource - The data source for BTC transactions.
 * @param {bigint} params.launchAmount - The amount of the asset to be launched, represented as a bigint.
 * @param {BtcAssetsApi} params.btcService - The service instance for interacting with BTC assets.
 * @param {string} params.ckbAddress - The CKB address where the asset will be launched.
 * @param {ccc.Signer} params.cccSigner - The signer instance for CKB transactions.
 * @param {(utxos: BtcApiUtxo[]) => Promise<{ outIndex: number; btcTxId: string }>} params.filterUtxo - A function to filter UTXOs for the BTC transaction.
 * @param {AbstractWallet} params.wallet - Wallet instance used for signing BTC transactions.
 * @param {bigint} [ckbFeeRate] - (Optional) The fee rate for CKB transactions, represented as a bigint.
 * @param {number} [btcFeeRate] - (Optional) The fee rate for BTC transactions, represented as a number.
 *
 * @returns A promise that resolves to the transaction result, including the BTC transaction ID and CKB transaction hash.
 */ const launchCombined = async ({ rgbppTokenInfo, collector, isMainnet, btcTestnetType, btcAccount, btcDataSource, btcAccountPubkey, launchAmount, ckbAddress, filterUtxo, btcService, wallet, cccSigner }, ckbFeeRate, btcFeeRate)=>{
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
    const ownerRgbppLockArgs = (0, ckb_namespaceObject.buildRgbppLockArgs)(outIndex, btcTxId);
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
/**
 * Prepares a launch cell on the CKB network by creating a transaction.
 *
 * @param {PrepareLaunchCellTransactionParams} params - Parameters required to prepare the launch cell.
 * @param {string} params.ckbAddress - CKB address where the launch cell will be created.
 * @param {RgbppTokenInfo} params.rgbppTokenInfo - Information about the RGB++ token to be launched.
 * @param {Collector} params.collector - Collector instance used to gather cells for the transaction.
 * @param {boolean} params.isMainnet - Indicates whether the operation is on the mainnet.
 * @param {BTCTestnetType} [params.btcTestnetType] - Type of BTC testnet (optional).
 * @param {number} params.outIndex - Output index of the BTC transaction.
 * @param {string} params.btcTxId - ID of the BTC transaction.
 * @returns {Promise<CKBComponents.RawTransactionToSign>} - Promise that resolves to the prepared CKB transaction.
 *
 * --------------------------------------------
 * **Note: Example of fetching and filtering UTXOs:**
 * ```typescript
 * const { outIndex, btcTxId } = await fetchAndFilterUtxos(
 *   btcAccount,
 *   filterUtxo,
 *   btcService,
 * );
 * ```
 * This example demonstrates how to obtain the necessary parameters (`outIndex` and `btcTxId`) by fetching and filtering UTXOs.
 */ const prepareLaunchCellTransaction = async ({ ckbAddress, rgbppTokenInfo, collector, isMainnet, btcTestnetType, outIndex, btcTxId })=>{
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
/**
 * Generates an unsigned PSBT for launching an RGB++ asset.
 *
 * @param {PrepareLauncherUnsignedPsbtParams} params - Parameters required for generating the unsigned PSBT.
 * @param {RgbppTokenInfo} params.rgbppTokenInfo - Details about the RGB++ token to be launched.
 * @param {Collector} params.collector - Instance used to collect cells for the transaction.
 * @param {boolean} params.isMainnet - Indicates if the operation is on the mainnet.
 * @param {BTCTestnetType} [params.btcTestnetType] - (Optional) Type of BTC testnet to use.
 * @param {string} params.btcAccount - Address of the BTC account.
 * @param {string} [params.btcAccountPubkey] - Public key of the BTC account.
 * @param {DataSource} params.btcDataSource - Source for BTC transaction data.
 * @param {bigint} params.launchAmount - Amount of the asset to be launched, as a bigint.
 * @param {number} params.outIndex - Output index of the BTC transaction.
 * @param {string} params.btcTxId - ID of the BTC transaction.
 * @param {number} [btcFeeRate] - (Optional) Fee rate for BTC transactions, as a number.
 *
 * @returns {Promise<bitcoin.Psbt>} A promise resolving to the unsigned PSBT.
 *
 * --------------------------------------------
 * **Note: Example of fetching and filtering UTXOs:**
 * ```typescript
 * const { outIndex, btcTxId } = await fetchAndFilterUtxos(
 *   btcAccount,
 *   filterUtxo,
 *   btcService,
 * );
 * ```
 * This example demonstrates how to obtain the necessary parameters (`outIndex` and `btcTxId`) by fetching and filtering UTXOs.
 */ const prepareLauncherUnsignedPsbt = async ({ rgbppTokenInfo, collector, isMainnet, btcTestnetType, btcAccount, btcDataSource, btcAccountPubkey, launchAmount, outIndex, btcTxId }, btcFeeRate)=>{
    const ownerRgbppLockArgs = (0, ckb_namespaceObject.buildRgbppLockArgs)(outIndex, btcTxId);
    const ckbVirtualTxResult = await (0, ckb_namespaceObject.genRgbppLaunchCkbVirtualTx)({
        collector: collector,
        ownerRgbppLockArgs,
        rgbppTokenInfo,
        launchAmount,
        isMainnet: isMainnet,
        btcTestnetType: btcTestnetType
    });
    const { commitment, ckbRawTx, needPaymasterCell } = ckbVirtualTxResult;
    console.log("RGB++ Asset type script args: ", ckbRawTx.outputs[0].type?.args);
    // Generate unsigned PSBT
    const psbt = await (0, btc_namespaceObject.sendRgbppUtxos)({
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
/**
 * Fetches the necessary UTXOs and filters them to get the output index and BTC transaction ID.
 *
 * @param {string} btcAccount - The BTC account address.
 * @param {Function} filterUtxo - The function used to filter UTXOs.
 * @param {BtcAssetsApi} btcService - The service instance for interacting with BTC assets.
 * @returns {Promise<{ outIndex: number, btcTxId: string }>} - A promise that resolves to an object containing the output index and BTC transaction ID.
 */ const fetchAndFilterUtxos = async (btcAccount, filterUtxo, btcService)=>{
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
    const masterLock = (0, ckb_sdk_utils_namespaceObject.addressToScript)(ckbAddress);
    console.log("ckb address: ", ckbAddress);
    // The capacity required to launch cells is determined by the token info cell capacity, and transaction fee.
    const clusterCellCapacity = (0, ckb_namespaceObject.calculateRgbppClusterCellCapacity)(clusterData);
    let emptyCells = await collector.getCells({
        lock: masterLock
    });
    if (!emptyCells || 0 === emptyCells.length) throw new ckb_namespaceObject.NoLiveCellError("The address has no empty cells");
    emptyCells = emptyCells.filter((cell)=>!cell.output.type);
    const { inputs } = collector.collectInputs(emptyCells, clusterCellCapacity, BigInt(0));
    const outputs = [
        {
            lock: (0, ckb_namespaceObject.genRgbppLockScript)((0, ckb_namespaceObject.buildRgbppLockArgs)(outIndex, btcTxId), isMainnet, btcTestnetType),
            capacity: (0, ckb_namespaceObject.append0x)(clusterCellCapacity.toString(16))
        }
    ];
    const outputsData = [
        "0x"
    ];
    const cellDeps = [
        ...await getAddressCellDeps(isMainnet, [
            ckbAddress
        ])
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
    return unsignedTx;
};
const createCluster = async ({ ownerRgbppLockArgs, collector, clusterData, isMainnet, btcTestnetType, fromBtcAccount, fromBtcAccountPubkey, btcDataSource, btcService, wallet }, btcFeeRate = 30)=>{
    const ckbVirtualTxResult = await (0, ckb_namespaceObject.genCreateClusterCkbVirtualTx)({
        collector,
        rgbppLockArgs: ownerRgbppLockArgs,
        clusterData,
        isMainnet,
        ckbFeeRate: BigInt(2000),
        btcTestnetType
    });
    const { commitment, ckbRawTx, clusterId, needPaymasterCell } = ckbVirtualTxResult;
    console.log("clusterId: ", clusterId);
    // Send BTC tx
    const psbt = await (0, external_rgbpp_namespaceObject.sendRgbppUtxos)({
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
            // Update CKB transaction with the real BTC txId
            const newCkbRawTx = (0, ckb_namespaceObject.updateCkbTxWithRealBtcTxId)({
                ckbRawTx,
                btcTxId,
                isMainnet
            });
            console.log("The cluster rgbpp lock args: ", newCkbRawTx.outputs[0].lock.args);
            const ckbTx = await (0, ckb_namespaceObject.appendCkbTxWitnesses)({
                ckbRawTx: newCkbRawTx,
                btcTxBytes,
                rgbppApiSpvProof
            });
            // Replace cobuild witness with the final rgbpp lock script
            ckbTx.witnesses[ckbTx.witnesses.length - 1] = (0, ckb_namespaceObject.generateClusterCreateCoBuild)(ckbTx.outputs[0], ckbTx.outputsData[0]);
            console.log(JSON.stringify(ckbTx));
            const txHash = await (0, ckb_namespaceObject.sendCkbTx)({
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
/**
 * Creates a cluster cell on the CKB network and initiates a corresponding BTC transaction.
 *
 * @param {createClusterCombinedParams} params - Parameters required to create the cluster.
 * @param {string} params.ckbAddress - CKB address where the cluster cell will be created.
 * @param {RawClusterData} params.clusterData - Raw data required to create the cluster.
 * @param {Collector} params.collector - Collector instance used to gather cells for the transaction.
 * @param {boolean} params.isMainnet - Indicates whether the operation is on the mainnet.
 * @param {BTCTestnetType} [params.btcTestnetType] - Type of BTC testnet (optional).
 * @param {string} params.fromBtcAccount - BTC account from which the transaction will be initiated.
 * @param {string} [params.fromBtcAccountPubkey] - Public key of the BTC account.
 * @param {DataSource} params.btcDataSource - Data source for BTC transactions.
 * @param {AbstractWallet} params.wallet - Wallet instance used for signing BTC transactions.
 * @param {BtcAssetsApi} params.btcService - BTC service instance for interacting with BTC assets.
 * @param {(utxos: BtcApiUtxo[]) => Promise<{ outIndex: number; btcTxId: string }>} params.filterUtxo - Function to filter UTXOs for the BTC transaction.
 * @param {ccc.Signer} params.cccSigner - Signer instance for signing CKB transactions.
 * @param {bigint} [ckbFeeRate] - Fee rate for the CKB transaction (optional).
 * @param {number} [btcFeeRate=30] - Fee rate for the BTC transaction (default is 30).
 * @returns {Promise<TxResult>} - Promise that resolves to the transaction result.
 */ const createClusterCombined = async ({ ckbAddress, clusterData, collector, isMainnet, btcTestnetType, fromBtcAccount, fromBtcAccountPubkey, btcDataSource, wallet, btcService, filterUtxo, cccSigner }, ckbFeeRate, btcFeeRate = 30)=>{
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
    const ownerRgbppLockArgs = (0, ckb_namespaceObject.buildRgbppLockArgs)(outIndex, btcTxId);
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
/**
 * Prepares a cluster cell on the CKB network by creating a transaction.
 *
 * @param {PrepareClusterCellTransactionParams} params - Parameters required to prepare the cluster cell.
 * @param {string} params.ckbAddress - CKB address where the cluster cell will be created.
 * @param {RawClusterData} params.clusterData - Raw data required to create the cluster.
 * @param {Collector} params.collector - Collector instance used to gather cells for the transaction.
 * @param {boolean} params.isMainnet - Indicates whether the operation is on the mainnet.
 * @param {BTCTestnetType} [params.btcTestnetType] - Type of BTC testnet (optional).
 * @param {number} params.outIndex - Output index of the BTC transaction.
 * @param {string} params.btcTxId - ID of the BTC transaction.
 * @returns {Promise<CKBComponents.RawTransactionToSign>} - Promise that resolves to the prepared CKB transaction.
 * --------------------------------------------
 * **Note: Example of fetching and filtering UTXOs:**
 * ```typescript
 * const { outIndex, btcTxId } = await fetchAndFilterUtxos(
 *   btcAccount,
 *   filterUtxo,
 *   btcService,
 * );
 * ```
 * This example demonstrates how to obtain the necessary parameters (`outIndex` and `btcTxId`) by fetching and filtering UTXOs.
 */ const prepareClusterCellTransaction = async ({ ckbAddress, clusterData, collector, isMainnet, btcTestnetType, outIndex, btcTxId })=>{
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
/**
 * Generates an unsigned PSBT (Partially Signed Bitcoin Transaction) for creating a cluster.
 * This function is used to estimate transaction fees before finalizing the transaction.
 *
 * @param {PrepareCreateClusterUnsignedPsbtParams} params - Parameters required to generate the unsigned PSBT.
 * @param {Collector} params.collector - Collector instance used to gather cells for the transaction.
 * @param {RawClusterData} params.clusterData - Raw data required to create the cluster.
 * @param {boolean} params.isMainnet - Indicates whether the operation is on the mainnet.
 * @param {BTCTestnetType} [params.btcTestnetType] - Type of BTC testnet (optional).
 * @param {string} params.fromBtcAccount - BTC account from which the transaction will be initiated.
 * @param {string} [params.fromBtcAccountPubkey] - Public key of the BTC account.
 * @param {DataSource} params.btcDataSource - Data source for BTC transactions.
 * @param {number} params.outIndex - Output index of the BTC transaction.
 * @param {string} params.btcTxId - ID of the BTC transaction.
 * @param {number} [params.btcFeeRate] - Fee rate for the BTC transaction (optional, default is 30).
 * @returns {Promise<bitcoin.Psbt>} - Promise that resolves to the unsigned PSBT in base64 format.
 * --------------------------------------------
 * **Note: Example of fetching and filtering UTXOs:**
 * ```typescript
 * const { outIndex, btcTxId } = await fetchAndFilterUtxos(
 *   btcAccount,
 *   filterUtxo,
 *   btcService,
 * );
 * ```
 * This example demonstrates how to obtain the necessary parameters (`outIndex` and `btcTxId`) by fetching and filtering UTXOs.
 */ const prepareCreateClusterUnsignedPsbt = async ({ collector, clusterData, isMainnet, btcTestnetType, fromBtcAccount, fromBtcAccountPubkey, btcDataSource, outIndex, btcTxId, btcFeeRate = 30 })=>{
    const ckbVirtualTxResult = await (0, ckb_namespaceObject.genCreateClusterCkbVirtualTx)({
        collector,
        rgbppLockArgs: (0, ckb_namespaceObject.buildRgbppLockArgs)(outIndex, btcTxId),
        clusterData,
        isMainnet,
        ckbFeeRate: BigInt(2000),
        btcTestnetType
    });
    const { commitment, ckbRawTx, needPaymasterCell } = ckbVirtualTxResult;
    // Generate unsigned PSBT
    const psbt = await (0, external_rgbpp_namespaceObject.sendRgbppUtxos)({
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
// Warning: Before running this file for the first time, please run 2-prepare-cluster.ts
const createSpores = async ({ clusterRgbppLockArgs, receivers, collector, isMainnet, btcTestnetType, fromBtcAccount, fromBtcAccountPubkey, btcDataSource, wallet, btcService, ckbAddress, cccSigner }, btcFeeRate = 120, ckbFeeRate)=>{
    const ckbVirtualTxResult = await (0, ckb_namespaceObject.genCreateSporeCkbVirtualTx)({
        collector,
        sporeDataList: receivers.map((receiver)=>receiver.sporeData),
        clusterRgbppLockArgs,
        isMainnet,
        ckbFeeRate: BigInt(2000),
        btcTestnetType
    });
    const { commitment, ckbRawTx, sumInputsCapacity, clusterCell, needPaymasterCell } = ckbVirtualTxResult;
    // Send BTC tx
    // The first btc address is the owner of the cluster cell and the rest btc addresses are spore receivers
    const btcTos = [
        fromBtcAccount,
        ...receivers.map((receiver)=>receiver.toBtcAddress)
    ];
    const psbt = await (0, external_rgbpp_namespaceObject.sendRgbppUtxos)({
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
            // Update CKB transaction with the real BTC txId
            const newCkbRawTx = (0, ckb_namespaceObject.updateCkbTxWithRealBtcTxId)({
                ckbRawTx,
                btcTxId,
                isMainnet
            });
            console.log("The new cluster rgbpp lock args: ", newCkbRawTx.outputs[0].lock.args);
            const ckbTx = await (0, ckb_namespaceObject.appendCkbTxWitnesses)({
                ckbRawTx: newCkbRawTx,
                btcTxBytes,
                rgbppApiSpvProof
            });
            // The outputs[1..] are spore cells from which you can find spore type scripts,
            // and the spore type scripts will be used to transfer and leap spores
            console.log("Spore type scripts: ", JSON.stringify(ckbTx.outputs.slice(1).map((output)=>output.type)));
            // Replace cobuild witness with the final rgbpp lock script
            ckbTx.witnesses[ckbTx.witnesses.length - 1] = (0, ckb_namespaceObject.generateSporeCreateCoBuild)({
                // The first output is cluster cell and the rest of the outputs are spore cells
                sporeOutputs: ckbTx.outputs.slice(1),
                sporeOutputsData: ckbTx.outputsData.slice(1),
                clusterCell,
                clusterOutputCell: ckbTx.outputs[0]
            });
            // console.log('ckbTx: ', JSON.stringify(ckbTx));
            const unsignedTx = convertToTransaction(await (0, ckb_namespaceObject.buildAppendingIssuerCellToSporesCreateTx)({
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
/**
 * Creates spores combined with the given parameters.
 *
 * @param {SporeCreateCombinedParams} params - The parameters for creating spores.
 * @param {string} params.clusterTypeScriptArgs - The arguments for the cluster type script.
 * @param {Array<{ toBtcAddress: string, sporeData: RawSporeData }>} params.receivers - The list of receivers with their BTC addresses and spore data.
 * @param {Collector} params.collector - The collector instance.
 * @param {boolean} params.isMainnet - Indicates if the operation is on mainnet.
 * @param {BTCTestnetType} [params.btcTestnetType] - The type of BTC testnet (optional).
 * @param {string} params.fromBtcAccount - The BTC account from which the spores are being created.
 * @param {string} [params.fromBtcAccountPubkey] - The public key of the BTC account.
 * @param {DataSource} params.btcDataSource - The data source for BTC.
 * @param {AbstractWallet} params.wallet - Wallet instance used for signing BTC transactions.
 * @param {string} params.ckbAddress - The CKB address.
 * @param {BtcAssetsApi} params.btcService - The BTC assets API service.
 * @param {ccc.Signer} params.cccSigner - The CCC signer instance.
 * @param {number} [btcFeeRate=120] - The fee rate for BTC transactions (default is 120).
 * @returns {Promise<TxResult>} - The result of the transaction.
 */ const createSporesCombined = async ({ clusterTypeScriptArgs, receivers, collector, isMainnet, btcTestnetType, fromBtcAccount, fromBtcAccountPubkey, btcDataSource, wallet, btcService, ckbAddress, cccSigner }, btcFeeRate = 120, ckbFeeRate)=>{
    const clusterRgbppLockArgs = await fetchAndValidateAssets(fromBtcAccount, clusterTypeScriptArgs, isMainnet, btcService);
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
/**
 * Prepares an unsigned CKB transaction for creating spores.
 *
 * @param {PrepareCreateSporeUnsignedTransactionParams} params - The parameters for preparing the unsigned CKB transaction.
 * @param {Hex} params.clusterRgbppLockArgs - The arguments for the cluster RGBPP lock.
 * @param {Array<{ toBtcAddress: string, sporeData: RawSporeData }>} params.receivers - The list of receivers with their BTC addresses and spore data.
 * @param {Collector} params.collector - The collector instance.
 * @param {boolean} params.isMainnet - Indicates if the operation is on mainnet.
 * @param {BTCTestnetType} [params.btcTestnetType] - The type of BTC testnet (optional).
 * @param {string} params.ckbAddress - The CKB address.
 * @param {bigint} [params.ckbFeeRate] - The fee rate for CKB transactions (optional).
 * @param {number} [params.witnessLockPlaceholderSize] - The size of the witness lock placeholder (optional). This parameter is used to estimate the transaction size when the witness lock placeholder size is known.
 * @returns {Promise<CKBComponents.RawTransactionToSign>} - The unsigned CKB transaction.
 * --------------------------------------------------------------------------------
 * Note: This example demonstrates how to fetch the corresponding parameters using the `fetchAndValidateAssets` function.
 * Example:
 * ```typescript
 * const clusterRgbppLockArgs = await fetchAndValidateAssets(
 *   fromBtcAccount,
 *   clusterTypeScriptArgs,
 *   isMainnet,
 *   btcService,
 * );
 * ```
 */ const prepareCreateSporeUnsignedTransaction = async ({ clusterRgbppLockArgs, receivers, collector, isMainnet, btcTestnetType, ckbAddress, ckbFeeRate })=>{
    const ckbVirtualTxResult = await (0, ckb_namespaceObject.genCreateSporeCkbVirtualTx)({
        collector,
        sporeDataList: receivers.map((receiver)=>receiver.sporeData),
        clusterRgbppLockArgs,
        isMainnet,
        ckbFeeRate: BigInt(2000),
        btcTestnetType
    });
    const { ckbRawTx, sumInputsCapacity } = ckbVirtualTxResult;
    const unsignedTx = await (0, ckb_namespaceObject.buildAppendingIssuerCellToSporesCreateTx)({
        issuerAddress: ckbAddress,
        ckbRawTx,
        collector,
        sumInputsCapacity,
        ckbFeeRate
    });
    return unsignedTx;
};
/**
 * Prepares an unsigned BTC transaction for creating spores.
 *
 * @param {PrepareCreateSporeUnsignedPsbtParams} params - The parameters for preparing the unsigned BTC transaction.
 * @param {Hex} params.clusterRgbppLockArgs - The arguments for the cluster RGBPP lock.
 * @param {Array<{ toBtcAddress: string, sporeData: RawSporeData }>} params.receivers - The list of receivers with their BTC addresses and spore data.
 * @param {Collector} params.collector - The collector instance.
 * @param {boolean} params.isMainnet - Indicates if the operation is on mainnet.
 * @param {BTCTestnetType} [params.btcTestnetType] - The type of BTC testnet (optional).
 * @param {string} params.fromBtcAccount - The BTC account from which the spores are being created.
 * @param {string} [params.fromBtcAccountPubkey] - The public key of the BTC account.
 * @param {DataSource} params.btcDataSource - The data source for BTC.
 * @param {number} [params.btcFeeRate] - The fee rate for BTC transactions (optional).
 * @returns {Promise<bitcoin.Psbt>} - The unsigned BTC transaction in PSBT format.
 *
 * --------------------------------------------------------------------------------
 * Note: This example demonstrates how to fetch the corresponding parameters using the `fetchAndValidateAssets` function.
 * Example:
 * ```typescript
 * const clusterRgbppLockArgs = await fetchAndValidateAssets(
 *   fromBtcAccount,
 *   clusterTypeScriptArgs,
 *   isMainnet,
 *   btcService,
 * );
 * ```
 */ const prepareCreateSporeUnsignedPsbt = async ({ clusterRgbppLockArgs, receivers, collector, isMainnet, btcTestnetType, fromBtcAccount, fromBtcAccountPubkey, btcDataSource, btcFeeRate })=>{
    const ckbVirtualTxResult = await (0, ckb_namespaceObject.genCreateSporeCkbVirtualTx)({
        collector,
        sporeDataList: receivers.map((receiver)=>receiver.sporeData),
        clusterRgbppLockArgs,
        isMainnet,
        ckbFeeRate: BigInt(2000),
        btcTestnetType
    });
    const { commitment, ckbRawTx, needPaymasterCell } = ckbVirtualTxResult;
    // The first btc address is the owner of the cluster cell and the rest btc addresses are spore receivers
    const btcTos = [
        fromBtcAccount,
        ...receivers.map((receiver)=>receiver.toBtcAddress)
    ];
    const psbt = await (0, external_rgbpp_namespaceObject.sendRgbppUtxos)({
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
/**
 * Fetches RGBPP assets for a given BTC address and type script args, and validates the result.
 *
 * @param {string} fromBtcAccount - The BTC account from which the assets are being fetched.
 * @param {string} clusterTypeScriptArgs - The arguments for the cluster type script.
 * @param {boolean} isMainnet - Indicates if the operation is on mainnet.
 * @param {BtcAssetsApi} btcService - The BTC assets API service.
 * @returns {Promise<string>} - The cluster RGBPP lock args.
 * @throws {Error} - Throws an error if no assets are found for the given BTC address and type script args.
 */ const fetchAndValidateAssets = async (fromBtcAccount, clusterTypeScriptArgs, isMainnet, btcService)=>{
    const assets = await btcService.getRgbppAssetsByBtcAddress(fromBtcAccount, {
        type_script: encodeURIComponent(JSON.stringify({
            ...(0, ckb_namespaceObject.getClusterTypeScript)(isMainnet),
            args: clusterTypeScriptArgs
        }))
    });
    if (0 === assets.length) throw new Error("No assets found for the given BTC address and type script args.");
    return assets[0].cellOutput.lock.args;
};
const getRgbppLockArgsList = async ({ xudtTypeArgs, fromBtcAccount, isMainnet, btcService })=>{
    const type_script = encodeURIComponent(JSON.stringify({
        codeHash: (0, ckb_namespaceObject.getXudtTypeScript)(isMainnet).codeHash,
        args: xudtTypeArgs,
        hashType: "type"
    }));
    console.log(type_script);
    const data = await btcService.getRgbppAssetsByBtcAddress(fromBtcAccount, {
        type_script,
        no_cache: false
    });
    console.log(data);
    // Assuming you want to return the rgbppLockArgsList based on the response
    const rgbppLockArgsList = data.map((asset)=>asset.cellOutput.lock.args);
    return {
        rgbppLockArgsList
    };
};
const distribute = async ({ rgbppLockArgsList, receivers, xudtTypeArgs, collector, btcDataSource, btcTestnetType, isMainnet, fromBtcAccount, fromBtcAccountPubkey, wallet, btcService }, btcFeeRate)=>{
    const xudtType = {
        ...(0, ckb_namespaceObject.getXudtTypeScript)(isMainnet),
        args: xudtTypeArgs
    };
    const ckbVirtualTxResult = await (0, ckb_namespaceObject.genBtcBatchTransferCkbVirtualTx)({
        collector,
        rgbppLockArgsList,
        xudtTypeBytes: (0, ckb_namespaceObject.serializeScript)(xudtType),
        rgbppReceivers: receivers,
        isMainnet,
        btcTestnetType
    });
    const { commitment, ckbRawTx, needPaymasterCell } = ckbVirtualTxResult;
    // Send BTC tx
    const psbt = await (0, btc_namespaceObject.sendRgbppUtxos)({
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
    const { txId: btcTxId, rawTxHex: btcTxBytes } = await signAndSendPsbt(psbt, wallet, btcService);
    console.log(`BTC ${btcTestnetType} TxId: ${btcTxId}`);
    await btcService.sendRgbppCkbTransaction({
        btc_txid: btcTxId,
        ckb_virtual_result: ckbVirtualTxResult
    });
    // TODO： 错误处理，不清楚前端怎么处理会更好一些
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
/**
 * Distributes RGBPP assets to multiple receivers.
 *
 * @param {RgbppDistributeCombinedParams} params - The parameters for the distribution.
 * @param {string} params.xudtTypeArgs - The type arguments for the XUDT type script.
 * @param {RgbppBtcAddressReceiver[]} params.receivers - The list of receivers for the RGBPP assets.
 * @param {Collector} params.collector - The collector instance used for generating the CKB virtual transaction.
 * @param {DataSource} params.btcDataSource - The data source for BTC transactions.
 * @param {BTCTestnetType} [params.btcTestnetType] - The type of BTC testnet (optional).
 * @param {boolean} params.isMainnet - Indicates whether the operation is on the mainnet.
 * @param {string} params.fromBtcAccount - The BTC account from which the assets are being distributed.
 * @param {string} [params.fromBtcAccountPubkey] - The public key of the BTC account.
 * @param {AbstractWallet} params.wallet - Wallet instance used for signing BTC transactions.
 * @param {(argsList: string[]) => Promise<string[]>} params.filterRgbppArgslist - A function to filter the RGBPP args list.
 * @param {BtcAssetsApi} params.btcService - The BTC assets API service.
 * @param {number} [btcFeeRate] - The fee rate for the BTC transaction (optional).
 * @returns {Promise<TxResult>} - The result of the transaction.
 */ const distributeCombined = async ({ xudtTypeArgs, receivers, collector, btcDataSource, btcTestnetType, isMainnet, fromBtcAccount, fromBtcAccountPubkey, wallet, filterRgbppArgslist, btcService }, btcFeeRate)=>{
    const lockArgsListResponse = await getRgbppLockArgsList({
        xudtTypeArgs,
        fromBtcAccount,
        isMainnet,
        btcService
    });
    const filteredLockArgsList = await filterRgbppArgslist(lockArgsListResponse.rgbppLockArgsList);
    const res = await distribute({
        rgbppLockArgsList: filteredLockArgsList,
        receivers,
        xudtTypeArgs,
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
/**
 * Prepares an unsigned PSBT (Partially Signed Bitcoin Transaction) for distributing RGBPP assets.
 * This function is used to estimate transaction fees before finalizing the transaction.
 *
 * @param {PrepareDistributeUnsignedPsbtParams} params - Parameters required to generate the unsigned PSBT.
 * @param {RgbppBtcAddressReceiver[]} params.receivers - List of receivers for the RGBPP assets.
 * @param {string} params.xudtTypeArgs - Type arguments for the XUDT type script.
 * @param {Collector} params.collector - Collector instance used to gather cells for the transaction.
 * @param {DataSource} params.btcDataSource - Data source for BTC transactions.
 * @param {BTCTestnetType} [params.btcTestnetType] - Type of BTC testnet (optional).
 * @param {boolean} params.isMainnet - Indicates whether the operation is on the mainnet.
 * @param {string} params.fromBtcAccount - BTC account from which the assets will be distributed.
 * @param {string} [params.fromBtcAccountPubkey] - Public key of the BTC account.
 * @param {number} [params.btcFeeRate] - Fee rate for the BTC transaction (optional, default is 30).
 * @param {BtcAssetsApi} params.btcService - The BTC assets API service.
 * @param {(argsList: string[]) => Promise<string[]>} params.filterRgbppArgslist - A function to filter the RGBPP args list.
 * @returns {Promise<bitcoin.Psbt>} - Promise that resolves to the unsigned PSBT.
 */ const prepareDistributeUnsignedPsbt = async ({ receivers, xudtTypeArgs, collector, btcDataSource, btcTestnetType, isMainnet, fromBtcAccount, fromBtcAccountPubkey, btcFeeRate = 30, btcService, filterRgbppArgslist })=>{
    const lockArgsListResponse = await getRgbppLockArgsList({
        xudtTypeArgs,
        fromBtcAccount,
        isMainnet,
        btcService
    });
    const filteredLockArgsList = await filterRgbppArgslist(lockArgsListResponse.rgbppLockArgsList);
    const xudtType = {
        ...(0, ckb_namespaceObject.getXudtTypeScript)(isMainnet),
        args: xudtTypeArgs
    };
    const ckbVirtualTxResult = await (0, ckb_namespaceObject.genBtcBatchTransferCkbVirtualTx)({
        collector,
        rgbppLockArgsList: filteredLockArgsList,
        xudtTypeBytes: (0, ckb_namespaceObject.serializeScript)(xudtType),
        rgbppReceivers: receivers,
        isMainnet,
        btcTestnetType
    });
    const { commitment, ckbRawTx, needPaymasterCell } = ckbVirtualTxResult;
    // Generate unsigned PSBT
    const psbt = await (0, btc_namespaceObject.sendRgbppUtxos)({
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
const leapFromBtcToCKB = async ({ rgbppLockArgsList, toCkbAddress, xudtTypeArgs, transferAmount, isMainnet, collector, btcTestnetType, fromBtcAccountPubkey, fromBtcAccount, btcDataSource, btcService, wallet }, btcFeeRate)=>{
    const xudtType = {
        ...(0, ckb_namespaceObject.getXudtTypeScript)(isMainnet),
        args: xudtTypeArgs
    };
    const ckbVirtualTxResult = await (0, ckb_namespaceObject.genBtcJumpCkbVirtualTx)({
        collector,
        rgbppLockArgsList,
        xudtTypeBytes: (0, ckb_namespaceObject.serializeScript)(xudtType),
        transferAmount,
        toCkbAddress,
        isMainnet,
        btcTestnetType
    });
    const { commitment, ckbRawTx } = ckbVirtualTxResult;
    // Send BTC tx
    const psbt = await (0, external_rgbpp_namespaceObject.sendRgbppUtxos)({
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
/**
 * Combines the parameters for leaping RGBPP assets from Bitcoin to CKB and executes the leap operation.
 *
 * @param {RgbppLeapFromBtcToCkbCombinedParams} params - The parameters for the leap operation.
 * @param {string} params.toCkbAddress - The destination CKB address.
 * @param {string} params.xudtTypeArgs - The arguments for the XUDT type script.
 * @param {bigint} params.transferAmount - The amount of assets to transfer.
 * @param {Collector} params.collector - The collector instance for CKB operations.
 * @param {DataSource} params.btcDataSource - The data source for BTC operations.
 * @param {BTCTestnetType} [params.btcTestnetType] - The type of BTC testnet (optional).
 * @param {boolean} params.isMainnet - Indicates if the operation is on mainnet.
 * @param {string} params.fromBtcAccount - The source BTC account.
 * @param {string} [params.fromBtcAccountPubkey] - The public key of the source BTC account.
 * @param {AbstractWallet} params.wallet - Wallet instance used for signing BTC transactions.
 * @param {BtcAssetsApi} params.btcService - The BTC assets service instance.
 * @param {number} [btcFeeRate] - The fee rate for the BTC transaction (optional).
 *
 * @returns {Promise<TxResult>} - The result of the transaction.
 */ const leapFromBtcToCkbCombined = async ({ toCkbAddress, xudtTypeArgs, transferAmount, collector, btcDataSource, btcTestnetType, isMainnet, fromBtcAccount, fromBtcAccountPubkey, wallet, btcService }, btcFeeRate)=>{
    const lockArgsListResponse = await getRgbppLockArgsList({
        xudtTypeArgs,
        fromBtcAccount,
        isMainnet,
        btcService
    });
    const res = await leapFromBtcToCKB({
        rgbppLockArgsList: lockArgsListResponse.rgbppLockArgsList,
        toCkbAddress,
        xudtTypeArgs,
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
/**
 * Prepares an unsigned PSBT (Partially Signed Bitcoin Transaction) for leaping RGBPP assets from Bitcoin to CKB.
 * This function is used to estimate transaction fees before finalizing the transaction.
 *
 * @param {PrepareLeapUnsignedPsbtParams} params - Parameters required to generate the unsigned PSBT.
 * @param {BtcAssetsApi} params.btcService - The BTC assets service instance.
 * @param {string} params.toCkbAddress - The destination CKB address.
 * @param {string} params.xudtTypeArgs - Type arguments for the XUDT type script.
 * @param {bigint} params.transferAmount - The amount of assets to transfer.
 * @param {boolean} params.isMainnet - Indicates whether the operation is on the mainnet.
 * @param {Collector} params.collector - Collector instance used to gather cells for the transaction.
 * @param {BTCTestnetType} [params.btcTestnetType] - Type of BTC testnet (optional).
 * @param {string} params.fromBtcAccount - BTC account from which the assets will be leaped.
 * @param {string} [params.fromBtcAccountPubkey] - Public key of the BTC account.
 * @param {DataSource} params.btcDataSource - Data source for BTC transactions.
 * @param {number} [params.btcFeeRate] - Fee rate for the BTC transaction (optional, default is 30).
 * @returns {Promise<bitcoin.Psbt>} - Promise that resolves to the unsigned PSBT.
 */ const prepareLeapUnsignedPsbt = async ({ btcService, toCkbAddress, xudtTypeArgs, transferAmount, isMainnet, collector, btcTestnetType, fromBtcAccount, fromBtcAccountPubkey, btcDataSource, btcFeeRate = 30 })=>{
    const lockArgsListResponse = await getRgbppLockArgsList({
        xudtTypeArgs,
        fromBtcAccount,
        isMainnet,
        btcService
    });
    const xudtType = {
        ...(0, ckb_namespaceObject.getXudtTypeScript)(isMainnet),
        args: xudtTypeArgs
    };
    const ckbVirtualTxResult = await (0, ckb_namespaceObject.genBtcJumpCkbVirtualTx)({
        collector,
        rgbppLockArgsList: lockArgsListResponse.rgbppLockArgsList,
        xudtTypeBytes: (0, ckb_namespaceObject.serializeScript)(xudtType),
        transferAmount,
        toCkbAddress,
        isMainnet,
        btcTestnetType
    });
    const { commitment, ckbRawTx } = ckbVirtualTxResult;
    // Generate unsigned PSBT
    const psbt = await (0, external_rgbpp_namespaceObject.sendRgbppUtxos)({
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
const transferSpore = async ({ sporeRgbppLockArgs, toBtcAddress, sporeTypeArgs, collector, isMainnet, btcTestnetType, fromBtcAddress, fromBtcAddressPubkey, btcDataSource, btcService, wallet }, btcFeeRate = 30)=>{
    const sporeTypeBytes = (0, ckb_namespaceObject.serializeScript)({
        ...(0, ckb_namespaceObject.getSporeTypeScript)(isMainnet),
        args: sporeTypeArgs
    });
    const ckbVirtualTxResult = await (0, ckb_namespaceObject.genTransferSporeCkbVirtualTx)({
        collector,
        sporeRgbppLockArgs,
        sporeTypeBytes,
        isMainnet,
        btcTestnetType
    });
    const { commitment, ckbRawTx, needPaymasterCell } = ckbVirtualTxResult;
    // Send BTC tx
    const psbt = await (0, external_rgbpp_namespaceObject.sendRgbppUtxos)({
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
/**
 * Transfers a spore to a specified BTC address.
 *
 * @param {SporeTransferCombinedParams} params - The parameters for the spore transfer.
 * @param {string} params.toBtcAddress - The recipient's BTC address.
 * @param {Hex} params.sporeTypeArgs - The type arguments for the spore.
 * @param {Collector} params.collector - The collector object.
 * @param {boolean} params.isMainnet - Indicates if the operation is on the mainnet.
 * @param {BTCTestnetType} [params.btcTestnetType] - The type of BTC testnet (optional).
 * @param {string} params.fromBtcAddress - The sender's BTC address.
 * @param {string} [params.fromBtcAddressPubkey] - The sender's BTC address public key.
 * @param {DataSource} params.btcDataSource - The data source for BTC.
 * @param {AbstractWallet} params.wallet - Wallet instance used for signing BTC transactions.
 * @param {BtcAssetsApi} params.btcService - The BTC assets API service.
 * @param {number} [btcFeeRate=30] - The fee rate for the BTC transaction (optional, default is 30).
 * @returns {Promise<{ btcTxId: string }>} - The result of the spore transfer, including the BTC transaction ID.
 */ const transferSporeCombined = async ({ toBtcAddress, sporeTypeArgs, collector, isMainnet, btcTestnetType, fromBtcAddress, fromBtcAddressPubkey, btcDataSource, wallet, btcService }, btcFeeRate = 30)=>{
    const sporeRgbppLockArgs = await getSporeRgbppLockArgs({
        fromBtcAddress,
        sporeTypeArgs,
        isMainnet,
        btcService
    });
    const res = await transferSpore({
        sporeRgbppLockArgs,
        toBtcAddress,
        sporeTypeArgs,
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
/**
 * Retrieves the spore RGBPP lock arguments based on the provided parameters.
 * @param {GetSporeRgbppLockArgsParams} params - The parameters for retrieving the spore RGBPP lock arguments.
 * @param {string} params.fromBtcAddress - The BTC address from which the spore will be transferred.
 * @param {Hex} params.sporeTypeArgs - Type arguments for the spore.
 * @param {boolean} params.isMainnet - Indicates whether the operation is on the mainnet.
 * @param {BtcAssetsApi} params.btcService - The BTC assets API service.
 * @returns {Promise<Hex>} - A promise that resolves to the spore RGBPP lock arguments.
 */ const getSporeRgbppLockArgs = async ({ fromBtcAddress, sporeTypeArgs, isMainnet, btcService })=>{
    const type_script = JSON.stringify({
        ...(0, ckb_namespaceObject.getSporeTypeScript)(isMainnet),
        args: sporeTypeArgs
    });
    console.log(type_script);
    try {
        const data = await btcService.getRgbppAssetsByBtcAddress(fromBtcAddress, {
            type_script: encodeURIComponent(type_script),
            no_cache: false
        });
        console.log(data);
        if (0 === data.length) throw new Error("No assets found for the given BTC address and type script.");
        // Assuming you want to return the sporeRgbppLockArgs based on the response
        const sporeRgbppLockArgs = data.map((asset)=>asset.cellOutput.lock.args);
        // Assuming you need to return a single Hex value from the list
        return sporeRgbppLockArgs[0];
    } catch (error) {
        console.error("Error fetching sporeRgbppLockArgs:", error);
        throw error;
    }
};
/**
 * Prepares an unsigned PSBT (Partially Signed Bitcoin Transaction) for transferring a spore.
 * This function is used to estimate transaction fees before finalizing the transaction.
 *
 * @param {PrepareTransferSporeUnsignedPsbtParams} params - Parameters required to generate the unsigned PSBT.
 * @param {string} params.toBtcAddress - The recipient's BTC address.
 * @param {Hex} params.sporeTypeArgs - Type arguments for the spore.
 * @param {Collector} params.collector - Collector instance used to gather cells for the transaction.
 * @param {boolean} params.isMainnet - Indicates whether the operation is on the mainnet.
 * @param {BTCTestnetType} [params.btcTestnetType] - Type of BTC testnet (optional).
 * @param {string} params.fromBtcAddress - BTC address from which the spore will be transferred.
 * @param {string} [params.fromBtcAddressPubkey] - Public key of the BTC address.
 * @param {DataSource} params.btcDataSource - Data source for BTC transactions.
 * @param {number} [params.btcFeeRate] - Fee rate for the BTC transaction (optional, default is 30).
 * @param {BtcAssetsApi} params.btcService - The BTC assets API service.
 * @returns {Promise<bitcoin.Psbt>} - Promise that resolves to the unsigned PSBT.
 */ const prepareTransferSporeUnsignedPsbt = async ({ toBtcAddress, sporeTypeArgs, collector, isMainnet, btcTestnetType, fromBtcAddress, fromBtcAddressPubkey, btcDataSource, btcService, btcFeeRate = 30 })=>{
    const sporeRgbppLockArgs = await getSporeRgbppLockArgs({
        fromBtcAddress,
        sporeTypeArgs,
        isMainnet,
        btcService
    });
    const sporeTypeBytes = (0, ckb_namespaceObject.serializeScript)({
        ...(0, ckb_namespaceObject.getSporeTypeScript)(isMainnet),
        args: sporeTypeArgs
    });
    const ckbVirtualTxResult = await (0, ckb_namespaceObject.genTransferSporeCkbVirtualTx)({
        collector,
        sporeRgbppLockArgs,
        sporeTypeBytes,
        isMainnet,
        btcTestnetType
    });
    const { commitment, ckbRawTx, needPaymasterCell } = ckbVirtualTxResult;
    // Generate unsigned PSBT
    const psbt = await (0, external_rgbpp_namespaceObject.sendRgbppUtxos)({
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
const leapSporeFromBtcToCkb = async ({ sporeRgbppLockArgs, toCkbAddress, sporeTypeArgs, collector, isMainnet, btcTestnetType, fromBtcAddress, fromBtcAddressPubkey, btcDataSource, wallet, btcService }, btcFeeRate = 30)=>{
    const sporeTypeBytes = (0, ckb_namespaceObject.serializeScript)({
        ...(0, ckb_namespaceObject.getSporeTypeScript)(isMainnet),
        args: sporeTypeArgs
    });
    const ckbVirtualTxResult = await (0, ckb_namespaceObject.genLeapSporeFromBtcToCkbVirtualTx)({
        collector,
        sporeRgbppLockArgs,
        sporeTypeBytes,
        toCkbAddress,
        isMainnet,
        btcTestnetType
    });
    const { commitment, ckbRawTx, needPaymasterCell } = ckbVirtualTxResult;
    // Send BTC tx
    const psbt = await (0, external_rgbpp_namespaceObject.sendRgbppUtxos)({
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
/**
 * Combines the process of leaping a spore from BTC to CKB with the necessary parameters.
 *
 * @param {SporeLeapCombinedParams} params - The parameters required for the spore leap process.
 * @param {number} [btcFeeRate=30] - The fee rate for the BTC transaction (default is 30).
 *
 * @param {string} params.toCkbAddress - The CKB address to which the spore will be sent.
 * @param {Hex} params.sporeTypeArgs - The type arguments for the spore.
 * @param {Collector} params.collector - The collector object used for collecting the spore.
 * @param {boolean} params.isMainnet - Indicates whether the operation is on the mainnet.
 * @param {BTCTestnetType} [params.btcTestnetType] - The type of BTC testnet (optional).
 * @param {string} params.fromBtcAddress - The BTC address from which the spore will be sent.
 * @param {string} [params.fromBtcAddressPubkey] - The public key of the BTC address.
 * @param {DataSource} params.btcDataSource - The data source for BTC transactions.
 * @param {AbstractWallet} params.wallet - Wallet instance used for signing BTC transactions.
 * @param {BtcAssetsApi} params.btcService - The BTC assets API service.
 *
 * @returns {Promise<TxResult>} - The result of the transaction, including the BTC transaction ID.
 */ const leapSporeFromBtcToCkbCombined = async ({ toCkbAddress, sporeTypeArgs, collector, isMainnet, btcTestnetType, fromBtcAddress, fromBtcAddressPubkey, btcDataSource, wallet, btcService }, btcFeeRate = 30)=>{
    const sporeRgbppLockArgs = await getSporeRgbppLockArgs({
        fromBtcAddress,
        sporeTypeArgs,
        isMainnet,
        btcService
    });
    const res = await leapSporeFromBtcToCkb({
        sporeRgbppLockArgs,
        toCkbAddress,
        sporeTypeArgs,
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
/**
 * Prepares an unsigned PSBT (Partially Signed Bitcoin Transaction) for leaping a spore from Bitcoin to CKB.
 * This function is used to estimate transaction fees before finalizing the transaction.
 *
 * @param {PrepareLeapSporeUnsignedPsbtParams} params - Parameters required to generate the unsigned PSBT.
 * @param {Hex} params.sporeRgbppLockArgs - RGBPP lock arguments for the spore.
 * @param {string} params.toCkbAddress - The destination CKB address.
 * @param {Hex} params.sporeTypeArgs - Type arguments for the spore.
 * @param {Collector} params.collector - Collector instance used to gather cells for the transaction.
 * @param {boolean} params.isMainnet - Indicates whether the operation is on the mainnet.
 * @param {BTCTestnetType} [params.btcTestnetType] - Type of BTC testnet (optional).
 * @param {string} params.fromBtcAddress - BTC address from which the spore will be leaped.
 * @param {string} [params.fromBtcAddressPubkey] - Public key of the BTC address.
 * @param {DataSource} params.btcDataSource - Data source for BTC transactions.
 * @param {number} [params.btcFeeRate] - Fee rate for the BTC transaction (optional, default is 30).
 * @param {BtcAssetsApi} params.btcService - The BTC assets API service.
 * @returns {Promise<bitcoin.Psbt>} - Promise that resolves to the unsigned PSBT.
 */ const prepareLeapSporeUnsignedPsbt = async ({ toCkbAddress, sporeTypeArgs, collector, isMainnet, btcTestnetType, fromBtcAddress, fromBtcAddressPubkey, btcDataSource, btcFeeRate = 30, btcService })=>{
    const sporeRgbppLockArgs = await getSporeRgbppLockArgs({
        fromBtcAddress,
        sporeTypeArgs,
        isMainnet,
        btcService
    });
    const sporeTypeBytes = (0, ckb_namespaceObject.serializeScript)({
        ...(0, ckb_namespaceObject.getSporeTypeScript)(isMainnet),
        args: sporeTypeArgs
    });
    const ckbVirtualTxResult = await (0, ckb_namespaceObject.genLeapSporeFromBtcToCkbVirtualTx)({
        collector,
        sporeRgbppLockArgs,
        sporeTypeBytes,
        toCkbAddress,
        isMainnet,
        btcTestnetType
    });
    const { commitment, ckbRawTx, needPaymasterCell } = ckbVirtualTxResult;
    // Generate unsigned PSBT
    const psbt = await (0, external_rgbpp_namespaceObject.sendRgbppUtxos)({
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
const transfer = async ({ rgbppLockArgsList, toBtcAddress, xudtTypeArgs, transferAmount, collector, btcDataSource, btcTestnetType, isMainnet, fromBtcAccount, fromBtcAccountPubkey, wallet, btcService }, btcFeeRate)=>{
    const { ckbVirtualTxResult, btcPsbtHex } = await (0, external_rgbpp_namespaceObject.buildRgbppTransferTx)({
        ckb: {
            collector,
            xudtTypeArgs,
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
    // Send BTC tx
    const psbt = btc_namespaceObject.bitcoin.Psbt.fromHex(btcPsbtHex);
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
/**
 * Combines the steps of getting the RGBPP lock arguments list and transferring RGBPP assets.
 *
 * @param {RgbppTransferCombinedParams} params - Parameters for the transfer operation.
 * @param {string} params.toBtcAddress - The Bitcoin address to which the assets will be transferred.
 * @param {string} params.xudtTypeArgs - The type arguments for the XUDT script.
 * @param {bigint} params.transferAmount - The amount of assets to transfer, represented as a bigint.
 * @param {Collector} params.collector - The collector instance used for collecting assets.
 * @param {DataSource} params.btcDataSource - The data source for Bitcoin transactions.
 * @param {BTCTestnetType} [params.btcTestnetType] - (Optional) The type of Bitcoin testnet to use.
 * @param {boolean} params.isMainnet - A boolean indicating whether the operation is on the mainnet.
 * @param {string} params.fromBtcAccount - The Bitcoin account from which the assets will be transferred.
 * @param {string} [params.fromBtcAccountPubkey] - The public key of the Bitcoin account.
 * @param {AbstractWallet} params.wallet - Wallet instance used for signing BTC transactions.
 * @param {BtcAssetsApi} params.btcService - The service instance for interacting with Bitcoin assets.
 * @param {number} [btcFeeRate] - (Optional) The fee rate to use for the Bitcoin transaction.
 * @returns {Promise<TxResult>} A promise that resolves to the transaction result.
 */ const transferCombined = async ({ toBtcAddress, xudtTypeArgs, transferAmount, collector, btcDataSource, btcTestnetType, isMainnet, fromBtcAccount, fromBtcAccountPubkey, wallet, btcService }, btcFeeRate)=>{
    const lockArgsListResponse = await getRgbppLockArgsList({
        xudtTypeArgs,
        fromBtcAccount,
        isMainnet,
        btcService
    });
    const res = await transfer({
        rgbppLockArgsList: lockArgsListResponse.rgbppLockArgsList,
        toBtcAddress,
        xudtTypeArgs,
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
/**
 * Prepares an unsigned PSBT (Partially Signed Bitcoin Transaction) for transferring RGBPP assets.
 * This function is used to estimate transaction fees before finalizing the transaction.
 *
 * @param {PrepareTransferUnsignedPsbtParams} params - Parameters required to generate the unsigned PSBT.
 * @param {string} params.toBtcAddress - The recipient's BTC address.
 * @param {string} params.xudtTypeArgs - Type arguments for the XUDT script.
 * @param {bigint} params.transferAmount - The amount of assets to transfer.
 * @param {Collector} params.collector - Collector instance used to gather cells for the transaction.
 * @param {DataSource} params.btcDataSource - Data source for BTC transactions.
 * @param {BTCTestnetType} [params.btcTestnetType] - Type of BTC testnet (optional).
 * @param {boolean} params.isMainnet - Indicates whether the operation is on the mainnet.
 * @param {string} params.fromBtcAccount - BTC account from which the assets will be transferred.
 * @param {string} [params.fromBtcAccountPubkey] - Public key of the BTC account.
 * @param {number} [params.btcFeeRate] - Fee rate for the BTC transaction (optional, default is 30).
 * @param {BtcAssetsApi} params.btcService - The service instance for interacting with Bitcoin assets.
 * @returns {Promise<bitcoin.Psbt>} - Promise that resolves to the unsigned PSBT.
 */ const prepareTransferUnsignedPsbt = async ({ btcService, toBtcAddress, xudtTypeArgs, transferAmount, collector, btcDataSource, btcTestnetType, isMainnet, fromBtcAccount, fromBtcAccountPubkey, btcFeeRate = 30 })=>{
    const lockArgsListResponse = await getRgbppLockArgsList({
        xudtTypeArgs,
        fromBtcAccount,
        isMainnet,
        btcService
    });
    const { btcPsbtHex } = await (0, external_rgbpp_namespaceObject.buildRgbppTransferTx)({
        ckb: {
            collector,
            xudtTypeArgs,
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
    // Convert the hex string to a PSBT object
    const psbt = btc_namespaceObject.bitcoin.Psbt.fromHex(btcPsbtHex);
    return psbt;
};
var __webpack_export_target__ = exports;
for(var __webpack_i__ in __webpack_exports__)__webpack_export_target__[__webpack_i__] = __webpack_exports__[__webpack_i__];
if (__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, '__esModule', {
    value: true
});
