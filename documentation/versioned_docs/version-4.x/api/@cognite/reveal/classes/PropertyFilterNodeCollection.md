# Class: PropertyFilterNodeCollection

Represents a set of nodes that has matching node properties to a provided filter. Note that
a node is considered to match if it or a [NodeCollection](NodeCollection.md) ancestors match the filter.

## Extends

- [`CdfNodeCollectionBase`](CdfNodeCollectionBase.md)

## Constructors

### new PropertyFilterNodeCollection()

> **new PropertyFilterNodeCollection**(`client`, `model`, `options`): [`PropertyFilterNodeCollection`](PropertyFilterNodeCollection.md)

#### Parameters

• **client**: `CogniteClient`

• **model**: [`CdfModelNodeCollectionDataProvider`](../interfaces/CdfModelNodeCollectionDataProvider.md)

• **options**: [`PropertyFilterNodeCollectionOptions`](../type-aliases/PropertyFilterNodeCollectionOptions.md) = `{}`

#### Returns

[`PropertyFilterNodeCollection`](PropertyFilterNodeCollection.md)

#### Overrides

[`CdfNodeCollectionBase`](CdfNodeCollectionBase.md) . [`constructor`](CdfNodeCollectionBase.md#constructors)

#### Defined in

[packages/cad-styling/src/PropertyFilterNodeCollection.ts:44](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/PropertyFilterNodeCollection.ts#L44)

## Properties

### classToken

> `readonly` `static` **classToken**: `"PropertyFilterNodeCollection"` = `'PropertyFilterNodeCollection'`

#### Defined in

[packages/cad-styling/src/PropertyFilterNodeCollection.ts:32](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/PropertyFilterNodeCollection.ts#L32)

## Accessors

### classToken

> `get` **classToken**(): `string`

#### Returns

`string`

#### Inherited from

[`CdfNodeCollectionBase`](CdfNodeCollectionBase.md) . [`classToken`](CdfNodeCollectionBase.md#classtoken)

#### Defined in

[packages/cad-styling/src/NodeCollection.ts:23](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/NodeCollection.ts#L23)

***

### isLoading

> `get` **isLoading**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[`CdfNodeCollectionBase`](CdfNodeCollectionBase.md) . [`isLoading`](CdfNodeCollectionBase.md#isloading)

#### Defined in

[packages/cad-styling/src/CdfNodeCollectionBase.ts:25](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/CdfNodeCollectionBase.ts#L25)

## Methods

### clear()

> **clear**(): `void`

Clears the node collection and interrupts any ongoing operations.

#### Returns

`void`

#### Inherited from

[`CdfNodeCollectionBase`](CdfNodeCollectionBase.md) . [`clear`](CdfNodeCollectionBase.md#clear)

#### Defined in

[packages/cad-styling/src/CdfNodeCollectionBase.ts:69](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/CdfNodeCollectionBase.ts#L69)

***

### executeFilter()

> **executeFilter**(`filter`): `Promise`\<`void`\>

Populates the node collection with nodes matching the provided filter. This will replace
the current nodes held by the filter.

#### Parameters

• **filter**

A filter for matching node properties.

#### Returns

`Promise`\<`void`\>

#### Example

```
set.executeFilter({ 'PDMS': { 'Module': 'AQ550' }});
```

#### Defined in

[packages/cad-styling/src/PropertyFilterNodeCollection.ts:64](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/PropertyFilterNodeCollection.ts#L64)

***

### getAreas()

> **getAreas**(): [`AreaCollection`](../interfaces/AreaCollection.md)

Returns areas surrounding the nodes in the collection. The areas
are boxes in "ThreeJS coordinates". Note that not all
implementations supports this.

#### Returns

[`AreaCollection`](../interfaces/AreaCollection.md)

#### Inherited from

[`CdfNodeCollectionBase`](CdfNodeCollectionBase.md) . [`getAreas`](CdfNodeCollectionBase.md#getareas)

#### Defined in

[packages/cad-styling/src/CdfNodeCollectionBase.ts:81](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/CdfNodeCollectionBase.ts#L81)

***

### getIndexSet()

> **getIndexSet**(): [`IndexSet`](IndexSet.md)

#### Returns

[`IndexSet`](IndexSet.md)

#### Inherited from

[`CdfNodeCollectionBase`](CdfNodeCollectionBase.md) . [`getIndexSet`](CdfNodeCollectionBase.md#getindexset)

#### Defined in

[packages/cad-styling/src/CdfNodeCollectionBase.ts:77](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/CdfNodeCollectionBase.ts#L77)

***

### off()

> **off**(`event`, `listener`): `void`

#### Parameters

• **event**: `"changed"`

• **listener**

#### Returns

`void`

#### Inherited from

[`CdfNodeCollectionBase`](CdfNodeCollectionBase.md) . [`off`](CdfNodeCollectionBase.md#off)

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

[`CdfNodeCollectionBase`](CdfNodeCollectionBase.md) . [`on`](CdfNodeCollectionBase.md#on)

#### Defined in

[packages/cad-styling/src/NodeCollection.ts:27](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/NodeCollection.ts#L27)

***

### serialize()

> **serialize**(): [`SerializedNodeCollection`](../type-aliases/SerializedNodeCollection.md)

#### Returns

[`SerializedNodeCollection`](../type-aliases/SerializedNodeCollection.md)

#### Overrides

[`CdfNodeCollectionBase`](CdfNodeCollectionBase.md) . [`serialize`](CdfNodeCollectionBase.md#serialize)

#### Defined in

[packages/cad-styling/src/PropertyFilterNodeCollection.ts:83](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/PropertyFilterNodeCollection.ts#L83)
