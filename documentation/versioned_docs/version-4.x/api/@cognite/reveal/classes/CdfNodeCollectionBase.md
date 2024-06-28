# Class: `abstract` CdfNodeCollectionBase

Abstract class for implementing a set of nodes to be styled.

## Extends

- [`NodeCollection`](NodeCollection.md)

## Extended by

- [`NodeIdNodeCollection`](NodeIdNodeCollection.md)
- [`PropertyFilterNodeCollection`](PropertyFilterNodeCollection.md)
- [`SinglePropertyFilterNodeCollection`](SinglePropertyFilterNodeCollection.md)

## Constructors

### new CdfNodeCollectionBase()

> **new CdfNodeCollectionBase**(`classToken`, `model`): [`CdfNodeCollectionBase`](CdfNodeCollectionBase.md)

#### Parameters

• **classToken**: `string`

• **model**: [`CdfModelNodeCollectionDataProvider`](../interfaces/CdfModelNodeCollectionDataProvider.md)

#### Returns

[`CdfNodeCollectionBase`](CdfNodeCollectionBase.md)

#### Overrides

`NodeCollection.constructor`

#### Defined in

[packages/cad-styling/src/CdfNodeCollectionBase.ts:20](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/CdfNodeCollectionBase.ts#L20)

## Accessors

### classToken

> `get` **classToken**(): `string`

#### Returns

`string`

#### Inherited from

[`NodeCollection`](NodeCollection.md) . [`classToken`](NodeCollection.md#classtoken)

#### Defined in

[packages/cad-styling/src/NodeCollection.ts:23](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/NodeCollection.ts#L23)

***

### isLoading

> `get` **isLoading**(): `boolean`

#### Returns

`boolean`

#### Overrides

[`NodeCollection`](NodeCollection.md) . [`isLoading`](NodeCollection.md#isloading)

#### Defined in

[packages/cad-styling/src/CdfNodeCollectionBase.ts:25](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/CdfNodeCollectionBase.ts#L25)

## Methods

### clear()

> **clear**(): `void`

Clears the node collection and interrupts any ongoing operations.

#### Returns

`void`

#### Overrides

[`NodeCollection`](NodeCollection.md) . [`clear`](NodeCollection.md#clear)

#### Defined in

[packages/cad-styling/src/CdfNodeCollectionBase.ts:69](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/CdfNodeCollectionBase.ts#L69)

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

[packages/cad-styling/src/CdfNodeCollectionBase.ts:81](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/CdfNodeCollectionBase.ts#L81)

***

### getIndexSet()

> **getIndexSet**(): [`IndexSet`](IndexSet.md)

#### Returns

[`IndexSet`](IndexSet.md)

#### Overrides

[`NodeCollection`](NodeCollection.md) . [`getIndexSet`](NodeCollection.md#getindexset)

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

[`NodeCollection`](NodeCollection.md) . [`off`](NodeCollection.md#off)

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

[`NodeCollection`](NodeCollection.md) . [`on`](NodeCollection.md#on)

#### Defined in

[packages/cad-styling/src/NodeCollection.ts:27](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/NodeCollection.ts#L27)

***

### serialize()

> `abstract` **serialize**(): [`SerializedNodeCollection`](../type-aliases/SerializedNodeCollection.md)

#### Returns

[`SerializedNodeCollection`](../type-aliases/SerializedNodeCollection.md)

#### Inherited from

[`NodeCollection`](NodeCollection.md) . [`serialize`](NodeCollection.md#serialize)

#### Defined in

[packages/cad-styling/src/NodeCollection.ts:46](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/NodeCollection.ts#L46)
