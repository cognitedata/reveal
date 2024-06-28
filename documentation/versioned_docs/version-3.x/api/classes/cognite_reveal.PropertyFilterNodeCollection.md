---
id: "cognite_reveal.PropertyFilterNodeCollection"
title: "Class: PropertyFilterNodeCollection"
sidebar_label: "PropertyFilterNodeCollection"
custom_edit_url: null
---

[@cognite/reveal](../modules/cognite_reveal.md).PropertyFilterNodeCollection

Represents a set of nodes that has matching node properties to a provided filter. Note that
a node is considered to match if it or a [NodeCollection](cognite_reveal.NodeCollection.md) ancestors match the filter.

## Hierarchy

- [`NodeCollection`](cognite_reveal.NodeCollection.md)

  ↳ **`PropertyFilterNodeCollection`**

## Constructors

### constructor

• **new PropertyFilterNodeCollection**(`client`, `model`, `options?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `client` | `default` |
| `model` | [`CdfModelNodeCollectionDataProvider`](../interfaces/cognite_reveal.CdfModelNodeCollectionDataProvider.md) |
| `options` | `PropertyFilterNodeCollectionOptions` |

#### Overrides

NodeCollection.constructor

#### Defined in

[packages/cad-styling/src/PropertyFilterNodeCollection.ts:53](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-styling/src/PropertyFilterNodeCollection.ts#L53)

## Properties

### classToken

▪ `Static` `Readonly` **classToken**: ``"PropertyFilterNodeCollection"``

#### Defined in

[packages/cad-styling/src/PropertyFilterNodeCollection.ts:38](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-styling/src/PropertyFilterNodeCollection.ts#L38)

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

[packages/cad-styling/src/PropertyFilterNodeCollection.ts:64](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-styling/src/PropertyFilterNodeCollection.ts#L64)

## Methods

### clear

▸ **clear**(): `void`

Clears the node collection and interrupts any ongoing operations.

#### Returns

`void`

#### Overrides

[NodeCollection](cognite_reveal.NodeCollection.md).[clear](cognite_reveal.NodeCollection.md#clear)

#### Defined in

[packages/cad-styling/src/PropertyFilterNodeCollection.ts:126](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-styling/src/PropertyFilterNodeCollection.ts#L126)

___

### executeFilter

▸ **executeFilter**(`filter`): `Promise`\<`void`\>

Populates the node collection with nodes matching the provided filter. This will replace
the current nodes held by the filter.

**`example`**
```
set.executeFilter({ 'PDMS': { 'Module': 'AQ550' }});
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `filter` | `Object` | A filter for matching node properties. |

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/cad-styling/src/PropertyFilterNodeCollection.ts:77](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-styling/src/PropertyFilterNodeCollection.ts#L77)

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

[packages/cad-styling/src/PropertyFilterNodeCollection.ts:138](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-styling/src/PropertyFilterNodeCollection.ts#L138)

___

### getIndexSet

▸ **getIndexSet**(): [`IndexSet`](cognite_reveal.IndexSet.md)

#### Returns

[`IndexSet`](cognite_reveal.IndexSet.md)

#### Overrides

[NodeCollection](cognite_reveal.NodeCollection.md).[getIndexSet](cognite_reveal.NodeCollection.md#getindexset)

#### Defined in

[packages/cad-styling/src/PropertyFilterNodeCollection.ts:134](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-styling/src/PropertyFilterNodeCollection.ts#L134)

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

[packages/cad-styling/src/PropertyFilterNodeCollection.ts:142](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-styling/src/PropertyFilterNodeCollection.ts#L142)
