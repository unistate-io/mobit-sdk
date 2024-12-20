<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [mobit-sdk](./mobit-sdk.md) &gt; [createClusterCombined](./mobit-sdk.createclustercombined.md)

## createClusterCombined() function

Creates a cluster cell on the CKB network and initiates a corresponding BTC transaction.

**Signature:**

```typescript
createClusterCombined: ({ ckbAddress, clusterData, collector, isMainnet, btcTestnetType, fromBtcAccount, fromBtcAccountPubkey, btcDataSource, wallet, btcService, filterUtxo, cccSigner, }: createClusterCombinedParams, ckbFeeRate?: bigint, btcFeeRate?: number) => Promise<TxResult>
```

## Parameters

<table><thead><tr><th>

Parameter


</th><th>

Type


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

{ ckbAddress, clusterData, collector, isMainnet, btcTestnetType, fromBtcAccount, fromBtcAccountPubkey, btcDataSource, wallet, btcService, filterUtxo, cccSigner, }


</td><td>

[createClusterCombinedParams](./mobit-sdk.createclustercombinedparams.md)


</td><td>


</td></tr>
<tr><td>

ckbFeeRate


</td><td>

bigint


</td><td>

_(Optional)_ Fee rate for the CKB transaction (optional).


</td></tr>
<tr><td>

btcFeeRate


</td><td>

number


</td><td>

_(Optional)_ Fee rate for the BTC transaction (default is 30).


</td></tr>
</tbody></table>
**Returns:**

Promise&lt;[TxResult](./mobit-sdk.txresult.md)<!-- -->&gt;

{<!-- -->Promise<TxResult>} - Promise that resolves to the transaction result.

