# Class: SinglePropertyFilterNodeCollection

Node collection that filters nodes based on a node property from a list of values, similarly to how
`SELECT ... IN (...)` works. This is useful when looking up nodes based on a list of identifiers,
nodes within a set of areas or systems. The node set is optimized for matching with properties with
a large number of values (i.e. thousands).

## Extends

- [`CdfNodeCollectionBase`](CdfNodeCollectionBase.md)

## Constructors

### new SinglePropertyFilterNodeCollection()

> **new SinglePropertyFilterNodeCollection**(`client`, `model`, `options`): [`SinglePropertyFilterNodeCollection`](SinglePropertyFilterNodeCollection.md)

Construct a new node set.

#### Parameters

• **client**: `CogniteClient`

CogniteClient authenticated to the project the model is loaded from.

• **model**: [`CdfModelNodeCollectionDataProvider`](../interfaces/CdfModelNodeCollectionDataProvider.md)

CAD model.

• **options**: [`PropertyFilterNodeCollectionOptions`](../type-aliases/PropertyFilterNodeCollectionOptions.md) = `{}`

#### Returns

[`SinglePropertyFilterNodeCollection`](SinglePropertyFilterNodeCollection.md)

#### Overrides

[`CdfNodeCollectionBase`](CdfNodeCollectionBase.md) . [`constructor`](CdfNodeCollectionBase.md#constructors)

#### Defined in

[packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts:41](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts#L41)

## Properties

### classToken

> `readonly` `static` **classToken**: `"SinglePropertyNodeCollection"` = `'SinglePropertyNodeCollection'`

#### Defined in

[packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts:24](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts#L24)

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

> **executeFilter**(`propertyCategory`, `propertyKey`, `propertyValues`): `Promise`\<`void`\>

Execute filter asynchronously, replacing any existing filter active. When propertyValues
contains more than 1000 elements, the operation will be split into multiple batches that
are executed in parallel. Note that when providing a PropertyFilterNodeCollectionOptions.requestPartitions
during construction of the node set, the total number of batches will be requestPartitions*numberOfBatches.

#### Parameters

• **propertyCategory**: `string`

Node property category, e.g. `'PDMS'`.

• **propertyKey**: `string`

Node property key, e.g. `':FU'`.

• **propertyValues**: `string`[]

Lookup values, e.g. `["AR100APG539","AP500INF534","AP400INF553", ...]`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts:62](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts#L62)

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

[packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts:97](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts#L97)
