---
id: "cognite_reveal.NodeCollection"
title: "Class: NodeCollection"
sidebar_label: "NodeCollection"
custom_edit_url: null
---

[@cognite/reveal](../modules/cognite_reveal.md).NodeCollection

Abstract class for implementing a set of nodes to be styled.

## Hierarchy

- **`NodeCollection`**

  ↳ [`TreeIndexNodeCollection`](cognite_reveal.TreeIndexNodeCollection.md)

  ↳ [`PropertyFilterNodeCollection`](cognite_reveal.PropertyFilterNodeCollection.md)

  ↳ [`SinglePropertyFilterNodeCollection`](cognite_reveal.SinglePropertyFilterNodeCollection.md)

  ↳ [`AssetNodeCollection`](cognite_reveal.AssetNodeCollection.md)

  ↳ [`InvertedNodeCollection`](cognite_reveal.InvertedNodeCollection.md)

## Accessors

### classToken

• `get` **classToken**(): `string`

#### Returns

`string`

#### Defined in

[packages/cad-styling/src/NodeCollection.ts:23](https://github.com/cognitedata/reveal/blob/8cfa4004b/viewer/packages/cad-styling/src/NodeCollection.ts#L23)

___

### isLoading

• `Abstract` `get` **isLoading**(): `boolean`

#### Returns

`boolean`

#### Defined in

[packages/cad-styling/src/NodeCollection.ts:37](https://github.com/cognitedata/reveal/blob/8cfa4004b/viewer/packages/cad-styling/src/NodeCollection.ts#L37)

## Methods

### clear

▸ `Abstract` **clear**(): `void`

#### Returns

`void`

#### Defined in

[packages/cad-styling/src/NodeCollection.ts:45](https://github.com/cognitedata/reveal/blob/8cfa4004b/viewer/packages/cad-styling/src/NodeCollection.ts#L45)

___

### getAreas

▸ `Abstract` **getAreas**(): [`AreaCollection`](../interfaces/cognite_reveal.AreaCollection.md)

Returns areas surrounding the nodes in the collection. The areas
are boxes in "ThreeJS coordinates". Note that not all
implementations supports this.

#### Returns

[`AreaCollection`](../interfaces/cognite_reveal.AreaCollection.md)

#### Defined in

[packages/cad-styling/src/NodeCollection.ts:44](https://github.com/cognitedata/reveal/blob/8cfa4004b/viewer/packages/cad-styling/src/NodeCollection.ts#L44)

___

### getIndexSet

▸ `Abstract` **getIndexSet**(): [`IndexSet`](cognite_reveal.IndexSet.md)

#### Returns

[`IndexSet`](cognite_reveal.IndexSet.md)

#### Defined in

[packages/cad-styling/src/NodeCollection.ts:38](https://github.com/cognitedata/reveal/blob/8cfa4004b/viewer/packages/cad-styling/src/NodeCollection.ts#L38)

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

#### Defined in

[packages/cad-styling/src/NodeCollection.ts:32](https://github.com/cognitedata/reveal/blob/8cfa4004b/viewer/packages/cad-styling/src/NodeCollection.ts#L32)

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

#### Defined in

[packages/cad-styling/src/NodeCollection.ts:27](https://github.com/cognitedata/reveal/blob/8cfa4004b/viewer/packages/cad-styling/src/NodeCollection.ts#L27)

___

### serialize

▸ `Abstract` **serialize**(): [`SerializedNodeCollection`](../modules/cognite_reveal.md#serializednodecollection)

#### Returns

[`SerializedNodeCollection`](../modules/cognite_reveal.md#serializednodecollection)

#### Defined in

[packages/cad-styling/src/NodeCollection.ts:46](https://github.com/cognitedata/reveal/blob/8cfa4004b/viewer/packages/cad-styling/src/NodeCollection.ts#L46)
