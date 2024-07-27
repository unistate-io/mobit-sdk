# Mobit SDK

## Overview

This project provides a set of utilities for interacting with the CKB (Nervos
Network) and Bitcoin networks, specifically for handling XUDT tokens and RGBPP
assets.

## Installation

To install the necessary dependencies, run:

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

### Fetching Transactions

You can fetch transaction details for a given BTC address using the
`fetchTxsDetails` method:

```typescript
const btcAddress = "YOUR_BTC_ADDRESS";
const transactions = await sdk.fetchTxsDetails(btcAddress);
console.log(transactions);
```

### Fetching Assets and Query Details

To get the balance and detailed asset information for a BTC address, use the
`fetchAssetsAndQueryDetails` method:

```typescript
const btcAddress = "YOUR_BTC_ADDRESS";
const result = await sdk.fetchAssetsAndQueryDetails(btcAddress);
console.log(result.balance);
console.log(result.assets);
```

### CKB Helper

The `CkbHelper` class provides a way to interact with the CKB network, depending
on whether you're on the mainnet or testnet.

```typescript
import { CkbHelper } from "./helper";

const ckbHelper = new CkbHelper(true); // true for mainnet, false for testnet
```

### Transactions

The project provides several functions to create different types of
transactions:

- `createBurnXudtTransaction`: Burns XUDT tokens.
- `createIssueXudtTransaction`: Issues new XUDT tokens.
- `createMergeXudtTransaction`: Merges XUDT tokens.
- `createTransferXudtTransaction`: Transfers XUDT tokens.

### Leap Functions

- `leapFromCkbToBtc`: Handles the leap from CKB to BTC.
- `leapFromBtcToCKB`: Handles the leap from BTC to CKB.
- `leapSporeFromCkbToBtc`: Handles the leap of spores from CKB to BTC.
- `leapSporeFromBtcToCkbCombined`: Handles the leap of spores from BTC to CKB.

### RGBPP Functions

- `distributeCombined`: Distributes RGBPP assets.
- `launchCombined`: Launches RGBPP assets.
- `transferCombined`: Transfers RGBPP assets.

### Spore Functions

- `createClusterCombined`: Creates a new cluster.
- `createSporesCombined`: Creates new spores.
- `transferSporeCombined`: Transfers spores.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any
changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file
for details.
