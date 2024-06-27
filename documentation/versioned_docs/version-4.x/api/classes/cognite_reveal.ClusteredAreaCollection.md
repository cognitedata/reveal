---
id: "cognite_reveal.ClusteredAreaCollection"
title: "Class: ClusteredAreaCollection"
sidebar_label: "ClusteredAreaCollection"
custom_edit_url: null
---

[@cognite/reveal](../modules/cognite_reveal.md).ClusteredAreaCollection

AreaCollection that stores a representative box set by merging
inserted boxes that are overlapping or close to each other.
It uses simple heuristics to determine which boxes are to be merged.

## Implements

- [`AreaCollection`](../interfaces/cognite_reveal.AreaCollection.md)

## Constructors

### constructor

• **new ClusteredAreaCollection**()

## Accessors

### isEmpty

• `get` **isEmpty**(): `boolean`

#### Returns

`boolean`

#### Implementation of

[AreaCollection](../interfaces/cognite_reveal.AreaCollection.md).[isEmpty](../interfaces/cognite_reveal.AreaCollection.md#isempty)

#### Defined in

[packages/cad-styling/src/prioritized/ClusteredAreaCollection.ts:16](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/prioritized/ClusteredAreaCollection.ts#L16)

## Methods

### addAreas

▸ **addAreas**(`boxes`): `void`

Add areas to be covered by the representative set of this
AreaCollection.

#### Parameters

| Name | Type |
| :------ | :------ |
| `boxes` | `Iterable`\<`Box3`\> |

#### Returns

`void`

#### Implementation of

[AreaCollection](../interfaces/cognite_reveal.AreaCollection.md).[addAreas](../interfaces/cognite_reveal.AreaCollection.md#addareas)

#### Defined in

[packages/cad-styling/src/prioritized/ClusteredAreaCollection.ts:34](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/prioritized/ClusteredAreaCollection.ts#L34)

___

### areas

▸ **areas**(): `Generator`\<`Box3`, `any`, `unknown`\>

Return some set of boxes that cover the boxes inserted with `addAreas`.
It is required that each inserted box is completely covered by some
subset of boxes in the set returned from `areas`

#### Returns

`Generator`\<`Box3`, `any`, `unknown`\>

#### Implementation of

[AreaCollection](../interfaces/cognite_reveal.AreaCollection.md).[areas](../interfaces/cognite_reveal.AreaCollection.md#areas)

#### Defined in

[packages/cad-styling/src/prioritized/ClusteredAreaCollection.ts:20](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/prioritized/ClusteredAreaCollection.ts#L20)

___

### intersectWith

▸ **intersectWith**(`boxes`): `void`

Alter the representative set to cover only the intersection between the
representative set of this AreaCollection and the incoming boxes.
Note that the intersection of two representative sets A' and B' that
represent the original box sets A and B will cover the intersection between
A and B, and will thus be a valid representative set for the intersection of A and B.

#### Parameters

| Name | Type |
| :------ | :------ |
| `boxes` | `Iterable`\<`Box3`\> |

#### Returns

`void`

#### Implementation of

[AreaCollection](../interfaces/cognite_reveal.AreaCollection.md).[intersectWith](../interfaces/cognite_reveal.AreaCollection.md#intersectwith)

#### Defined in

[packages/cad-styling/src/prioritized/ClusteredAreaCollection.ts:38](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/prioritized/ClusteredAreaCollection.ts#L38)

___

### intersectsBox

▸ **intersectsBox**(`box`): `boolean`

Return whether the input box intersects the AreaCollection.

#### Parameters

| Name | Type |
| :------ | :------ |
| `box` | `Box3` |

#### Returns

`boolean`

#### Implementation of

[AreaCollection](../interfaces/cognite_reveal.AreaCollection.md).[intersectsBox](../interfaces/cognite_reveal.AreaCollection.md#intersectsbox)

#### Defined in

[packages/cad-styling/src/prioritized/ClusteredAreaCollection.ts:24](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/prioritized/ClusteredAreaCollection.ts#L24)
