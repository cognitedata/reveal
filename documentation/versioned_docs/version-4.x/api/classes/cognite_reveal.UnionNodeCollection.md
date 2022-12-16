---
id: "cognite_reveal.UnionNodeCollection"
title: "Class: UnionNodeCollection"
sidebar_label: "UnionNodeCollection"
custom_edit_url: null
---

[@cognite/reveal](../modules/cognite_reveal.md).UnionNodeCollection

Node collection that takes the set union of multiple node collections.

## Hierarchy

- [`CombineNodeCollectionBase`](cognite_reveal.CombineNodeCollectionBase.md)

  ↳ **`UnionNodeCollection`**

## Constructors

### constructor

• **new UnionNodeCollection**(`nodeCollections?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `nodeCollections?` | [`NodeCollection`](cognite_reveal.NodeCollection.md)[] |

#### Overrides

[CombineNodeCollectionBase](cognite_reveal.CombineNodeCollectionBase.md).[constructor](cognite_reveal.CombineNodeCollectionBase.md#constructor)

#### Defined in

[packages/cad-styling/src/UnionNodeCollection.ts:21](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/cad-styling/src/UnionNodeCollection.ts#L21)

## Properties

### classToken

▪ `Static` `Readonly` **classToken**: ``"UnionNodeCollection"``

#### Defined in

[packages/cad-styling/src/UnionNodeCollection.ts:19](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/cad-styling/src/UnionNodeCollection.ts#L19)

## Accessors

### classToken

• `get` **classToken**(): `string`

#### Returns

`string`

#### Inherited from

CombineNodeCollectionBase.classToken

#### Defined in

[packages/cad-styling/src/NodeCollection.ts:23](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/cad-styling/src/NodeCollection.ts#L23)

___

### isLoading

• `get` **isLoading**(): `boolean`

#### Returns

`boolean`

#### Inherited from

CombineNodeCollectionBase.isLoading

#### Defined in

[packages/cad-styling/src/CombineNodeCollectionBase.ts:67](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts#L67)

## Methods

### add

▸ **add**(`nodeCollection`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `nodeCollection` | [`NodeCollection`](cognite_reveal.NodeCollection.md) |

#### Returns

`void`

#### Inherited from

[CombineNodeCollectionBase](cognite_reveal.CombineNodeCollectionBase.md).[add](cognite_reveal.CombineNodeCollectionBase.md#add)

#### Defined in

[packages/cad-styling/src/CombineNodeCollectionBase.ts:26](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts#L26)

___

### clear

▸ **clear**(): `void`

Clears all underlying node collections.

#### Returns

`void`

#### Inherited from

[CombineNodeCollectionBase](cognite_reveal.CombineNodeCollectionBase.md).[clear](cognite_reveal.CombineNodeCollectionBase.md#clear)

#### Defined in

[packages/cad-styling/src/CombineNodeCollectionBase.ts:46](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts#L46)

___

### getAreas

▸ **getAreas**(): [`AreaCollection`](../interfaces/cognite_reveal.AreaCollection.md)

Returns areas surrounding the nodes in the collection. The areas
are boxes in "ThreeJS coordinates". Note that not all
implementations supports this.

#### Returns

[`AreaCollection`](../interfaces/cognite_reveal.AreaCollection.md)

#### Overrides

[CombineNodeCollectionBase](cognite_reveal.CombineNodeCollectionBase.md).[getAreas](cognite_reveal.CombineNodeCollectionBase.md#getareas)

#### Defined in

[packages/cad-styling/src/UnionNodeCollection.ts:45](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/cad-styling/src/UnionNodeCollection.ts#L45)

___

### getIndexSet

▸ **getIndexSet**(): [`IndexSet`](cognite_reveal.IndexSet.md)

#### Returns

[`IndexSet`](cognite_reveal.IndexSet.md)

#### Inherited from

[CombineNodeCollectionBase](cognite_reveal.CombineNodeCollectionBase.md).[getIndexSet](cognite_reveal.CombineNodeCollectionBase.md#getindexset)

#### Defined in

[packages/cad-styling/src/CombineNodeCollectionBase.ts:59](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts#L59)

___

### off

▸ **off**(`event`, `listener`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

#### Returns

`void`

#### Inherited from

[CombineNodeCollectionBase](cognite_reveal.CombineNodeCollectionBase.md).[off](cognite_reveal.CombineNodeCollectionBase.md#off)

#### Defined in

[packages/cad-styling/src/NodeCollection.ts:32](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/cad-styling/src/NodeCollection.ts#L32)

___

### on

▸ **on**(`event`, `listener`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

#### Returns

`void`

#### Inherited from

[CombineNodeCollectionBase](cognite_reveal.CombineNodeCollectionBase.md).[on](cognite_reveal.CombineNodeCollectionBase.md#on)

#### Defined in

[packages/cad-styling/src/NodeCollection.ts:27](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/cad-styling/src/NodeCollection.ts#L27)

___

### remove

▸ **remove**(`nodeCollection`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `nodeCollection` | [`NodeCollection`](cognite_reveal.NodeCollection.md) |

#### Returns

`void`

#### Inherited from

[CombineNodeCollectionBase](cognite_reveal.CombineNodeCollectionBase.md).[remove](cognite_reveal.CombineNodeCollectionBase.md#remove)

#### Defined in

[packages/cad-styling/src/CombineNodeCollectionBase.ts:32](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts#L32)

___

### serialize

▸ **serialize**(): [`SerializedNodeCollection`](../modules/cognite_reveal.md#serializednodecollection)

#### Returns

[`SerializedNodeCollection`](../modules/cognite_reveal.md#serializednodecollection)

#### Overrides

[CombineNodeCollectionBase](cognite_reveal.CombineNodeCollectionBase.md).[serialize](cognite_reveal.CombineNodeCollectionBase.md#serialize)

#### Defined in

[packages/cad-styling/src/UnionNodeCollection.ts:25](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/cad-styling/src/UnionNodeCollection.ts#L25)
