# Mobit SDK

[![npm version](https://img.shields.io/npm/v/mobit-sdk.svg)](https://www.npmjs.com/package/mobit-sdk)
[![npm downloads](https://img.shields.io/npm/dm/mobit-sdk.svg)](https://www.npmjs.com/package/mobit-sdk)
[![license](https://img.shields.io/npm/l/mobit-sdk.svg)](https://www.npmjs.com/package/mobit-sdk)

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

The SDK provides several functions to create different types of transactions.
For detailed usage and parameters, refer to the
[API Documentation on GitHub](https://github.com/sociallayer-im/mobit-sdk/blob/main/docs/mobit-sdk.md).

#### XUDT Transactions

- **Burn XUDT Tokens**:
  [Documentation](https://github.com/sociallayer-im/mobit-sdk/blob/main/docs/mobit-sdk.createburnxudttransaction.md)
- **Issue XUDT Tokens**:
  [Documentation](https://github.com/sociallayer-im/mobit-sdk/blob/main/docs/mobit-sdk.createissuexudttransaction.md)
- **Merge XUDT Tokens**:
  [Documentation](https://github.com/sociallayer-im/mobit-sdk/blob/main/docs/mobit-sdk.createmergexudttransaction.md)
- **Transfer XUDT Tokens**:
  [Documentation](https://github.com/sociallayer-im/mobit-sdk/blob/main/docs/mobit-sdk.createtransferxudttransaction.md)

#### Leap Transactions

- **Leap from CKB to BTC**:
  [Documentation](https://github.com/sociallayer-im/mobit-sdk/blob/main/docs/mobit-sdk.leapfromckbtobtctransaction.md)
- **Leap Spore from CKB to BTC**:
  [Documentation](https://github.com/sociallayer-im/mobit-sdk/blob/main/docs/mobit-sdk.leapsporefromckbtobtctransaction.md)
- **Leap from BTC to CKB**:
  [Documentation](https://github.com/sociallayer-im/mobit-sdk/blob/main/docs/mobit-sdk.leapfrombtctockbcombined.md)
- **Leap Spore from BTC to CKB**:
  [Documentation](https://github.com/sociallayer-im/mobit-sdk/blob/main/docs/mobit-sdk.leapsporefrombtctockbcombined.md)

### RGBPP Functions

- **Distribute RGBPP Assets**:
  [Documentation](https://github.com/sociallayer-im/mobit-sdk/blob/main/docs/mobit-sdk.distributecombined.md)
- **Launch RGBPP Assets**:
  [Documentation](https://github.com/sociallayer-im/mobit-sdk/blob/main/docs/mobit-sdk.launchcombined.md)
- **Transfer RGBPP Assets**:
  [Documentation](https://github.com/sociallayer-im/mobit-sdk/blob/main/docs/mobit-sdk.transfercombined.md)

### Spore Functions

- **Create Cluster**:
  [Documentation](https://github.com/sociallayer-im/mobit-sdk/blob/main/docs/mobit-sdk.createclustercombined.md)
- **Create Spores**:
  [Documentation](https://github.com/sociallayer-im/mobit-sdk/blob/main/docs/mobit-sdk.createsporescombined.md)
- **Transfer Spores**:
  [Documentation](https://github.com/sociallayer-im/mobit-sdk/blob/main/docs/mobit-sdk.transfersporecombined.md)

### Preparing Transactions

The SDK also provides functions to prepare unsigned transactions and PSBTs
(Partially Signed Bitcoin Transactions). For detailed usage and parameters,
refer to the
[API Documentation on GitHub](https://github.com/sociallayer-im/mobit-sdk/blob/main/docs/mobit-sdk.md).

- **Prepare Cluster Cell Transaction**:
  [Documentation](https://github.com/sociallayer-im/mobit-sdk/blob/main/docs/mobit-sdk.prepareclustercelltransaction.md)
- **Prepare Create Spore Unsigned PSBT**:
  [Documentation](https://github.com/sociallayer-im/mobit-sdk/blob/main/docs/mobit-sdk.preparecreatesporeunsignedpsbt.md)
- **Prepare Create Spore Unsigned Transaction**:
  [Documentation](https://github.com/sociallayer-im/mobit-sdk/blob/main/docs/mobit-sdk.preparecreatesporeunsignedtransaction.md)
- **Prepare Distribute Unsigned PSBT**:
  [Documentation](https://github.com/sociallayer-im/mobit-sdk/blob/main/docs/mobit-sdk.preparedistributeunsignedpsbt.md)
- **Prepare Launch Cell Transaction**:
  [Documentation](https://github.com/sociallayer-im/mobit-sdk/blob/main/docs/mobit-sdk.preparelaunchcelltransaction.md)
- **Prepare Launcher Unsigned PSBT**:
  [Documentation](https://github.com/sociallayer-im/mobit-sdk/blob/main/docs/mobit-sdk.preparelauncherunsignedpsbt.md)
- **Prepare Leap Unsigned PSBT**:
  [Documentation](https://github.com/sociallayer-im/mobit-sdk/blob/main/docs/mobit-sdk.prepareleapunsignedpsbt.md)
- **Prepare Leap Spore Unsigned PSBT**:
  [Documentation](https://github.com/sociallayer-im/mobit-sdk/blob/main/docs/mobit-sdk.prepareleapsporeunsignedpsbt.md)
- **Prepare Transfer Unsigned PSBT**:
  [Documentation](https://github.com/sociallayer-im/mobit-sdk/blob/main/docs/mobit-sdk.preparetransferunsignedpsbt.md)
- **Prepare Transfer Spore Unsigned PSBT**:
  [Documentation](https://github.com/sociallayer-im/mobit-sdk/blob/main/docs/mobit-sdk.preparetransfersporeunsignedpsbt.md)

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any
changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file
for details.
