# Interface: ModelMetadataProvider

Provides metadata for 3D models.

## Methods

### getModelCamera()

> **getModelCamera**(`identifier`): `Promise`\<`undefined` \| `object`\>

#### Parameters

• **identifier**: [`ModelIdentifier`](ModelIdentifier.md)

#### Returns

`Promise`\<`undefined` \| `object`\>

#### Defined in

[packages/data-providers/src/ModelMetadataProvider.ts:14](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/data-providers/src/ModelMetadataProvider.ts#L14)

***

### getModelMatrix()

> **getModelMatrix**(`identifier`, `format`): `Promise`\<`Matrix4`\>

#### Parameters

• **identifier**: [`ModelIdentifier`](ModelIdentifier.md)

• **format**: `string`

#### Returns

`Promise`\<`Matrix4`\>

#### Defined in

[packages/data-providers/src/ModelMetadataProvider.ts:15](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/data-providers/src/ModelMetadataProvider.ts#L15)

***

### getModelOutputs()

> **getModelOutputs**(`modelIdentifier`): `Promise` \<[`BlobOutputMetadata`](BlobOutputMetadata.md)[]\>

#### Parameters

• **modelIdentifier**: [`ModelIdentifier`](ModelIdentifier.md)

#### Returns

`Promise` \<[`BlobOutputMetadata`](BlobOutputMetadata.md)[]\>

#### Defined in

[packages/data-providers/src/ModelMetadataProvider.ts:12](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/data-providers/src/ModelMetadataProvider.ts#L12)

***

### getModelUri()

> **getModelUri**(`identifier`, `formatMetadata`): `Promise`\<`string`\>

#### Parameters

• **identifier**: [`ModelIdentifier`](ModelIdentifier.md)

• **formatMetadata**: [`BlobOutputMetadata`](BlobOutputMetadata.md)

#### Returns

`Promise`\<`string`\>

#### Defined in

[packages/data-providers/src/ModelMetadataProvider.ts:13](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/data-providers/src/ModelMetadataProvider.ts#L13)
