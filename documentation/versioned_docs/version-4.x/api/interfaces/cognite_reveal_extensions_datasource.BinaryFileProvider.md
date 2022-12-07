---
id: "cognite_reveal_extensions_datasource.BinaryFileProvider"
title: "Interface: BinaryFileProvider"
sidebar_label: "BinaryFileProvider"
custom_edit_url: null
---

[@cognite/reveal/extensions/datasource](../modules/cognite_reveal_extensions_datasource.md).BinaryFileProvider

## Hierarchy

- **`BinaryFileProvider`**

  ↳ [`ModelDataProvider`](cognite_reveal_extensions_datasource.ModelDataProvider.md)

## Methods

### getBinaryFile

▸ **getBinaryFile**(`baseUrl`, `fileName`): `Promise`<`ArrayBuffer`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `baseUrl` | `string` |
| `fileName` | `string` |

#### Returns

`Promise`<`ArrayBuffer`\>

#### Defined in

[packages/data-providers/src/types.ts:11](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/data-providers/src/types.ts#L11)
