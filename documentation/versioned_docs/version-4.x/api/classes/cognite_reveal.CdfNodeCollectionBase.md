---
id: "cognite_reveal.CdfNodeCollectionBase"
title: "Class: CdfNodeCollectionBase"
sidebar_label: "CdfNodeCollectionBase"
custom_edit_url: null
---

[@cognite/reveal](../modules/cognite_reveal.md).CdfNodeCollectionBase

Abstract class for implementing a set of nodes to be styled.

## Hierarchy

- [`NodeCollection`](cognite_reveal.NodeCollection.md)

  ↳ **`CdfNodeCollectionBase`**

  ↳↳ [`NodeIdNodeCollection`](cognite_reveal.NodeIdNodeCollection.md)

  ↳↳ [`PropertyFilterNodeCollection`](cognite_reveal.PropertyFilterNodeCollection.md)

  ↳↳ [`SinglePropertyFilterNodeCollection`](cognite_reveal.SinglePropertyFilterNodeCollection.md)

## Constructors

### constructor

• **new CdfNodeCollectionBase**(`classToken`, `model`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `classToken` | `string` |
| `model` | [`CdfModelNodeCollectionDataProvider`](../interfaces/cognite_reveal.CdfModelNodeCollectionDataProvider.md) |

#### Overrides

NodeCollection.constructor

#### Defined in

[packages/cad-styling/src/CdfNodeCollectionBase.ts:20](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/cad-styling/src/CdfNodeCollectionBase.ts#L20)

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

[packages/cad-styling/src/CdfNodeCollectionBase.ts:25](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/cad-styling/src/CdfNodeCollectionBase.ts#L25)

## Methods

### clear

▸ **clear**(): `void`

Clears the node collection and interrupts any ongoing operations.

#### Returns

`void`

#### Overrides

[NodeCollection](cognite_reveal.NodeCollection.md).[clear](cognite_reveal.NodeCollection.md#clear)

#### Defined in

[packages/cad-styling/src/CdfNodeCollectionBase.ts:69](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/cad-styling/src/CdfNodeCollectionBase.ts#L69)

___

### getAreas

▸ **getAreas**(): [`AreaCollection`](../interfaces/cognite_reveal.AreaCollection.md)

Returns areas surrounding the nodes in the collection. The areas
are boxes in "ThreeJS coordinates". Note that not all
implementations supports this.

#### Returns

[`AreaCollection`](../interfaces/cognite_reveal.AreaCollection.md)

#### Overrides

[NodeCollection](cognite_reveal.NodeCollection.md).[getAreas](cognite_reveal.NodeCollection.md#getareas)

#### Defined in

[packages/cad-styling/src/CdfNodeCollectionBase.ts:81](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/cad-styling/src/CdfNodeCollectionBase.ts#L81)

___

### getIndexSet

▸ **getIndexSet**(): [`IndexSet`](cognite_reveal.IndexSet.md)

#### Returns

[`IndexSet`](cognite_reveal.IndexSet.md)

#### Overrides

[NodeCollection](cognite_reveal.NodeCollection.md).[getIndexSet](cognite_reveal.NodeCollection.md#getindexset)

#### Defined in

[packages/cad-styling/src/CdfNodeCollectionBase.ts:77](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/cad-styling/src/CdfNodeCollectionBase.ts#L77)

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

### serialize

▸ `Abstract` **serialize**(): [`SerializedNodeCollection`](../modules/cognite_reveal.md#serializednodecollection)

#### Returns

[`SerializedNodeCollection`](../modules/cognite_reveal.md#serializednodecollection)

#### Inherited from

[NodeCollection](cognite_reveal.NodeCollection.md).[serialize](cognite_reveal.NodeCollection.md#serialize)

#### Defined in

[packages/cad-styling/src/NodeCollection.ts:46](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/cad-styling/src/NodeCollection.ts#L46)
