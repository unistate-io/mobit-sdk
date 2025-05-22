import { addressToScript } from "@nervosnetwork/ckb-sdk-utils";
import {
  BTCTestnetType,
  Collector,
  fetchTypeIdCellDeps,
  IndexerCell,
} from "@rgbpp-sdk/ckb";
import { NetworkType } from "rgbpp";
import { BtcAssetsApi, DataSource } from "rgbpp";

interface BaseUserToSignInput {
  index: number;
  sighashTypes?: number[] | undefined;
  disableTweakSigner?: boolean;
}

/**
 * Input for signing with an address.
 */
export interface AddressUserToSignInput extends BaseUserToSignInput {
  address: string;
}

/**
 * Input for signing with a public key.
 */
export interface PublicKeyUserToSignInput extends BaseUserToSignInput {
  publicKey: string;
}

/**
 * Union type for user sign input.
 */
export type UserToSignInput = AddressUserToSignInput | PublicKeyUserToSignInput;

/**
 * Options for signing a PSBT.
 */
export interface SignPsbtOptions {
  autoFinalized?: boolean; // whether to finalize psbt automatically
  toSignInputs?: UserToSignInput[];
}

/**
 * AbstractWallet interface defines the contract for a wallet that can sign PSBTs (Partially Signed Bitcoin Transactions).
 */
export interface AbstractWallet {
  /**
   * Signs a PSBT (Partially Signed Bitcoin Transaction) given its hexadecimal representation.
   * @param psbtHex - The hexadecimal string representation of the PSBT to be signed.
   * @returns A promise that resolves to the signed PSBT in hexadecimal format.
   */
  signPsbt(psbtHex: string): Promise<string>;
}

/**
 * CkbHelper class provides utility methods for interacting with the CKB (Nervos Network) blockchain.
 */
export class CkbHelper {
  /**
   * The collector instance used for collecting data from the CKB blockchain.
   */
  collector: Collector;
  /**
   * A boolean indicating whether the helper is interacting with the mainnet.
   */
  isMainnet: boolean;

  /**
   * Constructs a new CkbHelper instance.
   * @param {boolean} isMainnet - A boolean indicating whether the helper is interacting with the mainnet or testnet.
   */
  constructor(isMainnet: boolean) {
    this.isMainnet = isMainnet;
    if (isMainnet) {
      this.collector = new Collector({
        ckbNodeUrl: "https://mainnet.ckbapp.dev",
        ckbIndexerUrl: "https://mainnet.ckbapp.dev/indexer",
      });
    } else {
      this.collector = new Collector({
        ckbNodeUrl: "https://testnet.ckbapp.dev",
        ckbIndexerUrl: "https://testnet.ckb.dev",
      });
    }
  }
}

/**
 * Creates a BTC service instance.
 * @param {BTCTestnetType} btcTestnetType - The type of BTC testnet.
 * @returns {BtcAssetsApi} A BtcAssetsApi instance.
 */
export const createBtcService = (
  btcTestnetType?: BTCTestnetType,
): BtcAssetsApi => {
  let btcServiceUrl: string;
  let btcServiceToken: string;
  if (btcTestnetType === undefined) {
    btcServiceUrl = "https://api.rgbpp.io";
    btcServiceToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJNb2JpdCIsImF1ZCI6Im1vYml0LmFwcCIsImp0aSI6IjNjMTAzNGNmLTcwZWEtNDgzMy04MGUwLTRlMDA2NTNkNTY3YiIsImlhdCI6MTcxODM0Njg0OX0.97pGqGCPMpP9rVaqq1QNaDcjykQLThGildYJWu93DiM";
  } else if (btcTestnetType === "Signet") {
    btcServiceUrl = "https://api.signet.rgbpp.io";
    btcServiceToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtb2JpdCIsImF1ZCI6Im1vYml0LmFwcCIsImp0aSI6IjcxNzk3YzcxLTgyMmUtNGJhZC04OWIwLTdmNWZhZThhNjZkNyIsImlhdCI6MTcyMjMyODg0MH0.HiSNr_d8iYjIea9s1wBfKP8KzaBmz_7pXJcy68YcCPY";
  } else {
    btcServiceUrl = "https://api.testnet.rgbpp.io";
    btcServiceToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtb2JpdCIsImF1ZCI6Im1vYml0LmFwcCIsImp0aSI6ImY1NDZjZDBkLTUzNzQtNGI4YS1iMGRlLWY4NTRjMDY1Y2ZkOCIsImlhdCI6MTcyMjMyODc3Mn0.NmtM_Y7jkTjNKgTwatyAP0YoUDtwwci6LUe13R1L9SM";
  }

  const btcServiceOrigin = "https://mobit.app";

  return BtcAssetsApi.fromToken(
    btcServiceUrl,
    btcServiceToken,
    btcServiceOrigin,
  );
};

/**
 * BtcHelper class provides utility methods for interacting with the Bitcoin network, including managing data sources and services.
 */
export class BtcHelper {
  /**
   * The data source used for interacting with the Bitcoin network.
   */
  btcDataSource: DataSource;
  /**
   * Optional parameter specifying the type of Bitcoin testnet.
   */
  btcTestnetType?: BTCTestnetType;
  /**
   * The service used for managing Bitcoin assets.
   */
  btcService: BtcAssetsApi;
  /**
   * The wallet instance used for signing transactions.
   */
  wallet: AbstractWallet;
  /**
   * The type of network the helper is interacting with.
   */
  networkType: NetworkType;

  /**
   * Constructs a new BtcHelper instance.
   * @param {AbstractWallet} wallet - An instance of a wallet that implements the AbstractWallet interface.
   * @param {NetworkType} networkType - The type of network (e.g., Mainnet, Testnet) the helper will interact with.
   * @param {BTCTestnetType} btcTestnetType - Optional parameter specifying the type of Bitcoin testnet (e.g., Signet, Testnet3).
   */
  constructor(
    wallet: AbstractWallet,
    networkType: NetworkType,
    btcTestnetType?: BTCTestnetType,
  ) {
    this.btcTestnetType = btcTestnetType;
    this.networkType = networkType;

    this.btcService = createBtcService(btcTestnetType);

    this.btcDataSource = new DataSource(this.btcService, networkType);
    this.wallet = wallet;
  }
}

/**
 * Result interface for transaction operations.
 */
export interface TxResult {
  /**
   * The transaction ID of the Bitcoin transaction.
   */
  btcTxId: string;
  /**
   * The transaction hash of the CKB transaction, optional.
   */
  ckbTxHash?: string;
}
/**
 * Fetches indexer cells for given addresses.
 * @param {Object} params - The parameters object.
 * @param {string[]} params.ckbAddresses - The list of CKB addresses.
 * @param {Collector} params.collector - The collector instance.
 * @param {CKBComponents.Script} [params.type] - Optional type script.
 * @returns {Promise<IndexerCell[]>} A promise that resolves to an array of IndexerCell.
 */
export async function getIndexerCells({
  ckbAddresses,
  type,
  collector,
}: {
  ckbAddresses: string[];
  collector: Collector;
  type?: CKBComponents.Script;
}): Promise<IndexerCell[]> {
  const fromLocks = ckbAddresses.map(addressToScript);
  let indexerCells: IndexerCell[] = [];

  console.debug("Starting to fetch indexer cells for addresses:", ckbAddresses);
  console.debug("Converted addresses to locks:", fromLocks);
  for (const lock of fromLocks) {
    console.debug("Fetching cells for lock:", lock);
    try {
      const cells = await collector.getCells({
        lock,
        type,
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

// iCKB specific constants and functions
const ICKB_ARGS =
  "0xb73b6ab39d79390c6de90a09c96b290c331baf1798ed6f97aed02590929734e800000080";

function isICKB(xudtArgs: string): boolean {
  return xudtArgs === ICKB_ARGS;
}

const ICKB_CELL_DEP = {
  mainnet: {
    outPoint: {
      txHash:
        "0x621a6f38de3b9f453016780edac3b26bfcbfa3e2ecb47c2da275471a5d3ed165",
      index: "0x0",
    },
    depType: "depGroup",
  },
  testnet: {
    outPoint: {
      txHash:
        "0xf7ece4fb33d8378344cab11fcd6a4c6f382fd4207ac921cf5821f30712dcd311",
      index: "0x0",
    },
    depType: "depGroup",
  },
} as const;

function getICKBCellDep(isMainnet: boolean): CKBComponents.CellDep {
  return isMainnet ? ICKB_CELL_DEP.mainnet : ICKB_CELL_DEP.testnet;
}

// USDI specific constants and functions
// Args from HTML Data Hash fields
const USDI_MAINNET_ARGS =
  "0x50bd8d6680b2612a403ac970e926605c2600d95a91a88c8a0b8709be6e78a1b95";
const USDI_TESTNET_V1_ARGS =
  "0x28a734e118e005993d8265474298375722c2b4862783668694ac9d84dcc94d8";
const USDI_TESTNET_V2_ARGS =
  "0x50bd8d6680b2612a403ac970e926605c2600d95a91a88c8a0b8709be6e78a1b95"; // Same as Mainnet

function isUSDIMainnet(xudtArgs: string): boolean {
  return xudtArgs === USDI_MAINNET_ARGS;
}
function isUSDITestnetV1(xudtArgs: string): boolean {
  return xudtArgs === USDI_TESTNET_V1_ARGS;
}
function isUSDITestnetV2(xudtArgs: string): boolean {
  return xudtArgs === USDI_TESTNET_V2_ARGS;
}

const USDI_CELL_DEPS = {
  mainnet: {
    // From Mainnet HTML Card
    outPoint: {
      txHash:
        "0xf6a5eef65101899db9709c8de1cc28f23c1bee90d857ebe176f6647ef109e20d",
      index: "0x0",
    },
    depType: "code",
  },
  testnetV1: {
    // From Testnet HTML Card 1 (CodeHash) + README (CellDep for that CodeHash)
    outPoint: {
      txHash:
        "0xaec423c2af7fe844b476333190096b10fc5726e6d9ac58a9b71f71ffac204fee",
      index: "0x0",
    },
    depType: "code",
  },
  testnetV2: {
    // From Testnet HTML Card 2
    outPoint: {
      txHash:
        "0x03d029480417b7307c567c898178381db7c06b9cf0a22b2109d2d3dd5e674e61",
      index: "0x0",
    },
    depType: "code",
  },
} as const;

function getUSDICellDep(
  xudtArgs: string,
  isMainnet: boolean,
): CKBComponents.CellDep | null {
  if (isMainnet) {
    if (xudtArgs === USDI_MAINNET_ARGS) {
      return USDI_CELL_DEPS.mainnet;
    }
  } else {
    if (xudtArgs === USDI_TESTNET_V1_ARGS) {
      return USDI_CELL_DEPS.testnetV1;
    }
    if (xudtArgs === USDI_TESTNET_V2_ARGS) {
      return USDI_CELL_DEPS.testnetV2;
    }
  }
  return null; // Should not happen if isUSDI checks pass
}

/**
 * Retrieves the cell dependencies required for a transaction involving a specific XUDT.
 * It checks for known XUDTs like iCKB and USDI to provide their specific cell dependencies.
 * If the XUDT is not a known special case, it falls back to fetching generic Type ID cell dependencies.
 *
 * @param isMainnet A boolean indicating whether the operation is on the mainnet.
 * @param xudtArgs The arguments of the XUDT's type script.
 * @returns A promise that resolves to an array of CKBComponents.CellDep.
 */
export async function getCellDeps(
  isMainnet: boolean,
  xudtArgs: string,
): Promise<CKBComponents.CellDep[]> {
  // Ensure xudtArgs is 0x prefixed for consistent comparison
  const normalizedXudtArgs = xudtArgs.startsWith("0x")
    ? xudtArgs
    : `0x${xudtArgs}`;

  if (isICKB(normalizedXudtArgs)) {
    console.debug("Using iCKB specific cell dep");
    return [getICKBCellDep(isMainnet)];
  }

  const usdiCellDep = getUSDICellDep(normalizedXudtArgs, isMainnet);
  if (usdiCellDep) {
    console.debug(
      `Using USDI specific cell dep for args: ${normalizedXudtArgs} on ${isMainnet ? "mainnet" : "testnet"}`,
    );
    return [usdiCellDep];
  }

  console.debug("Using generic xUDT (Type ID) cell dep");
  return await fetchTypeIdCellDeps(isMainnet, { xudt: true });
}
