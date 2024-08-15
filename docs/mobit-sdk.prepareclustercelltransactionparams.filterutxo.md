<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [mobit-sdk](./mobit-sdk.md) &gt; [PrepareClusterCellTransactionParams](./mobit-sdk.prepareclustercelltransactionparams.md) &gt; [filterUtxo](./mobit-sdk.prepareclustercelltransactionparams.filterutxo.md)

## PrepareClusterCellTransactionParams.filterUtxo property

Function to filter UTXOs for the BTC transaction.

**Signature:**

```typescript
filterUtxo: (utxos: BtcApiUtxo[]) => Promise<{
        outIndex: number;
        btcTxId: string;
    }>;
```