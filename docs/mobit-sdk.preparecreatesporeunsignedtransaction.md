<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [mobit-sdk](./mobit-sdk.md) &gt; [prepareCreateSporeUnsignedTransaction](./mobit-sdk.preparecreatesporeunsignedtransaction.md)

## prepareCreateSporeUnsignedTransaction() function

Prepares an unsigned CKB transaction for creating spores.

**Signature:**

```typescript
prepareCreateSporeUnsignedTransaction: ({ clusterRgbppLockArgs, receivers, collector, isMainnet, btcTestnetType, ckbAddress, ckbFeeRate, witnessLockPlaceholderSize, }: PrepareCreateSporeUnsignedTransactionParams) => Promise<CKBComponents.RawTransactionToSign>
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

{ clusterRgbppLockArgs, receivers, collector, isMainnet, btcTestnetType, ckbAddress, ckbFeeRate, witnessLockPlaceholderSize, }


</td><td>

[PrepareCreateSporeUnsignedTransactionParams](./mobit-sdk.preparecreatesporeunsignedtransactionparams.md)


</td><td>


</td></tr>
</tbody></table>
**Returns:**

Promise&lt;CKBComponents.RawTransactionToSign&gt;

{<!-- -->Promise<!-- -->&lt;<!-- -->CKBComponents.RawTransactionToSign<!-- -->&gt;<!-- -->} - The unsigned CKB transaction.
