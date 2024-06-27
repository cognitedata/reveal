---
id: "cognite_reveal_extensions_datasource.ModelDataProvider"
title: "Interface: ModelDataProvider"
sidebar_label: "ModelDataProvider"
custom_edit_url: null
---

[@cognite/reveal/extensions/datasource](../modules/cognite_reveal_extensions_datasource.md).ModelDataProvider

Provides data for 3D models.

## Hierarchy

- `JsonFileProvider`

- `BinaryFileProvider`

  ↳ **`ModelDataProvider`**

## Methods

### getBinaryFile

▸ **getBinaryFile**(`baseUrl`, `fileName`): `Promise`\<`ArrayBuffer`\>

Downloads a binary blob.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `baseUrl` | `string` | Base URL of the model. |
| `fileName` | `string` | Filename of binary file. |

#### Returns

`Promise`\<`ArrayBuffer`\>

#### Overrides

BinaryFileProvider.getBinaryFile

#### Defined in

[packages/modeldata-api/src/types.ts:28](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/modeldata-api/src/types.ts#L28)

___

### getJsonFile

▸ **getJsonFile**(`baseUrl`, `fileName`): `Promise`\<`any`\>

Download and parse a JSON file and return the resulting struct.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `baseUrl` | `string` | Base URL of the model. |
| `fileName` | `string` | Filename of JSON file. |

#### Returns

`Promise`\<`any`\>

#### Overrides

JsonFileProvider.getJsonFile

#### Defined in

[packages/modeldata-api/src/types.ts:22](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/modeldata-api/src/types.ts#L22)
