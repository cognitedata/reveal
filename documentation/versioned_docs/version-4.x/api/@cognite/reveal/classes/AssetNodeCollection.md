# Class: AssetNodeCollection

Represents a set of nodes associated with an [asset in Cognite Fusion][https://docs.cognite.com/api/v1/#tag/Assets](https://docs.cognite.com/api/v1/#tag/Assets)
linked to the 3D model using [asset mappings][https://docs.cognite.com/api/v1/#tag/3D-Asset-Mapping](https://docs.cognite.com/api/v1/#tag/3D-Asset-Mapping). A node
is considered to be part of an asset if it has a direct asset mapping or if one of its ancestors has an asset mapping
to the asset.

## Extends

- [`NodeCollection`](NodeCollection.md)

## Constructors

### new AssetNodeCollection()

> **new AssetNodeCollection**(`client`, `modelMetadataProvider`): [`AssetNodeCollection`](AssetNodeCollection.md)

#### Parameters

• **client**: `CogniteClient`

• **modelMetadataProvider**: [`CdfModelNodeCollectionDataProvider`](../interfaces/CdfModelNodeCollectionDataProvider.md)

#### Returns

[`AssetNodeCollection`](AssetNodeCollection.md)

#### Overrides

`NodeCollection.constructor`

#### Defined in

[packages/cad-styling/src/AssetNodeCollection.ts:36](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/AssetNodeCollection.ts#L36)

## Properties

### classToken

> `readonly` `static` **classToken**: `"AssetNodeCollection"` = `'AssetNodeCollection'`

#### Defined in

[packages/cad-styling/src/AssetNodeCollection.ts:27](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/AssetNodeCollection.ts#L27)

## Accessors

### classToken

> `get` **classToken**(): `string`

#### Returns

`string`

#### Inherited from

[`NodeCollection`](NodeCollection.md) . [`classToken`](NodeCollection.md#classtoken)

#### Defined in

[packages/cad-styling/src/NodeCollection.ts:23](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/NodeCollection.ts#L23)

***

### isLoading

> `get` **isLoading**(): `boolean`

#### Returns

`boolean`

#### Overrides

[`NodeCollection`](NodeCollection.md) . [`isLoading`](NodeCollection.md#isloading)

#### Defined in

[packages/cad-styling/src/AssetNodeCollection.ts:43](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/AssetNodeCollection.ts#L43)

## Methods

### clear()

> **clear**(): `void`

#### Returns

`void`

#### Overrides

[`NodeCollection`](NodeCollection.md) . [`clear`](NodeCollection.md#clear)

#### Defined in

[packages/cad-styling/src/AssetNodeCollection.ts:139](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/AssetNodeCollection.ts#L139)

***

### executeFilter()

> **executeFilter**(`filter`): `Promise`\<`void`\>

Updates the node collection to hold nodes associated with the asset given, or
assets within the bounding box or all assets associated with the 3D model.

#### Parameters

• **filter**

• **filter.assetId?**: `number`

ID of a single [asset][https://docs.cognite.com/dev/concepts/resource_types/assets.html](https://docs.cognite.com/dev/concepts/resource_types/assets.html) (optional)

• **filter.boundingBox?**: `Box3`

When provided, only assets within the provided bounds will be included in the filter.

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/cad-styling/src/AssetNodeCollection.ts:54](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/AssetNodeCollection.ts#L54)

***

### getAreas()

> **getAreas**(): [`AreaCollection`](../interfaces/AreaCollection.md)

Returns areas surrounding the nodes in the collection. The areas
are boxes in "ThreeJS coordinates". Note that not all
implementations supports this.

#### Returns

[`AreaCollection`](../interfaces/AreaCollection.md)

#### Overrides

[`NodeCollection`](NodeCollection.md) . [`getAreas`](NodeCollection.md#getareas)

#### Defined in

[packages/cad-styling/src/AssetNodeCollection.ts:151](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/AssetNodeCollection.ts#L151)

***

### getFilter()

> **getFilter**(): `undefined` \| `object`

#### Returns

`undefined` \| `object`

#### Defined in

[packages/cad-styling/src/AssetNodeCollection.ts:135](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/AssetNodeCollection.ts#L135)

***

### getIndexSet()

> **getIndexSet**(): [`IndexSet`](IndexSet.md)

#### Returns

[`IndexSet`](IndexSet.md)

#### Overrides

[`NodeCollection`](NodeCollection.md) . [`getIndexSet`](NodeCollection.md#getindexset)

#### Defined in

[packages/cad-styling/src/AssetNodeCollection.ts:147](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/AssetNodeCollection.ts#L147)

***

### off()

> **off**(`event`, `listener`): `void`

#### Parameters

• **event**: `"changed"`

• **listener**

#### Returns

`void`

#### Inherited from

[`NodeCollection`](NodeCollection.md) . [`off`](NodeCollection.md#off)

#### Defined in

[packages/cad-styling/src/NodeCollection.ts:32](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/NodeCollection.ts#L32)

***

### on()

> **on**(`event`, `listener`): `void`

#### Parameters

• **event**: `"changed"`

• **listener**

#### Returns

`void`

#### Inherited from

[`NodeCollection`](NodeCollection.md) . [`on`](NodeCollection.md#on)

#### Defined in

[packages/cad-styling/src/NodeCollection.ts:27](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/NodeCollection.ts#L27)

***

### serialize()

> **serialize**(): [`SerializedNodeCollection`](../type-aliases/SerializedNodeCollection.md)

#### Returns

[`SerializedNodeCollection`](../type-aliases/SerializedNodeCollection.md)

#### Overrides

[`NodeCollection`](NodeCollection.md) . [`serialize`](NodeCollection.md#serialize)

#### Defined in

[packages/cad-styling/src/AssetNodeCollection.ts:155](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/AssetNodeCollection.ts#L155)
