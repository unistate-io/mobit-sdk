import * as ccc from "@ckb-ccc/core";
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
import { convertToTxSkeleton } from "./convert";

export const signAndSendTransaction = async (
  transaction: CKBComponents.RawTransactionToSign,
  collector: Collector,
  cccSigner: ccc.Signer,
): Promise<{ txHash: string }> => {
  const txSkeleton = await convertToTxSkeleton(transaction, collector);
  const txHash = await cccSigner.sendTransaction(
    ccc.Transaction.fromLumosSkeleton(txSkeleton),
  );
  return { txHash };
};

interface BaseUserToSignInput {
  index: number;
  sighashTypes?: number[] | undefined;
  disableTweakSigner?: boolean;
}

export interface AddressUserToSignInput extends BaseUserToSignInput {
  address: string;
}

export interface PublicKeyUserToSignInput extends BaseUserToSignInput {
  publicKey: string;
}

export type UserToSignInput = AddressUserToSignInput | PublicKeyUserToSignInput;

export interface SignPsbtOptions {
  autoFinalized?: boolean; // whether to finalize psbt automatically
  toSignInputs?: UserToSignInput[];
}

export interface AbstractWallet {
  signPsbt(psbtHex: string): Promise<string>;
}

export class CkbHelper {
  collector: Collector;
  isMainnet: boolean;

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

export class BtcHelper {
  btcDataSource: DataSource;
  btcTestnetType?: BTCTestnetType;
  btcService: BtcAssetsApi;
  unisat: AbstractWallet;
  networkType: NetworkType;

  constructor(
    unisat: AbstractWallet,
    networkType: NetworkType,
    btcTestnetType?: BTCTestnetType,
  ) {
    this.btcTestnetType = btcTestnetType;
    this.networkType = networkType;

    let btcServiceUrl: string;

    if (btcTestnetType === undefined) {
      btcServiceUrl = "https://api.rgbpp.io";
    } else if (btcTestnetType === "Signet") {
      btcServiceUrl = "https://api.signet.rgbpp.io";
    } else {
      btcServiceUrl = "https://api.testnet.rgbpp.io";
    }

    const btcServiceToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJNb2JpdCIsImF1ZCI6Im1vYml0LmFwcCIsImp0aSI6IjNjMTAzNGNmLTcwZWEtNDgzMy04MGUwLTRlMDA2NTNkNTY3YiIsImlhdCI6MTcxODM0Njg0OX0.97pGqGCPMpP9rVaqq1QNaDcjykQLThGildYJWu93DiM";
    const btcServiceOrigin = "https://mobit.app";

    this.btcService = BtcAssetsApi.fromToken(
      btcServiceUrl,
      btcServiceToken,
      btcServiceOrigin,
    );

    this.btcDataSource = new DataSource(this.btcService, networkType);
    this.unisat = unisat;
  }
}

export interface TxResult {
  btcTxId: string;
  ckbTxHash?: string;
}

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
    isOmnilockAddress(address, config)
  );
  const isAcp = ckbAddresses.some((address) => isAcpAddress(address, config));
  const isSecp = ckbAddresses.some((address) =>
    isSecp256k1Blake160Address(address, config)
  );
  const isSecpMult = ckbAddresses.some((address) =>
    isSecp256k1Blake160MultisigAddress(address, config)
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
