<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [mobit-sdk](./mobit-sdk.md) &gt; [leapSporeFromCkbToBtcTransaction](./mobit-sdk.leapsporefromckbtobtctransaction.md)

## leapSporeFromCkbToBtcTransaction() function

Leap a spore from CKB to BTC.

**Signature:**

```typescript
leapSporeFromCkbToBtcTransaction: ({ outIndex, btcTxId, sporeTypeArgs, isMainnet, collector, ckbAddress, btcTestnetType, }: LeapSporeToBtcTransactionParams, feeRate?: bigint, witnessLockPlaceholderSize?: number) => Promise<CKBComponents.RawTransactionToSign>
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

{ outIndex, btcTxId, sporeTypeArgs, isMainnet, collector, ckbAddress, btcTestnetType, }


</td><td>

[LeapSporeToBtcTransactionParams](./mobit-sdk.leapsporetobtctransactionparams.md)


</td><td>


</td></tr>
<tr><td>

feeRate


</td><td>

bigint


</td><td>

_(Optional)_ (Optional) The fee rate for the transaction.


</td></tr>
<tr><td>

witnessLockPlaceholderSize


</td><td>

number


</td><td>

_(Optional)_ (Optional) The size of the witness lock placeholder.


</td></tr>
</tbody></table>
**Returns:**

Promise&lt;CKBComponents.RawTransactionToSign&gt;

{<!-- -->Promise<!-- -->&lt;<!-- -->CKBComponents.RawTransactionToSign<!-- -->&gt;<!-- -->} A promise that resolves to the unsigned raw transaction to sign.
