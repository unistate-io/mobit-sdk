<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [mobit-sdk](./mobit-sdk.md) &gt; [createMergeXudtTransaction](./mobit-sdk.createmergexudttransaction.md)

## createMergeXudtTransaction() function

Merges multiple xUDT cells into a single xUDT cell and returns the remaining capacity as a separate cell.

**Signature:**

```typescript
export declare function createMergeXudtTransaction({ xudtType, ckbAddresses, collector, isMainnet, }: CreateMergeXudtTransactionParams, ckbAddress?: string): Promise<CKBComponents.RawTransactionToSign>;
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

{ xudtType, ckbAddresses, collector, isMainnet, }


</td><td>

[CreateMergeXudtTransactionParams](./mobit-sdk.createmergexudttransactionparams.md)


</td><td>


</td></tr>
<tr><td>

ckbAddress


</td><td>

string


</td><td>

_(Optional)_ The address for the output cell, defaulting to the first address in the input address set.


</td></tr>
</tbody></table>
**Returns:**

Promise&lt;CKBComponents.RawTransactionToSign&gt;

{<!-- -->Promise<!-- -->&lt;<!-- -->CKBComponents.RawTransactionToSign<!-- -->&gt;<!-- -->} An unsigned transaction object.

