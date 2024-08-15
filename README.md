# Mobit SDK

## Overview

The Mobit SDK is a comprehensive toolkit designed for interacting with the CKB (Nervos Network) and Bitcoin networks. It provides a set of utilities for handling XUDT tokens and RGBPP assets, enabling developers to create, manage, and transfer assets across these networks with ease.

## Installation

To install the Mobit SDK, run the following command:

```bash
npm install mobit-sdk
```

## Usage

### Initializing the SDK

To start using the SDK, you need to initialize the `RgbppSDK` class with the appropriate network configuration. Here’s how you can do it:

```typescript
import { RgbppSDK } from "mobit-sdk";

const isMainnet = true; // Set to false for testnet
const sdk = new RgbppSDK(isMainnet);
```

### CKB Helper

The `CkbHelper` class provides a way to interact with the CKB network, depending on whether you're on the mainnet or testnet.

```typescript
import { CkbHelper } from "mobit-sdk";

const ckbHelper = new CkbHelper(true); // true for mainnet, false for testnet
```

### BTC Helper

The `BtcHelper` class provides utilities for interacting with the Bitcoin network.

```typescript
import { BtcHelper } from "mobit-sdk";

const btcHelper = new BtcHelper(wallet, networkType, btcTestnetType);
```

### Transactions

The SDK provides several functions to create different types of transactions:

#### XUDT Transactions

- `createBurnXudtTransaction`: Burns XUDT tokens.
- `createIssueXudtTransaction`: Issues new XUDT tokens.
- `createMergeXudtTransaction`: Merges XUDT tokens.
- `createTransferXudtTransaction`: Transfers XUDT tokens.

#### Leap Transactions

- `leapFromCkbToBtcTransaction`: Handles the leap from CKB to BTC.
- `leapSporeFromCkbToBtcTransaction`: Handles the leap of spores from CKB to BTC.

### RGBPP Functions

- `distributeCombined`: Distributes RGBPP assets.
- `launchCombined`: Launches RGBPP assets.
- `transferCombined`: Transfers RGBPP assets.

### Spore Functions

- `createClusterCombined`: Creates a new cluster.
- `createSporesCombined`: Creates new spores.
- `transferSporeCombined`: Transfers spores.

### Preparing Transactions

The SDK also provides functions to prepare unsigned transactions and PSBTs (Partially Signed Bitcoin Transactions):

- `prepareClusterCellTransaction`: Prepares a cluster cell transaction.
- `prepareCreateSporeUnsignedPsbt`: Prepares an unsigned PSBT for creating spores.
- `prepareCreateSporeUnsignedTransaction`: Prepares an unsigned transaction for creating spores.
- `prepareDistributeUnsignedPsbt`: Prepares an unsigned PSBT for distributing RGBPP assets.
- `prepareLaunchCellTransaction`: Prepares a launch cell transaction.
- `prepareLauncherUnsignedPsbt`: Prepares an unsigned PSBT for launching RGBPP assets.
- `prepareLeapUnsignedPsbt`: Prepares an unsigned PSBT for leaping RGBPP assets from BTC to CKB.
- `prepareLeapSporeUnsignedPsbt`: Prepares an unsigned PSBT for leaping spores from BTC to CKB.
- `prepareTransferUnsignedPsbt`: Prepares an unsigned PSBT for transferring RGBPP assets.
- `prepareTransferSporeUnsignedPsbt`: Prepares an unsigned PSBT for transferring spores.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
