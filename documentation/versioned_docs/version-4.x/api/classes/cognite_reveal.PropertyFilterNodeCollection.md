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

- [`CdfNodeCollectionBase`](cognite_reveal.CdfNodeCollectionBase.md)

  ↳ **`PropertyFilterNodeCollection`**

## Constructors

### constructor

• **new PropertyFilterNodeCollection**(`client`, `model`, `options?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `client` | `default` |
| `model` | [`CdfModelNodeCollectionDataProvider`](../interfaces/cognite_reveal.CdfModelNodeCollectionDataProvider.md) |
| `options` | [`PropertyFilterNodeCollectionOptions`](../modules/cognite_reveal.md#propertyfilternodecollectionoptions) |

#### Overrides

[CdfNodeCollectionBase](cognite_reveal.CdfNodeCollectionBase.md).[constructor](cognite_reveal.CdfNodeCollectionBase.md#constructor)

#### Defined in

[packages/cad-styling/src/PropertyFilterNodeCollection.ts:44](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/PropertyFilterNodeCollection.ts#L44)

## Properties

### classToken

▪ `Static` `Readonly` **classToken**: ``"PropertyFilterNodeCollection"``

#### Defined in

[packages/cad-styling/src/PropertyFilterNodeCollection.ts:32](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/PropertyFilterNodeCollection.ts#L32)

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

▸ **executeFilter**(`filter`): `Promise`\<`void`\>

Populates the node collection with nodes matching the provided filter. This will replace
the current nodes held by the filter.

**`Example`**

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

[packages/cad-styling/src/PropertyFilterNodeCollection.ts:64](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/PropertyFilterNodeCollection.ts#L64)

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

[packages/cad-styling/src/PropertyFilterNodeCollection.ts:83](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/PropertyFilterNodeCollection.ts#L83)
