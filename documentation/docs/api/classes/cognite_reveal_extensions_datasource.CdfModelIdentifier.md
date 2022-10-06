---
id: "cognite_reveal_extensions_datasource.CdfModelIdentifier"
title: "Class: CdfModelIdentifier"
sidebar_label: "CdfModelIdentifier"
custom_edit_url: null
---

[@cognite/reveal/extensions/datasource](../modules/cognite_reveal_extensions_datasource.md).CdfModelIdentifier

Identifies a 3D model stored in CDF by the combination of a modelId, a revisionId
and a format.

## Implements

- [`ModelIdentifier`](../interfaces/cognite_reveal_extensions_datasource.ModelIdentifier.md)

## Constructors

### constructor

• **new CdfModelIdentifier**(`modelId`, `revisionId`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `modelId` | `number` |
| `revisionId` | `number` |

#### Defined in

[packages/modeldata-api/src/CdfModelIdentifier.ts:16](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/modeldata-api/src/CdfModelIdentifier.ts#L16)

## Properties

### modelId

• `Readonly` **modelId**: `number`

#### Defined in

[packages/modeldata-api/src/CdfModelIdentifier.ts:13](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/modeldata-api/src/CdfModelIdentifier.ts#L13)

___

### revealInternalId

• `Readonly` **revealInternalId**: `symbol`

Unique ID of the model.

#### Implementation of

[ModelIdentifier](../interfaces/cognite_reveal_extensions_datasource.ModelIdentifier.md).[revealInternalId](../interfaces/cognite_reveal_extensions_datasource.ModelIdentifier.md#revealinternalid)

#### Defined in

[packages/modeldata-api/src/CdfModelIdentifier.ts:11](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/modeldata-api/src/CdfModelIdentifier.ts#L11)

___

### revisionId

• `Readonly` **revisionId**: `number`

#### Defined in

[packages/modeldata-api/src/CdfModelIdentifier.ts:14](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/modeldata-api/src/CdfModelIdentifier.ts#L14)

## Methods

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Defined in

[packages/modeldata-api/src/CdfModelIdentifier.ts:22](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/modeldata-api/src/CdfModelIdentifier.ts#L22)
