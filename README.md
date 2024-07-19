# Mobit Sdk

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
