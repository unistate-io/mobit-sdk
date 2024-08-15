# Mobit SDK

## Overview

The Mobit SDK is a comprehensive toolkit designed for interacting with the CKB
(Nervos Network) and Bitcoin networks. It provides a set of utilities for
handling XUDT tokens and RGBPP assets, enabling developers to create, manage,
and transfer assets across these networks with ease.

## Installation

To install the Mobit SDK, run the following command:

```bash
npm install mobit-sdk
```

## Usage

### Initializing the SDK

To start using the SDK, you need to initialize the `RgbppSDK` class with the
appropriate network configuration. Here’s how you can do it:

```typescript
import { RgbppSDK } from "mobit-sdk";

const isMainnet = true; // Set to false for testnet
const sdk = new RgbppSDK(isMainnet);
```

### CKB Helper

The `CkbHelper` class provides a way to interact with the CKB network, depending
on whether you're on the mainnet or testnet.

```typescript
import { CkbHelper } from "mobit-sdk";

const ckbHelper = new CkbHelper(true); // true for mainnet, false for testnet
```

### BTC Helper

The `BtcHelper` class provides utilities for interacting with the Bitcoin
network.

```typescript
import { BtcHelper, AbstractWallet } from "mobit-sdk";

const wallet: AbstractWallet = // Initialize your wallet instance
const networkType = "mainnet" || "testnet";
const btcTestnetType = "testnet" || undefined;
const btcHelper = new BtcHelper(wallet, networkType, btcTestnetType);
```

### Transactions

The SDK provides several functions to create different types of transactions:

#### XUDT Transactions

- **Burn XUDT Tokens**:
  ```typescript
  createBurnXudtTransaction(params: CreateBurnXudtTransactionParams, feeRate?: bigint, maxFee: bigint = MAX_FEE, witnessLockPlaceholderSize?: number): Promise<CKBComponents.RawTransactionToSign>
  ```

- **Issue XUDT Tokens**:
  ```typescript
  createIssueXudtTransaction(params: CreateIssueXudtTransactionParams, feeRate?: bigint, maxFee: bigint = MAX_FEE, witnessLockPlaceholderSize?: number): Promise<CKBComponents.RawTransactionToSign>
  ```

- **Merge XUDT Tokens**:
  ```typescript
  createMergeXudtTransaction(params: CreateMergeXudtTransactionParams, ckbAddress?: string, feeRate?: bigint, maxFee: bigint = MAX_FEE, witnessLockPlaceholderSize?: number): Promise<CKBComponents.RawTransactionToSign>
  ```

- **Transfer XUDT Tokens**:
  ```typescript
  createTransferXudtTransaction(params: CreateTransferXudtTransactionParams, ckbAddress?: string, feeRate?: bigint, maxFee: bigint = MAX_FEE, witnessLockPlaceholderSize?: number): Promise<CKBComponents.RawTransactionToSign>
  ```

#### Leap Transactions

- **Leap from CKB to BTC**:
  ```typescript
  leapFromCkbToBtcTransaction(params: LeapToBtcTransactionParams, feeRate?: bigint, witnessLockPlaceholderSize?: number): Promise<CKBComponents.RawTransactionToSign>
  ```

- **Leap Spore from CKB to BTC**:
  ```typescript
  leapSporeFromCkbToBtcTransaction(params: LeapSporeToBtcTransactionParams, feeRate?: bigint, witnessLockPlaceholderSize?: number): Promise<CKBComponents.RawTransactionToSign>
  ```

- **Leap from BTC to CKB**:
  ```typescript
  leapFromBtcToCkbCombined(params: RgbppLeapFromBtcToCkbCombinedParams, btcFeeRate?: number): Promise<TxResult>
  ```

- **Leap Spore from BTC to CKB**:
  ```typescript
  leapSporeFromBtcToCkbCombined(params: SporeLeapCombinedParams, btcFeeRate: number = 30): Promise<{ btcTxId: string }>
  ```

### RGBPP Functions

- **Distribute RGBPP Assets**:
  ```typescript
  distributeCombined(params: RgbppDistributeCombinedParams, btcFeeRate?: number): Promise<TxResult>
  ```

- **Launch RGBPP Assets**:
  ```typescript
  launchCombined(params: RgbppLauncerCombinedParams, ckbFeeRate?: bigint, maxFee: bigint = MAX_FEE, btcFeeRate?: number, witnessLockPlaceholderSize?: number): Promise<TxResult>
  ```

- **Transfer RGBPP Assets**:
  ```typescript
  transferCombined(params: RgbppTransferCombinedParams, btcFeeRate?: number): Promise<TxResult>
  ```

### Spore Functions

- **Create Cluster**:
  ```typescript
  createClusterCombined(params: createClusterCombinedParams, ckbFeeRate?: bigint, maxFee: bigint = MAX_FEE, btcFeeRate: number = 30, witnessLockPlaceholderSize?: number): Promise<TxResult>
  ```

- **Create Spores**:
  ```typescript
  createSporesCombined(params: SporeCreateCombinedParams, btcFeeRate: number = 120, ckbFeeRate?: bigint, witnessLockPlaceholderSize?: number): Promise<TxResult>
  ```

- **Transfer Spores**:
  ```typescript
  transferSporeCombined(params: SporeTransferCombinedParams, btcFeeRate: number = 30): Promise<{ btcTxId: string }>
  ```

### Preparing Transactions

The SDK also provides functions to prepare unsigned transactions and PSBTs
(Partially Signed Bitcoin Transactions):

- **Prepare Cluster Cell Transaction**:
  ```typescript
  prepareClusterCellTransaction(params: PrepareClusterCellTransactionParams, maxFee: bigint = MAX_FEE, ckbFeeRate?: bigint, witnessLockPlaceholderSize?: number): Promise<CKBComponents.RawTransactionToSign>
  ```

- **Prepare Create Spore Unsigned PSBT**:
  ```typescript
  prepareCreateSporeUnsignedPsbt(params: PrepareCreateSporeUnsignedPsbtParams): Promise<bitcoin.Psbt>
  ```

- **Prepare Create Spore Unsigned Transaction**:
  ```typescript
  prepareCreateSporeUnsignedTransaction(params: PrepareCreateSporeUnsignedTransactionParams): Promise<CKBComponents.RawTransactionToSign>
  ```

- **Prepare Distribute Unsigned PSBT**:
  ```typescript
  prepareDistributeUnsignedPsbt(params: PrepareDistributeUnsignedPsbtParams): Promise<bitcoin.Psbt>
  ```

- **Prepare Launch Cell Transaction**:
  ```typescript
  prepareLaunchCellTransaction(params: PrepareLaunchCellTransactionParams, maxFee: bigint = MAX_FEE, ckbFeeRate?: bigint, witnessLockPlaceholderSize?: number): Promise<CKBComponents.RawTransactionToSign>
  ```

- **Prepare Launcher Unsigned PSBT**:
  ```typescript
  prepareLauncherUnsignedPsbt(params: PrepareLauncherUnsignedPsbtParams, btcFeeRate?: number): Promise<bitcoin.Psbt>
  ```

- **Prepare Leap Unsigned PSBT**:
  ```typescript
  prepareLeapUnsignedPsbt(params: PrepareLeapUnsignedPsbtParams, btcFeeRate?: number): Promise<bitcoin.Psbt>
  ```

- **Prepare Leap Spore Unsigned PSBT**:
  ```typescript
  prepareLeapSporeUnsignedPsbt(params: PrepareLeapSporeUnsignedPsbtParams, btcFeeRate?: number): Promise<bitcoin.Psbt>
  ```

- **Prepare Transfer Unsigned PSBT**:
  ```typescript
  prepareTransferUnsignedPsbt(params: PrepareTransferUnsignedPsbtParams, btcFeeRate?: number): Promise<bitcoin.Psbt>
  ```

- **Prepare Transfer Spore Unsigned PSBT**:
  ```typescript
  prepareTransferSporeUnsignedPsbt(params: PrepareTransferSporeUnsignedPsbtParams, btcFeeRate?: number): Promise<bitcoin.Psbt>
  ```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any
changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file
for details.
