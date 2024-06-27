# Class: CdfModelIdentifier

Identifies a 3D model stored in CDF by the combination of a modelId, a revisionId
and a format.

## Implements

- [`ModelIdentifier`](../interfaces/ModelIdentifier.md)

## Constructors

### new CdfModelIdentifier()

> **new CdfModelIdentifier**(`modelId`, `revisionId`): [`CdfModelIdentifier`](CdfModelIdentifier.md)

#### Parameters

• **modelId**: `number`

• **revisionId**: `number`

#### Returns

[`CdfModelIdentifier`](CdfModelIdentifier.md)

#### Defined in

[packages/data-providers/src/model-identifiers/CdfModelIdentifier.ts:16](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/data-providers/src/model-identifiers/CdfModelIdentifier.ts#L16)

## Properties

### modelId

> `readonly` **modelId**: `number`

#### Defined in

[packages/data-providers/src/model-identifiers/CdfModelIdentifier.ts:13](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/data-providers/src/model-identifiers/CdfModelIdentifier.ts#L13)

***

### revealInternalId

> `readonly` **revealInternalId**: `symbol`

Unique ID of the model.

#### Implementation of

[`ModelIdentifier`](../interfaces/ModelIdentifier.md) . [`revealInternalId`](../interfaces/ModelIdentifier.md#revealinternalid)

#### Defined in

[packages/data-providers/src/model-identifiers/CdfModelIdentifier.ts:11](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/data-providers/src/model-identifiers/CdfModelIdentifier.ts#L11)

***

### revisionId

> `readonly` **revisionId**: `number`

#### Defined in

[packages/data-providers/src/model-identifiers/CdfModelIdentifier.ts:14](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/data-providers/src/model-identifiers/CdfModelIdentifier.ts#L14)

## Methods

### toString()

> **toString**(): `string`

#### Returns

`string`

#### Defined in

[packages/data-providers/src/model-identifiers/CdfModelIdentifier.ts:22](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/data-providers/src/model-identifiers/CdfModelIdentifier.ts#L22)
