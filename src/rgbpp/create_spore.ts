import * as ccc from "@ckb-ccc/core";
import {
  appendCkbTxWitnesses,
  BTCTestnetType,
  buildAppendingIssuerCellToSporesCreateTx,
  Collector,
  genCreateSporeCkbVirtualTx,
  generateSporeCreateCoBuild,
  getClusterTypeScript,
  Hex,
  RawSporeData,
  updateCkbTxWithRealBtcTxId,
} from "@rgbpp-sdk/ckb";
import { BtcAssetsApi, DataSource, sendRgbppUtxos } from "rgbpp";
import { AbstractWallet, signAndSendTransaction, TxResult } from "../helper";
import { signAndSendPsbt } from "../unisat";

interface SporeCreateParams {
  clusterRgbppLockArgs: Hex;
  receivers: {
    toBtcAddress: string;
    sporeData: RawSporeData;
  }[];
  collector: Collector;
  isMainnet: boolean;
  btcTestnetType?: BTCTestnetType;
  fromBtcAccount: string;
  fromBtcAccountPubkey?: string;
  btcDataSource: DataSource;
  unisat: AbstractWallet;
  ckbAddress: string;
  btcService: BtcAssetsApi;
  cccSigner: ccc.Signer;
}

// Warning: Before runing this file for the first time, please run 2-prepare-cluster.ts
const createSpores = async ({
  clusterRgbppLockArgs,
  receivers,
  collector,
  isMainnet,
  btcTestnetType,
  fromBtcAccount,
  fromBtcAccountPubkey,
  btcDataSource,
  unisat,
  btcService,
  ckbAddress,
  cccSigner,
}: SporeCreateParams): Promise<TxResult> => {
  const ckbVirtualTxResult = await genCreateSporeCkbVirtualTx({
    collector,
    sporeDataList: receivers.map((receiver) => receiver.sporeData),
    clusterRgbppLockArgs,
    isMainnet,
    ckbFeeRate: BigInt(2000),
    btcTestnetType,
  });

  const {
    commitment,
    ckbRawTx,
    sumInputsCapacity,
    clusterCell,
    needPaymasterCell,
  } = ckbVirtualTxResult;

  // Send BTC tx
  // The first btc address is the owner of the cluster cell and the rest btc addresses are spore receivers
  const btcTos = [
    fromBtcAccount,
    ...receivers.map((receiver) => receiver.toBtcAddress),
  ];
  const psbt = await sendRgbppUtxos({
    ckbVirtualTx: ckbRawTx,
    commitment,
    tos: btcTos,
    needPaymaster: needPaymasterCell,
    ckbCollector: collector,
    from: fromBtcAccount,
    fromPubkey: fromBtcAccountPubkey,
    source: btcDataSource,
    feeRate: 120,
  });

  const { txId: btcTxId, rawTxHex: btcTxBytes } = await signAndSendPsbt(
    psbt,
    unisat,
    btcService,
  );
  console.log("BTC TxId: ", btcTxId);

  await btcService.sendRgbppCkbTransaction({
    btc_txid: btcTxId,
    ckb_virtual_result: ckbVirtualTxResult,
  });

  const interval = setInterval(async () => {
    try {
      console.log("Waiting for BTC tx and proof to be ready");
      const rgbppApiSpvProof = await btcService.getRgbppSpvProof(btcTxId, 0);
      clearInterval(interval);
      // Update CKB transaction with the real BTC txId
      const newCkbRawTx = updateCkbTxWithRealBtcTxId({
        ckbRawTx,
        btcTxId,
        isMainnet,
      });
      console.log(
        "The new cluster rgbpp lock args: ",
        newCkbRawTx.outputs[0].lock.args,
      );

      const ckbTx = await appendCkbTxWitnesses({
        ckbRawTx: newCkbRawTx,
        btcTxBytes,
        rgbppApiSpvProof,
      });

      // The outputs[1..] are spore cells from which you can find spore type scripts,
      // and the spore type scripts will be used to transfer and leap spores
      console.log(
        "Spore type scripts: ",
        JSON.stringify(ckbTx.outputs.slice(1).map((output) => output.type)),
      );

      // Replace cobuild witness with the final rgbpp lock script
      ckbTx.witnesses[ckbTx.witnesses.length - 1] = generateSporeCreateCoBuild({
        // The first output is cluster cell and the rest of the outputs are spore cells
        sporeOutputs: ckbTx.outputs.slice(1),
        sporeOutputsData: ckbTx.outputsData.slice(1),
        clusterCell,
        clusterOutputCell: ckbTx.outputs[0],
      });

      // console.log('ckbTx: ', JSON.stringify(ckbTx));

      const unsignedTx = await buildAppendingIssuerCellToSporesCreateTx({
        issuerAddress: ckbAddress,
        ckbRawTx: ckbTx,
        collector,
        sumInputsCapacity,
      });

      const txHash = await signAndSendTransaction(
        unsignedTx,
        collector,
        cccSigner,
      );

      console.info(`RGB++ Spore has been created and tx hash is ${txHash}`);
    } catch (error) {
      let processedError: Error;
      if (error instanceof Error) {
        processedError = error;
      } else {
        processedError = new Error(String(error));
      }
      console.error(processedError);
      return { error: processedError, btcTxId };
    }
  }, 30 * 1000);

  return {
    btcTxId,
  };
};

interface SporeCreateCombinedParams {
  clusterTypeScriptArgs: string;
  receivers: {
    toBtcAddress: string;
    sporeData: RawSporeData;
  }[];
  collector: Collector;
  isMainnet: boolean;
  btcTestnetType?: BTCTestnetType;
  fromBtcAccount: string;
  fromBtcAccountPubkey?: string;
  btcDataSource: DataSource;
  unisat: AbstractWallet;
  ckbAddress: string;
  btcService: BtcAssetsApi;
  cccSigner: ccc.Signer;
}

export const createSporesCombined = async ({
  clusterTypeScriptArgs,
  receivers,
  collector,
  isMainnet,
  btcTestnetType,
  fromBtcAccount,
  fromBtcAccountPubkey,
  btcDataSource,
  unisat,
  btcService,
  ckbAddress,
  cccSigner,
}: SporeCreateCombinedParams): Promise<TxResult> => {
  const assets = await btcService.getRgbppAssetsByBtcAddress(fromBtcAccount, {
    type_script: encodeURIComponent(
      JSON.stringify({
        ...getClusterTypeScript(isMainnet),
        args: clusterTypeScriptArgs,
      }),
    ),
  });

  // 判断一下assets是否不为空，为空则报错
  if (assets.length === 0) {
    throw new Error(
      "No assets found for the given BTC address and type script args.",
    );
  }

  // outIndexU32 + btcTxId
  const clusterRgbppLockArgs = assets[0].cellOutput.lock.args;

  const res = await createSpores({
    clusterRgbppLockArgs,
    receivers,
    collector,
    isMainnet,
    btcTestnetType,
    fromBtcAccount,
    fromBtcAccountPubkey,
    btcDataSource,
    unisat,
    btcService,
    ckbAddress,
    cccSigner,
  });

  return res;
};
