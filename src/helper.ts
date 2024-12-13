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

export async function getCellDeps(isMainnet: boolean, xudtArgs: string) {
  if (isICKB(xudtArgs)) {
    return [getICKBCellDep(isMainnet)];
  } else {
    return await fetchTypeIdCellDeps(isMainnet, { xudt: true });
  }
}
