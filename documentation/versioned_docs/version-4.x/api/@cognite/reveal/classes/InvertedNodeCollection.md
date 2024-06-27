# Class: InvertedNodeCollection

Node collection that inverts the result from another node collection.

## Extends

- [`NodeCollection`](NodeCollection.md)

## Constructors

### new InvertedNodeCollection()

> **new InvertedNodeCollection**(`model`, `innerSet`): [`InvertedNodeCollection`](InvertedNodeCollection.md)

#### Parameters

• **model**: [`CdfModelNodeCollectionDataProvider`](../interfaces/CdfModelNodeCollectionDataProvider.md)

• **innerSet**: [`NodeCollection`](NodeCollection.md)

#### Returns

[`InvertedNodeCollection`](InvertedNodeCollection.md)

#### Overrides

`NodeCollection.constructor`

#### Defined in

[packages/cad-styling/src/InvertedNodeCollection.ts:21](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/InvertedNodeCollection.ts#L21)

## Properties

### classToken

> `readonly` `static` **classToken**: `"InvertedNodeCollection"` = `'InvertedNodeCollection'`

#### Defined in

[packages/cad-styling/src/InvertedNodeCollection.ts:15](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/InvertedNodeCollection.ts#L15)

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

[packages/cad-styling/src/InvertedNodeCollection.ts:32](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/InvertedNodeCollection.ts#L32)

## Methods

### clear()

> **clear**(): `never`

Not supported.

#### Returns

`never`

#### Overrides

[`NodeCollection`](NodeCollection.md) . [`clear`](NodeCollection.md#clear)

#### Throws

Always throws an error.

#### Defined in

[packages/cad-styling/src/InvertedNodeCollection.ts:58](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/InvertedNodeCollection.ts#L58)

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

[packages/cad-styling/src/InvertedNodeCollection.ts:47](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/InvertedNodeCollection.ts#L47)

***

### getIndexSet()

> **getIndexSet**(): [`IndexSet`](IndexSet.md)

#### Returns

[`IndexSet`](IndexSet.md)

#### Overrides

[`NodeCollection`](NodeCollection.md) . [`getIndexSet`](NodeCollection.md#getindexset)

#### Defined in

[packages/cad-styling/src/InvertedNodeCollection.ts:36](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/InvertedNodeCollection.ts#L36)

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

> **serialize**(): [`SerializedNodeCollection`](../type-aliases/SerializedNodeCollection.md)

#### Returns

[`SerializedNodeCollection`](../type-aliases/SerializedNodeCollection.md)

#### Overrides

[`NodeCollection`](NodeCollection.md) . [`serialize`](NodeCollection.md#serialize)

#### Defined in

[packages/cad-styling/src/InvertedNodeCollection.ts:51](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/InvertedNodeCollection.ts#L51)
