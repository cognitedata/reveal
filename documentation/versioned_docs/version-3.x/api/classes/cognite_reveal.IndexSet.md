---
id: "cognite_reveal.IndexSet"
title: "Class: IndexSet"
sidebar_label: "IndexSet"
custom_edit_url: null
---

[@cognite/reveal](../modules/cognite_reveal.md).IndexSet

## Constructors

### constructor

• **new IndexSet**(`values?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `values?` | `Iterable`\<`number`\> |

#### Defined in

[packages/utilities/src/indexset/IndexSet.ts:13](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/utilities/src/indexset/IndexSet.ts#L13)

• **new IndexSet**(`values?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `values?` | [`NumericRange`](cognite_reveal.NumericRange.md) |

#### Defined in

[packages/utilities/src/indexset/IndexSet.ts:14](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/utilities/src/indexset/IndexSet.ts#L14)

## Properties

### rootNode

• `Optional` **rootNode**: `IndexNode`

#### Defined in

[packages/utilities/src/indexset/IndexSet.ts:11](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/utilities/src/indexset/IndexSet.ts#L11)

## Accessors

### count

• `get` **count**(): `number`

#### Returns

`number`

#### Defined in

[packages/utilities/src/indexset/IndexSet.ts:68](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/utilities/src/indexset/IndexSet.ts#L68)

## Methods

### add

▸ **add**(`index`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `index` | `number` |

#### Returns

`void`

#### Defined in

[packages/utilities/src/indexset/IndexSet.ts:33](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/utilities/src/indexset/IndexSet.ts#L33)

___

### addRange

▸ **addRange**(`range`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `range` | [`NumericRange`](cognite_reveal.NumericRange.md) |

#### Returns

`void`

#### Defined in

[packages/utilities/src/indexset/IndexSet.ts:39](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/utilities/src/indexset/IndexSet.ts#L39)

___

### clear

▸ **clear**(): `void`

#### Returns

`void`

#### Defined in

[packages/utilities/src/indexset/IndexSet.ts:211](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/utilities/src/indexset/IndexSet.ts#L211)

___

### clone

▸ **clone**(): [`IndexSet`](cognite_reveal.IndexSet.md)

#### Returns

[`IndexSet`](cognite_reveal.IndexSet.md)

#### Defined in

[packages/utilities/src/indexset/IndexSet.ts:215](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/utilities/src/indexset/IndexSet.ts#L215)

___

### contains

▸ **contains**(`index`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `index` | `number` |

#### Returns

`boolean`

#### Defined in

[packages/utilities/src/indexset/IndexSet.ts:60](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/utilities/src/indexset/IndexSet.ts#L60)

___

### differenceWith

▸ **differenceWith**(`otherSet`): [`IndexSet`](cognite_reveal.IndexSet.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `otherSet` | [`IndexSet`](cognite_reveal.IndexSet.md) |

#### Returns

[`IndexSet`](cognite_reveal.IndexSet.md)

#### Defined in

[packages/utilities/src/indexset/IndexSet.ts:135](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/utilities/src/indexset/IndexSet.ts#L135)

___

### forEachRange

▸ **forEachRange**(`visitor`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `visitor` | (`range`: [`NumericRange`](cognite_reveal.NumericRange.md)) => `void` |

#### Returns

`void`

#### Defined in

[packages/utilities/src/indexset/IndexSet.ts:27](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/utilities/src/indexset/IndexSet.ts#L27)

___

### hasIntersectionWith

▸ **hasIntersectionWith**(`otherSet`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `otherSet` | [`IndexSet`](cognite_reveal.IndexSet.md) \| `Set`\<`number`\> \| `Map`\<`number`, `number`\> |

#### Returns

`boolean`

#### Defined in

[packages/utilities/src/indexset/IndexSet.ts:145](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/utilities/src/indexset/IndexSet.ts#L145)

___

### intersectWith

▸ **intersectWith**(`otherSet`): [`IndexSet`](cognite_reveal.IndexSet.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `otherSet` | [`IndexSet`](cognite_reveal.IndexSet.md) |

#### Returns

[`IndexSet`](cognite_reveal.IndexSet.md)

#### Defined in

[packages/utilities/src/indexset/IndexSet.ts:171](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/utilities/src/indexset/IndexSet.ts#L171)

___

### invertedRanges

▸ **invertedRanges**(): [`NumericRange`](cognite_reveal.NumericRange.md)[]

#### Returns

[`NumericRange`](cognite_reveal.NumericRange.md)[]

#### Defined in

[packages/utilities/src/indexset/IndexSet.ts:105](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/utilities/src/indexset/IndexSet.ts#L105)

___

### remove

▸ **remove**(`index`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `index` | `number` |

#### Returns

`void`

#### Defined in

[packages/utilities/src/indexset/IndexSet.ts:47](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/utilities/src/indexset/IndexSet.ts#L47)

___

### removeRange

▸ **removeRange**(`range`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `range` | [`NumericRange`](cognite_reveal.NumericRange.md) |

#### Returns

`void`

#### Defined in

[packages/utilities/src/indexset/IndexSet.ts:52](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/utilities/src/indexset/IndexSet.ts#L52)

___

### toIndexArray

▸ **toIndexArray**(): `number`[]

#### Returns

`number`[]

#### Defined in

[packages/utilities/src/indexset/IndexSet.ts:84](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/utilities/src/indexset/IndexSet.ts#L84)

___

### toPlainSet

▸ **toPlainSet**(): `Set`\<`number`\>

#### Returns

`Set`\<`number`\>

#### Defined in

[packages/utilities/src/indexset/IndexSet.ts:98](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/utilities/src/indexset/IndexSet.ts#L98)

___

### toRangeArray

▸ **toRangeArray**(): [`NumericRange`](cognite_reveal.NumericRange.md)[]

#### Returns

[`NumericRange`](cognite_reveal.NumericRange.md)[]

#### Defined in

[packages/utilities/src/indexset/IndexSet.ts:76](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/utilities/src/indexset/IndexSet.ts#L76)

___

### unionWith

▸ **unionWith**(`otherSet`): [`IndexSet`](cognite_reveal.IndexSet.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `otherSet` | [`IndexSet`](cognite_reveal.IndexSet.md) |

#### Returns

[`IndexSet`](cognite_reveal.IndexSet.md)

#### Defined in

[packages/utilities/src/indexset/IndexSet.ts:123](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/utilities/src/indexset/IndexSet.ts#L123)
