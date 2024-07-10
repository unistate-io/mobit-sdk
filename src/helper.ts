import { NetworkType } from "rgbpp";
import { BtcAssetsApi, DataSource } from "rgbpp";
import * as ccc from "@ckb-ccc/core";
import { convertToTxSkeleton } from "./convert";
import { BTCTestnetType, Collector } from "@rgbpp-sdk/ckb";

export const signAndSendTransaction = async (
  transaction: CKBComponents.RawTransactionToSign,
  collector: Collector,
  cccSigner: ccc.Signer
): Promise<{ txHash: string }> => {
  const txSkeleton = await convertToTxSkeleton(transaction, collector);
  const txHash = await cccSigner.sendTransaction(
    ccc.Transaction.fromLumosSkeleton(txSkeleton)
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
    btcTestnetType?: BTCTestnetType
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
      btcServiceOrigin
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
