---
id: "cognite_reveal.CombineNodeCollectionBase"
title: "Class: CombineNodeCollectionBase"
sidebar_label: "CombineNodeCollectionBase"
custom_edit_url: null
---

[@cognite/reveal](../modules/cognite_reveal.md).CombineNodeCollectionBase

Node collection that combines the result from multiple underlying node collections.

## Hierarchy

- [`NodeCollection`](cognite_reveal.NodeCollection.md)

  ↳ **`CombineNodeCollectionBase`**

  ↳↳ [`IntersectionNodeCollection`](cognite_reveal.IntersectionNodeCollection.md)

  ↳↳ [`UnionNodeCollection`](cognite_reveal.UnionNodeCollection.md)

## Constructors

### constructor

• **new CombineNodeCollectionBase**(`classToken`, `nodeCollections?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `classToken` | `string` |
| `nodeCollections?` | [`NodeCollection`](cognite_reveal.NodeCollection.md)[] |

#### Overrides

NodeCollection.constructor

#### Defined in

[packages/cad-styling/src/CombineNodeCollectionBase.ts:17](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts#L17)

## Accessors

### classToken

• `get` **classToken**(): `string`

#### Returns

`string`

#### Inherited from

NodeCollection.classToken

#### Defined in

[packages/cad-styling/src/NodeCollection.ts:23](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/cad-styling/src/NodeCollection.ts#L23)

___

### isLoading

• `get` **isLoading**(): `boolean`

#### Returns

`boolean`

#### Overrides

NodeCollection.isLoading

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

#### Defined in

[packages/cad-styling/src/CombineNodeCollectionBase.ts:26](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts#L26)

___

### clear

▸ **clear**(): `void`

Clears all underlying node collections.

#### Returns

`void`

#### Overrides

[NodeCollection](cognite_reveal.NodeCollection.md).[clear](cognite_reveal.NodeCollection.md#clear)

#### Defined in

[packages/cad-styling/src/CombineNodeCollectionBase.ts:46](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts#L46)

___

### getAreas

▸ `Abstract` **getAreas**(): [`AreaCollection`](../interfaces/cognite_reveal.AreaCollection.md)

Returns areas surrounding the nodes in the collection. The areas
are boxes in "ThreeJS coordinates". Note that not all
implementations supports this.

#### Returns

[`AreaCollection`](../interfaces/cognite_reveal.AreaCollection.md)

#### Overrides

[NodeCollection](cognite_reveal.NodeCollection.md).[getAreas](cognite_reveal.NodeCollection.md#getareas)

#### Defined in

[packages/cad-styling/src/CombineNodeCollectionBase.ts:73](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts#L73)

___

### getIndexSet

▸ **getIndexSet**(): [`IndexSet`](cognite_reveal.IndexSet.md)

#### Returns

[`IndexSet`](cognite_reveal.IndexSet.md)

#### Overrides

[NodeCollection](cognite_reveal.NodeCollection.md).[getIndexSet](cognite_reveal.NodeCollection.md#getindexset)

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

[NodeCollection](cognite_reveal.NodeCollection.md).[off](cognite_reveal.NodeCollection.md#off)

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

[NodeCollection](cognite_reveal.NodeCollection.md).[on](cognite_reveal.NodeCollection.md#on)

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

#### Defined in

[packages/cad-styling/src/CombineNodeCollectionBase.ts:32](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts#L32)

___

### serialize

▸ `Abstract` **serialize**(): [`SerializedNodeCollection`](../modules/cognite_reveal.md#serializednodecollection)

#### Returns

[`SerializedNodeCollection`](../modules/cognite_reveal.md#serializednodecollection)

#### Overrides

[NodeCollection](cognite_reveal.NodeCollection.md).[serialize](cognite_reveal.NodeCollection.md#serialize)

#### Defined in

[packages/cad-styling/src/CombineNodeCollectionBase.ts:71](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts#L71)
