import {
  isAcpAddress,
  isOmnilockAddress,
  isSecp256k1Blake160Address,
  isSecp256k1Blake160MultisigAddress,
} from "@ckb-lumos/common-scripts/lib/helper";
import { Config, MAINNET, TESTNET } from "@ckb-lumos/lumos/config";
import { addressToScript } from "@nervosnetwork/ckb-sdk-utils";
import { BTCTestnetType, Collector, IndexerCell } from "@rgbpp-sdk/ckb";
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

/**
 * Gets cell dependencies for given addresses.
 * @param {boolean} isMainnet - Whether the network is mainnet.
 * @param {string[]} ckbAddresses - The list of CKB addresses.
 * @returns {Promise<CKBComponents.CellDep[]>} A promise that resolves to an array of CellDep.
 */
export async function getAddressCellDeps(
  isMainnet: boolean,
  ckbAddresses: string[],
): Promise<CKBComponents.CellDep[]> {
  let config: Config;
  if (isMainnet) {
    config = MAINNET;
  } else {
    config = TESTNET;
  }

  const scripts = config.SCRIPTS;
  const cellDeps: CKBComponents.CellDep[] = [];

  const isOmnilock = ckbAddresses.some((address) =>
    isOmnilockAddress(address, config),
  );
  const isAcp = ckbAddresses.some((address) => isAcpAddress(address, config));
  const isSecp = ckbAddresses.some((address) =>
    isSecp256k1Blake160Address(address, config),
  );
  const isSecpMult = ckbAddresses.some((address) =>
    isSecp256k1Blake160MultisigAddress(address, config),
  );

  if (isOmnilock) {
    const omnilock = scripts.OMNILOCK;
    if (!omnilock) {
      throw new Error("OMNILOCK script configuration is missing.");
    }
    cellDeps.push({
      outPoint: {
        txHash: omnilock.TX_HASH,
        index: omnilock.INDEX,
      },
      depType: omnilock.DEP_TYPE,
    });
  }

  if (isAcp) {
    const acp = scripts.ANYONE_CAN_PAY;
    if (!acp) {
      throw new Error("ANYONE_CAN_PAY script configuration is missing.");
    }
    cellDeps.push({
      outPoint: {
        txHash: acp.TX_HASH,
        index: acp.INDEX,
      },
      depType: acp.DEP_TYPE,
    });
  }

  if (isSecp) {
    const secp = scripts.SECP256K1_BLAKE160;
    if (!secp) {
      throw new Error("SECP256K1_BLAKE160 script configuration is missing.");
    }
    cellDeps.push({
      outPoint: {
        txHash: secp.TX_HASH,
        index: secp.INDEX,
      },
      depType: secp.DEP_TYPE,
    });
  }

  if (isSecpMult) {
    const secpMult = scripts.SECP256K1_BLAKE160_MULTISIG;
    if (!secpMult) {
      throw new Error(
        "SECP256K1_BLAKE160_MULTISIG script configuration is missing.",
      );
    }
    cellDeps.push({
      outPoint: {
        txHash: secpMult.TX_HASH,
        index: secpMult.INDEX,
      },
      depType: secpMult.DEP_TYPE,
    });
  }

  return cellDeps;
}

const OMNILOCK_WITNESS_LOCK_SIZE = 292;
const ACP_WITNESS_LOCK_SIZE = 41;
const SECP256K1_WITNESS_LOCK_SIZE = 65;
const SECP256K1_MULTISIG_WITNESS_LOCK_SIZE = 130;

/**
 * Calculates the witness size for a given address.
 * @param {string} address - The CKB address.
 * @param {boolean} isMainnet - Whether the network is mainnet.
 * @returns {number} The witness size.
 */
export function calculateWitnessSize(
  address: string,
  isMainnet: boolean,
): number {
  let config: Config;
  if (isMainnet) {
    config = MAINNET;
  } else {
    config = TESTNET;
  }

  if (isOmnilockAddress(address, config)) {
    return OMNILOCK_WITNESS_LOCK_SIZE;
  }

  if (isAcpAddress(address, config)) {
    return ACP_WITNESS_LOCK_SIZE;
  }

  if (isSecp256k1Blake160Address(address, config)) {
    return SECP256K1_WITNESS_LOCK_SIZE;
  }

  if (isSecp256k1Blake160MultisigAddress(address, config)) {
    return SECP256K1_MULTISIG_WITNESS_LOCK_SIZE;
  }

  // 对于未知类型，返回一个保守的估计值
  console.warn(
    `Unknown address type for address: ${address}. Using default witness size.`,
  );
  return SECP256K1_WITNESS_LOCK_SIZE;
}
