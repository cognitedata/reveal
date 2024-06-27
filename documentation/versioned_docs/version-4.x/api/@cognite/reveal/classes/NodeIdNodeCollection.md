# Class: NodeIdNodeCollection

Collection that holds a set of nodes including children identified by nodeIds. Note that
this involves remapping IDs to "tree indices" and subtree sized used by Reveal using
the CDF API. Its often better to use one of the other node collections or

## See

whenever possible for best performance.

## Extends

- [`CdfNodeCollectionBase`](CdfNodeCollectionBase.md)

## Constructors

### new NodeIdNodeCollection()

> **new NodeIdNodeCollection**(`client`, `model`): [`NodeIdNodeCollection`](NodeIdNodeCollection.md)

#### Parameters

• **client**: `CogniteClient`

• **model**: [`CdfModelNodeCollectionDataProvider`](../interfaces/CdfModelNodeCollectionDataProvider.md)

#### Returns

[`NodeIdNodeCollection`](NodeIdNodeCollection.md)

#### Overrides

[`CdfNodeCollectionBase`](CdfNodeCollectionBase.md) . [`constructor`](CdfNodeCollectionBase.md#constructors)

#### Defined in

[packages/cad-styling/src/NodeIdNodeCollection.ts:25](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/NodeIdNodeCollection.ts#L25)

## Properties

### classToken

> `readonly` `static` **classToken**: `"NodeIdNodeCollection"` = `'NodeIdNodeCollection'`

#### Defined in

[packages/cad-styling/src/NodeIdNodeCollection.ts:18](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/NodeIdNodeCollection.ts#L18)

## Accessors

### classToken

> `get` **classToken**(): `string`

#### Returns

`string`

#### Inherited from

[`CdfNodeCollectionBase`](CdfNodeCollectionBase.md) . [`classToken`](CdfNodeCollectionBase.md#classtoken)

#### Defined in

[packages/cad-styling/src/NodeCollection.ts:23](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/NodeCollection.ts#L23)

***

### isLoading

> `get` **isLoading**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[`CdfNodeCollectionBase`](CdfNodeCollectionBase.md) . [`isLoading`](CdfNodeCollectionBase.md#isloading)

#### Defined in

[packages/cad-styling/src/CdfNodeCollectionBase.ts:25](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/CdfNodeCollectionBase.ts#L25)

## Methods

### clear()

> **clear**(): `void`

Clears the node collection and interrupts any ongoing operations.

#### Returns

`void`

#### Inherited from

[`CdfNodeCollectionBase`](CdfNodeCollectionBase.md) . [`clear`](CdfNodeCollectionBase.md#clear)

#### Defined in

[packages/cad-styling/src/CdfNodeCollectionBase.ts:69](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/CdfNodeCollectionBase.ts#L69)

***

### executeFilter()

> **executeFilter**(`nodeIds`): `Promise`\<`void`\>

Populates the collection with the nodes with the IDs provided. All children of
the nodes are also included in the collection.

#### Parameters

• **nodeIds**: `number`[]

IDs of nodes to include in the collection.

#### Returns

`Promise`\<`void`\>

Promise that resolves when the collection is populated.

#### Defined in

[packages/cad-styling/src/NodeIdNodeCollection.ts:37](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/NodeIdNodeCollection.ts#L37)

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

[packages/cad-styling/src/CdfNodeCollectionBase.ts:81](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/CdfNodeCollectionBase.ts#L81)

***

### getIndexSet()

> **getIndexSet**(): [`IndexSet`](IndexSet.md)

#### Returns

[`IndexSet`](IndexSet.md)

#### Inherited from

[`CdfNodeCollectionBase`](CdfNodeCollectionBase.md) . [`getIndexSet`](CdfNodeCollectionBase.md#getindexset)

#### Defined in

[packages/cad-styling/src/CdfNodeCollectionBase.ts:77](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/CdfNodeCollectionBase.ts#L77)

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

[packages/cad-styling/src/NodeCollection.ts:32](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/NodeCollection.ts#L32)

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

[packages/cad-styling/src/NodeCollection.ts:27](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/NodeCollection.ts#L27)

***

### serialize()

> **serialize**(): [`SerializedNodeCollection`](../type-aliases/SerializedNodeCollection.md)

#### Returns

[`SerializedNodeCollection`](../type-aliases/SerializedNodeCollection.md)

#### Overrides

[`CdfNodeCollectionBase`](CdfNodeCollectionBase.md) . [`serialize`](CdfNodeCollectionBase.md#serialize)

#### Defined in

[packages/cad-styling/src/NodeIdNodeCollection.ts:58](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/NodeIdNodeCollection.ts#L58)

***

### deserialize()

> `static` **deserialize**(`descriptor`, `context`): `Promise` \<[`NodeIdNodeCollection`](NodeIdNodeCollection.md)\>

#### Parameters

• **descriptor**: [`SerializedNodeCollection`](../type-aliases/SerializedNodeCollection.md)

• **context**: [`NodeCollectionSerializationContext`](../type-aliases/NodeCollectionSerializationContext.md)

#### Returns

`Promise` \<[`NodeIdNodeCollection`](NodeIdNodeCollection.md)\>

#### Defined in

[packages/cad-styling/src/NodeIdNodeCollection.ts:65](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/NodeIdNodeCollection.ts#L65)
