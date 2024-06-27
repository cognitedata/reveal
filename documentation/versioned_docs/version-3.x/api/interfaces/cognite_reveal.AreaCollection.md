---
id: "cognite_reveal.AreaCollection"
title: "Interface: AreaCollection"
sidebar_label: "AreaCollection"
custom_edit_url: null
---

[@cognite/reveal](../modules/cognite_reveal.md).AreaCollection

Represents a collection of areas/axis-aligned
bounding boxes for use e.g. for load prioritization. Implementations
are not expected to store all areas inserted with `addAreas`,
but rather some "representative box set" covering the inserted areas.
Performance will be better the fewer boxes the representative set contains,
while the effectiveness of node prioritization will suffer if the
representative set covers too much area that is not part
of the inserted boxes

## Implemented by

- [`ClusteredAreaCollection`](../classes/cognite_reveal.ClusteredAreaCollection.md)

## Properties

### isEmpty

• `Readonly` **isEmpty**: `boolean`

#### Defined in

[packages/cad-styling/src/prioritized/AreaCollection.ts:16](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-styling/src/prioritized/AreaCollection.ts#L16)

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

#### Defined in

[packages/cad-styling/src/prioritized/AreaCollection.ts:34](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-styling/src/prioritized/AreaCollection.ts#L34)

___

### areas

▸ **areas**(): `Generator`\<`Box3`, `any`, `unknown`\>

Return some set of boxes that cover the boxes inserted with `addAreas`.
It is required that each inserted box is completely covered by some
subset of boxes in the set returned from `areas`

#### Returns

`Generator`\<`Box3`, `any`, `unknown`\>

#### Defined in

[packages/cad-styling/src/prioritized/AreaCollection.ts:23](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-styling/src/prioritized/AreaCollection.ts#L23)

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

#### Defined in

[packages/cad-styling/src/prioritized/AreaCollection.ts:43](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-styling/src/prioritized/AreaCollection.ts#L43)

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

#### Defined in

[packages/cad-styling/src/prioritized/AreaCollection.ts:28](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-styling/src/prioritized/AreaCollection.ts#L28)
