---
id: "cognite_reveal.NumericRange"
title: "Class: NumericRange"
sidebar_label: "NumericRange"
custom_edit_url: null
---

[@cognite/reveal](../modules/cognite_reveal.md).NumericRange

## Constructors

### constructor

• **new NumericRange**(`from`, `count`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `from` | `number` |
| `count` | `number` |

#### Defined in

[packages/utilities/src/NumericRange.ts:10](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/utilities/src/NumericRange.ts#L10)

## Properties

### count

• `Readonly` **count**: `number`

#### Defined in

[packages/utilities/src/NumericRange.ts:7](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/utilities/src/NumericRange.ts#L7)

___

### from

• `Readonly` **from**: `number`

#### Defined in

[packages/utilities/src/NumericRange.ts:6](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/utilities/src/NumericRange.ts#L6)

___

### toInclusive

• `Readonly` **toInclusive**: `number`

#### Defined in

[packages/utilities/src/NumericRange.ts:8](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/utilities/src/NumericRange.ts#L8)

## Methods

### contains

▸ **contains**(`value`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`boolean`

#### Defined in

[packages/utilities/src/NumericRange.ts:38](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/utilities/src/NumericRange.ts#L38)

___

### equal

▸ **equal**(`other`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `other` | [`NumericRange`](cognite_reveal.NumericRange.md) |

#### Returns

`boolean`

#### Defined in

[packages/utilities/src/NumericRange.ts:34](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/utilities/src/NumericRange.ts#L34)

___

### forEach

▸ **forEach**(`action`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `action` | (`value`: `number`) => `void` |

#### Returns

`void`

#### Defined in

[packages/utilities/src/NumericRange.ts:72](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/utilities/src/NumericRange.ts#L72)

___

### intersectionWith

▸ **intersectionWith**(`range`): [`NumericRange`](cognite_reveal.NumericRange.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `range` | [`NumericRange`](cognite_reveal.NumericRange.md) |

#### Returns

[`NumericRange`](cognite_reveal.NumericRange.md)

#### Defined in

[packages/utilities/src/NumericRange.ts:50](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/utilities/src/NumericRange.ts#L50)

___

### intersects

▸ **intersects**(`range`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `range` | [`NumericRange`](cognite_reveal.NumericRange.md) |

#### Returns

`boolean`

#### Defined in

[packages/utilities/src/NumericRange.ts:42](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/utilities/src/NumericRange.ts#L42)

___

### intersectsOrCoinciding

▸ **intersectsOrCoinciding**(`range`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `range` | [`NumericRange`](cognite_reveal.NumericRange.md) |

#### Returns

`boolean`

#### Defined in

[packages/utilities/src/NumericRange.ts:46](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/utilities/src/NumericRange.ts#L46)

___

### isInside

▸ **isInside**(`range`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `range` | [`NumericRange`](cognite_reveal.NumericRange.md) |

#### Returns

`boolean`

#### Defined in

[packages/utilities/src/NumericRange.ts:61](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/utilities/src/NumericRange.ts#L61)

___

### toArray

▸ **toArray**(): `number`[]

#### Returns

`number`[]

#### Defined in

[packages/utilities/src/NumericRange.ts:30](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/utilities/src/NumericRange.ts#L30)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Defined in

[packages/utilities/src/NumericRange.ts:78](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/utilities/src/NumericRange.ts#L78)

___

### union

▸ **union**(`range`): [`NumericRange`](cognite_reveal.NumericRange.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `range` | [`NumericRange`](cognite_reveal.NumericRange.md) |

#### Returns

[`NumericRange`](cognite_reveal.NumericRange.md)

#### Defined in

[packages/utilities/src/NumericRange.ts:65](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/utilities/src/NumericRange.ts#L65)

___

### values

▸ **values**(): `Generator`\<`number`, `any`, `unknown`\>

#### Returns

`Generator`\<`number`, `any`, `unknown`\>

#### Defined in

[packages/utilities/src/NumericRange.ts:24](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/utilities/src/NumericRange.ts#L24)

___

### createFromInterval

▸ `Static` **createFromInterval**(`from`, `toInclusive`): [`NumericRange`](cognite_reveal.NumericRange.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `from` | `number` |
| `toInclusive` | `number` |

#### Returns

[`NumericRange`](cognite_reveal.NumericRange.md)

#### Defined in

[packages/utilities/src/NumericRange.ts:20](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/utilities/src/NumericRange.ts#L20)

___

### isNumericRange

▸ `Static` **isNumericRange**(`value`): value is NumericRange

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `any` |

#### Returns

value is NumericRange

#### Defined in

[packages/utilities/src/NumericRange.ts:82](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/utilities/src/NumericRange.ts#L82)
