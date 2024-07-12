import { NetworkType } from "rgbpp";
import { BtcAssetsApi, DataSource } from "rgbpp";
import * as ccc from "@ckb-ccc/core";
import { convertToTxSkeleton } from "./convert";
import { BTCTestnetType, Collector, IndexerCell } from "@rgbpp-sdk/ckb";
import { addressToScript } from "@nervosnetwork/ckb-sdk-utils";
import {
  isAcpAddress,
  isOmnilockAddress,
  isSecp256k1Blake160Address,
  isSecp256k1Blake160MultisigAddress,
} from "@ckb-lumos/common-scripts/lib/helper";
import {
  Config,
  getConfig,
  MAINNET,
  predefined,
  TESTNET,
} from "@ckb-lumos/lumos/config";
import { config } from "@ckb-lumos/lumos";

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
  error?: any;
}

export async function getIndexerCells(
  { ckbAddresses, type, collector }: {
    ckbAddresses: string[];
    collector: Collector;
    type?: CKBComponents.Script;
  },
): Promise<IndexerCell[]> {
  const fromLocks = ckbAddresses.map(addressToScript);
  let indexerCells: IndexerCell[] = [];

  for (const lock of fromLocks) {
    const cells = await collector.getCells({
      lock: lock,
      type,
    });
    indexerCells = indexerCells.concat(cells);
  }

  return indexerCells;
}

export async function getAddressCellDeps(
  isMainnet: boolean,
  ckbAddresses: string[],
): Promise<CKBComponents.CellDep[]> {
  let config;
  if (isMainnet) {
    config = MAINNET;
  } else {
    config = TESTNET;
  }

  let cellDeps: CKBComponents.CellDep[] = [];

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
    cellDeps.push(
      {
        outPoint: {
          txHash: config.SCRIPTS.OMNILOCK.TX_HASH,
          index: config.SCRIPTS.OMNILOCK.INDEX,
        },
        depType: config.SCRIPTS.OMNILOCK.DEP_TYPE,
      },
    );
  }

  if (isAcp) {
    cellDeps.push(
      {
        outPoint: {
          txHash: config.SCRIPTS.ANYONE_CAN_PAY.TX_HASH,
          index: config.SCRIPTS.ANYONE_CAN_PAY.INDEX,
        },
        depType: config.SCRIPTS.ANYONE_CAN_PAY.DEP_TYPE,
      },
    );
  }

  if (isSecp) {
    cellDeps.push(
      {
        outPoint: {
          txHash: config.SCRIPTS.SECP256K1_BLAKE160.TX_HASH,
          index: config.SCRIPTS.SECP256K1_BLAKE160.INDEX,
        },
        depType: config.SCRIPTS.SECP256K1_BLAKE160.DEP_TYPE,
      },
    );
  }

  if (isSecpMult) {
    cellDeps.push(
      {
        outPoint: {
          txHash: config.SCRIPTS.SECP256K1_BLAKE160_MULTISIG.TX_HASH,
          index: config.SCRIPTS.SECP256K1_BLAKE160_MULTISIG.INDEX,
        },
        depType: config.SCRIPTS.SECP256K1_BLAKE160_MULTISIG.DEP_TYPE,
      },
    );
  }

  return cellDeps;
}
