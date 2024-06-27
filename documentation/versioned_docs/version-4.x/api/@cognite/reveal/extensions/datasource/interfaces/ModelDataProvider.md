# Interface: ModelDataProvider

Provides data for 3D models.

## Extends

- [`JsonFileProvider`](JsonFileProvider.md) . [`BinaryFileProvider`](BinaryFileProvider.md)

## Methods

### getBinaryFile()

> **getBinaryFile**(`baseUrl`, `fileName`, `abortSignal`?): `Promise`\<`ArrayBuffer`\>

Downloads a binary blob.

#### Parameters

• **baseUrl**: `string`

Base URL of the model.

• **fileName**: `string`

Filename of binary file.

• **abortSignal?**: `AbortSignal`

Optional abort signal that can be used to cancel an in progress fetch.

#### Returns

`Promise`\<`ArrayBuffer`\>

#### Overrides

[`BinaryFileProvider`](BinaryFileProvider.md) . [`getBinaryFile`](BinaryFileProvider.md#getbinaryfile)

#### Defined in

[packages/data-providers/src/ModelDataProvider.ts:23](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/data-providers/src/ModelDataProvider.ts#L23)

***

### getJsonFile()

> **getJsonFile**(`baseUrl`, `fileName`): `Promise`\<`any`\>

Download and parse a JSON file and return the resulting struct.

#### Parameters

• **baseUrl**: `string`

Base URL of the model.

• **fileName**: `string`

Filename of JSON file.

#### Returns

`Promise`\<`any`\>

#### Overrides

[`JsonFileProvider`](JsonFileProvider.md) . [`getJsonFile`](JsonFileProvider.md#getjsonfile)

#### Defined in

[packages/data-providers/src/ModelDataProvider.ts:16](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/data-providers/src/ModelDataProvider.ts#L16)
