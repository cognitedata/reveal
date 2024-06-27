---
id: "cognite_reveal.NodeIdNodeCollection"
title: "Class: NodeIdNodeCollection"
sidebar_label: "NodeIdNodeCollection"
custom_edit_url: null
---

[@cognite/reveal](../modules/cognite_reveal.md).NodeIdNodeCollection

Collection that holds a set of nodes including children identified by nodeIds. Note that
this involves remapping IDs to "tree indices" and subtree sized used by Reveal using
the CDF API. Its often better to use one of the other node collections or \{@see TreeIndexNodeCollection}
whenever possible for best performance.

## Hierarchy

- [`CdfNodeCollectionBase`](cognite_reveal.CdfNodeCollectionBase.md)

  ↳ **`NodeIdNodeCollection`**

## Constructors

### constructor

• **new NodeIdNodeCollection**(`client`, `model`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `client` | `default` |
| `model` | [`CdfModelNodeCollectionDataProvider`](../interfaces/cognite_reveal.CdfModelNodeCollectionDataProvider.md) |

#### Overrides

[CdfNodeCollectionBase](cognite_reveal.CdfNodeCollectionBase.md).[constructor](cognite_reveal.CdfNodeCollectionBase.md#constructor)

#### Defined in

[packages/cad-styling/src/NodeIdNodeCollection.ts:25](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/NodeIdNodeCollection.ts#L25)

## Properties

### classToken

▪ `Static` `Readonly` **classToken**: ``"NodeIdNodeCollection"``

#### Defined in

[packages/cad-styling/src/NodeIdNodeCollection.ts:18](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/NodeIdNodeCollection.ts#L18)

## Accessors

### classToken

• `get` **classToken**(): `string`

#### Returns

`string`

#### Inherited from

CdfNodeCollectionBase.classToken

#### Defined in

[packages/cad-styling/src/NodeCollection.ts:23](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/NodeCollection.ts#L23)

___

### isLoading

• `get` **isLoading**(): `boolean`

#### Returns

`boolean`

#### Inherited from

CdfNodeCollectionBase.isLoading

#### Defined in

[packages/cad-styling/src/CdfNodeCollectionBase.ts:25](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/CdfNodeCollectionBase.ts#L25)

## Methods

### clear

▸ **clear**(): `void`

Clears the node collection and interrupts any ongoing operations.

#### Returns

`void`

#### Inherited from

[CdfNodeCollectionBase](cognite_reveal.CdfNodeCollectionBase.md).[clear](cognite_reveal.CdfNodeCollectionBase.md#clear)

#### Defined in

[packages/cad-styling/src/CdfNodeCollectionBase.ts:69](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/CdfNodeCollectionBase.ts#L69)

___

### executeFilter

▸ **executeFilter**(`nodeIds`): `Promise`\<`void`\>

Populates the collection with the nodes with the IDs provided. All children of
the nodes are also included in the collection.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `nodeIds` | `number`[] | IDs of nodes to include in the collection. |

#### Returns

`Promise`\<`void`\>

Promise that resolves when the collection is populated.

#### Defined in

[packages/cad-styling/src/NodeIdNodeCollection.ts:37](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/NodeIdNodeCollection.ts#L37)

___

### getAreas

▸ **getAreas**(): [`AreaCollection`](../interfaces/cognite_reveal.AreaCollection.md)

Returns areas surrounding the nodes in the collection. The areas
are boxes in "ThreeJS coordinates". Note that not all
implementations supports this.

#### Returns

[`AreaCollection`](../interfaces/cognite_reveal.AreaCollection.md)

#### Inherited from

[CdfNodeCollectionBase](cognite_reveal.CdfNodeCollectionBase.md).[getAreas](cognite_reveal.CdfNodeCollectionBase.md#getareas)

#### Defined in

[packages/cad-styling/src/CdfNodeCollectionBase.ts:81](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/CdfNodeCollectionBase.ts#L81)

___

### getIndexSet

▸ **getIndexSet**(): [`IndexSet`](cognite_reveal.IndexSet.md)

#### Returns

[`IndexSet`](cognite_reveal.IndexSet.md)

#### Inherited from

[CdfNodeCollectionBase](cognite_reveal.CdfNodeCollectionBase.md).[getIndexSet](cognite_reveal.CdfNodeCollectionBase.md#getindexset)

#### Defined in

[packages/cad-styling/src/CdfNodeCollectionBase.ts:77](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/CdfNodeCollectionBase.ts#L77)

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

[CdfNodeCollectionBase](cognite_reveal.CdfNodeCollectionBase.md).[off](cognite_reveal.CdfNodeCollectionBase.md#off)

#### Defined in

[packages/cad-styling/src/NodeCollection.ts:32](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/NodeCollection.ts#L32)

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

[CdfNodeCollectionBase](cognite_reveal.CdfNodeCollectionBase.md).[on](cognite_reveal.CdfNodeCollectionBase.md#on)

#### Defined in

[packages/cad-styling/src/NodeCollection.ts:27](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/NodeCollection.ts#L27)

___

### serialize

▸ **serialize**(): [`SerializedNodeCollection`](../modules/cognite_reveal.md#serializednodecollection)

#### Returns

[`SerializedNodeCollection`](../modules/cognite_reveal.md#serializednodecollection)

#### Overrides

[CdfNodeCollectionBase](cognite_reveal.CdfNodeCollectionBase.md).[serialize](cognite_reveal.CdfNodeCollectionBase.md#serialize)

#### Defined in

[packages/cad-styling/src/NodeIdNodeCollection.ts:58](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/NodeIdNodeCollection.ts#L58)

___

### deserialize

▸ `Static` **deserialize**(`descriptor`, `context`): `Promise`\<[`NodeIdNodeCollection`](cognite_reveal.NodeIdNodeCollection.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `descriptor` | [`SerializedNodeCollection`](../modules/cognite_reveal.md#serializednodecollection) |
| `context` | [`NodeCollectionSerializationContext`](../modules/cognite_reveal.md#nodecollectionserializationcontext) |

#### Returns

`Promise`\<[`NodeIdNodeCollection`](cognite_reveal.NodeIdNodeCollection.md)\>

#### Defined in

[packages/cad-styling/src/NodeIdNodeCollection.ts:65](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/NodeIdNodeCollection.ts#L65)
