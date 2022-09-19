---
id: "cognite_reveal.InvertedNodeCollection"
title: "Class: InvertedNodeCollection"
sidebar_label: "InvertedNodeCollection"
custom_edit_url: null
---

[@cognite/reveal](../modules/cognite_reveal.md).InvertedNodeCollection

Node collection that inverts the result from another node collection.

## Hierarchy

- [`NodeCollection`](cognite_reveal.NodeCollection.md)

  ↳ **`InvertedNodeCollection`**

## Constructors

### constructor

• **new InvertedNodeCollection**(`model`, `innerSet`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `model` | [`CdfModelNodeCollectionDataProvider`](../interfaces/cognite_reveal.CdfModelNodeCollectionDataProvider.md) |
| `innerSet` | [`NodeCollection`](cognite_reveal.NodeCollection.md) |

#### Overrides

NodeCollection.constructor

#### Defined in

[packages/cad-styling/src/InvertedNodeCollection.ts:21](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/cad-styling/src/InvertedNodeCollection.ts#L21)

## Properties

### classToken

▪ `Static` `Readonly` **classToken**: ``"InvertedNodeCollection"``

#### Defined in

[packages/cad-styling/src/InvertedNodeCollection.ts:15](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/cad-styling/src/InvertedNodeCollection.ts#L15)

## Accessors

### classToken

• `get` **classToken**(): `string`

#### Returns

`string`

#### Inherited from

NodeCollection.classToken

#### Defined in

[packages/cad-styling/src/NodeCollection.ts:23](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/cad-styling/src/NodeCollection.ts#L23)

___

### isLoading

• `get` **isLoading**(): `boolean`

#### Returns

`boolean`

#### Overrides

NodeCollection.isLoading

#### Defined in

[packages/cad-styling/src/InvertedNodeCollection.ts:32](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/cad-styling/src/InvertedNodeCollection.ts#L32)

## Methods

### clear

▸ **clear**(): `never`

Not supported.

**`throws`** Always throws an error.

#### Returns

`never`

#### Overrides

[NodeCollection](cognite_reveal.NodeCollection.md).[clear](cognite_reveal.NodeCollection.md#clear)

#### Defined in

[packages/cad-styling/src/InvertedNodeCollection.ts:58](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/cad-styling/src/InvertedNodeCollection.ts#L58)

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

[packages/cad-styling/src/InvertedNodeCollection.ts:47](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/cad-styling/src/InvertedNodeCollection.ts#L47)

___

### getIndexSet

▸ **getIndexSet**(): [`IndexSet`](cognite_reveal.IndexSet.md)

#### Returns

[`IndexSet`](cognite_reveal.IndexSet.md)

#### Overrides

[NodeCollection](cognite_reveal.NodeCollection.md).[getIndexSet](cognite_reveal.NodeCollection.md#getindexset)

#### Defined in

[packages/cad-styling/src/InvertedNodeCollection.ts:36](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/cad-styling/src/InvertedNodeCollection.ts#L36)

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

[packages/cad-styling/src/NodeCollection.ts:32](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/cad-styling/src/NodeCollection.ts#L32)

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

[packages/cad-styling/src/NodeCollection.ts:27](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/cad-styling/src/NodeCollection.ts#L27)

___

### serialize

▸ **serialize**(): [`SerializedNodeCollection`](../modules/cognite_reveal.md#serializednodecollection)

#### Returns

[`SerializedNodeCollection`](../modules/cognite_reveal.md#serializednodecollection)

#### Overrides

[NodeCollection](cognite_reveal.NodeCollection.md).[serialize](cognite_reveal.NodeCollection.md#serialize)

#### Defined in

[packages/cad-styling/src/InvertedNodeCollection.ts:51](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/cad-styling/src/InvertedNodeCollection.ts#L51)
