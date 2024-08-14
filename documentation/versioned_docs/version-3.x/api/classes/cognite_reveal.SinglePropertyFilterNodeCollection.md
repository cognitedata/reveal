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

- [`NodeCollection`](cognite_reveal.NodeCollection.md)

  ↳ **`SinglePropertyFilterNodeCollection`**

## Constructors

### constructor

• **new SinglePropertyFilterNodeCollection**(`client`, `model`, `options?`)

Construct a new node set.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `client` | `default` | \{@link CogniteClient} authenticated to the project the model is loaded from. |
| `model` | [`CdfModelNodeCollectionDataProvider`](../interfaces/cognite_reveal.CdfModelNodeCollectionDataProvider.md) | CAD model. |
| `options` | `PropertyFilterNodeCollectionOptions` |  |

#### Overrides

NodeCollection.constructor

#### Defined in

[packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts:50](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts#L50)

## Properties

### classToken

▪ `Static` `Readonly` **classToken**: ``"SinglePropertyNodeCollection"``

#### Defined in

[packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts:29](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts#L29)

## Accessors

### classToken

• `get` **classToken**(): `string`

#### Returns

`string`

#### Inherited from

NodeCollection.classToken

#### Defined in

[packages/cad-styling/src/NodeCollection.ts:23](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-styling/src/NodeCollection.ts#L23)

___

### isLoading

• `get` **isLoading**(): `boolean`

#### Returns

`boolean`

#### Overrides

NodeCollection.isLoading

#### Defined in

[packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts:61](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts#L61)

## Methods

### clear

▸ **clear**(): `void`

Clears the node set and interrupts any ongoing operations.

#### Returns

`void`

#### Overrides

[NodeCollection](cognite_reveal.NodeCollection.md).[clear](cognite_reveal.NodeCollection.md#clear)

#### Defined in

[packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts:125](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts#L125)

___

### executeFilter

▸ **executeFilter**(`propertyCategory`, `propertyKey`, `propertyValues`): `Promise`\<`void`\>

Execute filter asynchronously, replacing any existing filter active. When \{@link propertyValues}
contains more than 1000 elements, the operation will be split into multiple batches that
are executed in parallel. Note that when providing a \{@link PropertyFilterNodeCollectionOptions.requestPartitions}
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

[packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts:75](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts#L75)

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

[packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts:137](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts#L137)

___

### getIndexSet

▸ **getIndexSet**(): [`IndexSet`](cognite_reveal.IndexSet.md)

#### Returns

[`IndexSet`](cognite_reveal.IndexSet.md)

#### Overrides

[NodeCollection](cognite_reveal.NodeCollection.md).[getIndexSet](cognite_reveal.NodeCollection.md#getindexset)

#### Defined in

[packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts:133](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts#L133)

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

[packages/cad-styling/src/NodeCollection.ts:32](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-styling/src/NodeCollection.ts#L32)

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

[packages/cad-styling/src/NodeCollection.ts:27](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-styling/src/NodeCollection.ts#L27)

___

### serialize

▸ **serialize**(): [`SerializedNodeCollection`](../modules/cognite_reveal.md#serializednodecollection)

#### Returns

[`SerializedNodeCollection`](../modules/cognite_reveal.md#serializednodecollection)

#### Overrides

[NodeCollection](cognite_reveal.NodeCollection.md).[serialize](cognite_reveal.NodeCollection.md#serialize)

#### Defined in

[packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts:147](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts#L147)
