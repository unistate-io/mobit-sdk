<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [mobit-sdk](./mobit-sdk.md) &gt; [launchCombined](./mobit-sdk.launchcombined.md)

## launchCombined() function

Launches an RGB++ asset by preparing a launch cell and subsequently sending a BTC transaction.

**Signature:**

```typescript
launchCombined: ({ rgbppTokenInfo, collector, isMainnet, btcTestnetType, btcAccount, btcDataSource, btcAccountPubkey, launchAmount, ckbAddress, filterUtxo, btcService, wallet, cccSigner, }: RgbppLauncerCombinedParams, ckbFeeRate?: bigint, btcFeeRate?: number) => Promise<TxResult>
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

{ rgbppTokenInfo, collector, isMainnet, btcTestnetType, btcAccount, btcDataSource, btcAccountPubkey, launchAmount, ckbAddress, filterUtxo, btcService, wallet, cccSigner, }


</td><td>

[RgbppLauncerCombinedParams](./mobit-sdk.rgbpplauncercombinedparams.md)


</td><td>


</td></tr>
<tr><td>

ckbFeeRate


</td><td>

bigint


</td><td>

_(Optional)_ (Optional) The fee rate for CKB transactions, represented as a bigint.


</td></tr>
<tr><td>

btcFeeRate


</td><td>

number


</td><td>

_(Optional)_ (Optional) The fee rate for BTC transactions, represented as a number.


</td></tr>
</tbody></table>
**Returns:**

Promise&lt;[TxResult](./mobit-sdk.txresult.md)<!-- -->&gt;

A promise that resolves to the transaction result, including the BTC transaction ID and CKB transaction hash.

