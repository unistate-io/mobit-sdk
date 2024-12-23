<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [mobit-sdk](./mobit-sdk.md) &gt; [transferCombined](./mobit-sdk.transfercombined.md)

## transferCombined() function

Combines the steps of getting the RGBPP lock arguments list and transferring RGBPP assets.

**Signature:**

```typescript
transferCombined: ({ toBtcAddress, xudtType, transferAmount, collector, btcDataSource, btcTestnetType, isMainnet, fromBtcAccount, fromBtcAccountPubkey, wallet, btcService, }: RgbppTransferCombinedParams, btcFeeRate?: number) => Promise<TxResult>
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

{ toBtcAddress, xudtType, transferAmount, collector, btcDataSource, btcTestnetType, isMainnet, fromBtcAccount, fromBtcAccountPubkey, wallet, btcService, }


</td><td>

[RgbppTransferCombinedParams](./mobit-sdk.rgbpptransfercombinedparams.md)


</td><td>


</td></tr>
<tr><td>

btcFeeRate


</td><td>

number


</td><td>

_(Optional)_ (Optional) The fee rate to use for the Bitcoin transaction.


</td></tr>
</tbody></table>
**Returns:**

Promise&lt;[TxResult](./mobit-sdk.txresult.md)<!-- -->&gt;

{<!-- -->Promise<TxResult>} A promise that resolves to the transaction result.

