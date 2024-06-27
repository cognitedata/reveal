---
id: "cognite_reveal.AssetNodeCollection"
title: "Class: AssetNodeCollection"
sidebar_label: "AssetNodeCollection"
custom_edit_url: null
---

[@cognite/reveal](../modules/cognite_reveal.md).AssetNodeCollection

Represents a set of nodes associated with an [asset in Cognite Fusion][https://docs.cognite.com/api/v1/#tag/Assets](https://docs.cognite.com/api/v1/#tag/Assets)
linked to the 3D model using [asset mappings][https://docs.cognite.com/api/v1/#tag/3D-Asset-Mapping](https://docs.cognite.com/api/v1/#tag/3D-Asset-Mapping). A node
is considered to be part of an asset if it has a direct asset mapping or if one of its ancestors has an asset mapping
to the asset.

## Hierarchy

- [`NodeCollection`](cognite_reveal.NodeCollection.md)

  ↳ **`AssetNodeCollection`**

## Constructors

### constructor

• **new AssetNodeCollection**(`client`, `modelMetadataProvider`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `client` | `default` |
| `modelMetadataProvider` | [`CdfModelNodeCollectionDataProvider`](../interfaces/cognite_reveal.CdfModelNodeCollectionDataProvider.md) |

#### Overrides

NodeCollection.constructor

#### Defined in

[packages/cad-styling/src/AssetNodeCollection.ts:36](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/AssetNodeCollection.ts#L36)

## Properties

### classToken

▪ `Static` `Readonly` **classToken**: ``"AssetNodeCollection"``

#### Defined in

[packages/cad-styling/src/AssetNodeCollection.ts:27](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/AssetNodeCollection.ts#L27)

## Accessors

### classToken

• `get` **classToken**(): `string`

#### Returns

`string`

#### Inherited from

NodeCollection.classToken

#### Defined in

[packages/cad-styling/src/NodeCollection.ts:23](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/NodeCollection.ts#L23)

___

### isLoading

• `get` **isLoading**(): `boolean`

#### Returns

`boolean`

#### Overrides

NodeCollection.isLoading

#### Defined in

[packages/cad-styling/src/AssetNodeCollection.ts:43](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/AssetNodeCollection.ts#L43)

## Methods

### clear

▸ **clear**(): `void`

#### Returns

`void`

#### Overrides

[NodeCollection](cognite_reveal.NodeCollection.md).[clear](cognite_reveal.NodeCollection.md#clear)

#### Defined in

[packages/cad-styling/src/AssetNodeCollection.ts:135](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/AssetNodeCollection.ts#L135)

___

### executeFilter

▸ **executeFilter**(`filter`): `Promise`\<`void`\>

Updates the node collection to hold nodes associated with the asset given, or
assets within the bounding box or all assets associated with the 3D model.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `filter` | `Object` |  |
| `filter.assetId?` | `number` | ID of a single [asset][https://docs.cognite.com/dev/concepts/resource_types/assets.html](https://docs.cognite.com/dev/concepts/resource_types/assets.html) (optional) |
| `filter.boundingBox?` | `Box3` | When provided, only assets within the provided bounds will be included in the filter. |

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/cad-styling/src/AssetNodeCollection.ts:54](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/AssetNodeCollection.ts#L54)

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

[packages/cad-styling/src/AssetNodeCollection.ts:147](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/AssetNodeCollection.ts#L147)

___

### getFilter

▸ **getFilter**(): `undefined` \| \{ `assetId?`: `number` ; `boundingBox?`: `Box3`  }

#### Returns

`undefined` \| \{ `assetId?`: `number` ; `boundingBox?`: `Box3`  }

#### Defined in

[packages/cad-styling/src/AssetNodeCollection.ts:131](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/AssetNodeCollection.ts#L131)

___

### getIndexSet

▸ **getIndexSet**(): [`IndexSet`](cognite_reveal.IndexSet.md)

#### Returns

[`IndexSet`](cognite_reveal.IndexSet.md)

#### Overrides

[NodeCollection](cognite_reveal.NodeCollection.md).[getIndexSet](cognite_reveal.NodeCollection.md#getindexset)

#### Defined in

[packages/cad-styling/src/AssetNodeCollection.ts:143](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/AssetNodeCollection.ts#L143)

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

[NodeCollection](cognite_reveal.NodeCollection.md).[on](cognite_reveal.NodeCollection.md#on)

#### Defined in

[packages/cad-styling/src/NodeCollection.ts:27](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/NodeCollection.ts#L27)

___

### serialize

▸ **serialize**(): [`SerializedNodeCollection`](../modules/cognite_reveal.md#serializednodecollection)

#### Returns

[`SerializedNodeCollection`](../modules/cognite_reveal.md#serializednodecollection)

#### Overrides

[NodeCollection](cognite_reveal.NodeCollection.md).[serialize](cognite_reveal.NodeCollection.md#serialize)

#### Defined in

[packages/cad-styling/src/AssetNodeCollection.ts:151](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/AssetNodeCollection.ts#L151)
