---
id: "cognite_reveal.SinglePropertyFilterNodeCollection"
title: "Class: SinglePropertyFilterNodeCollection"
sidebar_label: "SinglePropertyFilterNodeCollection"
custom_edit_url: null
---

[@cognite/reveal](../modules/cognite_reveal.md).SinglePropertyFilterNodeCollection

Node collection that filters nodes based on a node property from a list of values, similarly to how
`SELECT ... IN (...)` works. This is useful when looking up nodes based on a list of identifiers,
nodes within a set of areas or systems. The node set is optimized for matching with properties with
a large number of values (i.e. thousands).

## Hierarchy

- [`CdfNodeCollectionBase`](cognite_reveal.CdfNodeCollectionBase.md)

  ↳ **`SinglePropertyFilterNodeCollection`**

## Constructors

### constructor

• **new SinglePropertyFilterNodeCollection**(`client`, `model`, `options?`)

Construct a new node set.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `client` | `default` | CogniteClient authenticated to the project the model is loaded from. |
| `model` | [`CdfModelNodeCollectionDataProvider`](../interfaces/cognite_reveal.CdfModelNodeCollectionDataProvider.md) | CAD model. |
| `options` | [`PropertyFilterNodeCollectionOptions`](../modules/cognite_reveal.md#propertyfilternodecollectionoptions) |  |

#### Overrides

[CdfNodeCollectionBase](cognite_reveal.CdfNodeCollectionBase.md).[constructor](cognite_reveal.CdfNodeCollectionBase.md#constructor)

#### Defined in

[packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts:41](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts#L41)

## Properties

### classToken

▪ `Static` `Readonly` **classToken**: ``"SinglePropertyNodeCollection"``

#### Defined in

[packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts:24](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts#L24)

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

▸ **executeFilter**(`propertyCategory`, `propertyKey`, `propertyValues`): `Promise`\<`void`\>

Execute filter asynchronously, replacing any existing filter active. When propertyValues
contains more than 1000 elements, the operation will be split into multiple batches that
are executed in parallel. Note that when providing a [requestPartitions](../modules/cognite_reveal.md#requestpartitions)
during construction of the node set, the total number of batches will be requestPartitions*numberOfBatches.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `propertyCategory` | `string` | Node property category, e.g. `'PDMS'`. |
| `propertyKey` | `string` | Node property key, e.g. `':FU'`. |
| `propertyValues` | `string`[] | Lookup values, e.g. `["AR100APG539","AP500INF534","AP400INF553", ...]` |

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts:62](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts#L62)

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

[packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts:97](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts#L97)
