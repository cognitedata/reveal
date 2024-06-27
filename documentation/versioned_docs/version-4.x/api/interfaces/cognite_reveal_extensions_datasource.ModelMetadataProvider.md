---
id: "cognite_reveal_extensions_datasource.ModelMetadataProvider"
title: "Interface: ModelMetadataProvider"
sidebar_label: "ModelMetadataProvider"
custom_edit_url: null
---

[@cognite/reveal/extensions/datasource](../modules/cognite_reveal_extensions_datasource.md).ModelMetadataProvider

Provides metadata for 3D models.

## Methods

### getModelCamera

▸ **getModelCamera**(`identifier`): `Promise`\<`undefined` \| \{ `position`: `Vector3` ; `target`: `Vector3`  }\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `identifier` | [`ModelIdentifier`](cognite_reveal_extensions_datasource.ModelIdentifier.md) |

#### Returns

`Promise`\<`undefined` \| \{ `position`: `Vector3` ; `target`: `Vector3`  }\>

#### Defined in

[packages/data-providers/src/ModelMetadataProvider.ts:14](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/data-providers/src/ModelMetadataProvider.ts#L14)

___

### getModelMatrix

▸ **getModelMatrix**(`identifier`, `format`): `Promise`\<`Matrix4`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `identifier` | [`ModelIdentifier`](cognite_reveal_extensions_datasource.ModelIdentifier.md) |
| `format` | `string` |

#### Returns

`Promise`\<`Matrix4`\>

#### Defined in

[packages/data-providers/src/ModelMetadataProvider.ts:15](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/data-providers/src/ModelMetadataProvider.ts#L15)

___

### getModelOutputs

▸ **getModelOutputs**(`modelIdentifier`): `Promise`\<[`BlobOutputMetadata`](cognite_reveal_extensions_datasource.BlobOutputMetadata.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `modelIdentifier` | [`ModelIdentifier`](cognite_reveal_extensions_datasource.ModelIdentifier.md) |

#### Returns

`Promise`\<[`BlobOutputMetadata`](cognite_reveal_extensions_datasource.BlobOutputMetadata.md)[]\>

#### Defined in

[packages/data-providers/src/ModelMetadataProvider.ts:12](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/data-providers/src/ModelMetadataProvider.ts#L12)

___

### getModelUri

▸ **getModelUri**(`identifier`, `formatMetadata`): `Promise`\<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `identifier` | [`ModelIdentifier`](cognite_reveal_extensions_datasource.ModelIdentifier.md) |
| `formatMetadata` | [`BlobOutputMetadata`](cognite_reveal_extensions_datasource.BlobOutputMetadata.md) |

#### Returns

`Promise`\<`string`\>

#### Defined in

[packages/data-providers/src/ModelMetadataProvider.ts:13](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/data-providers/src/ModelMetadataProvider.ts#L13)
