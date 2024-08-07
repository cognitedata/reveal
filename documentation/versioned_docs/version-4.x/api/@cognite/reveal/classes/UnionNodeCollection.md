# Class: UnionNodeCollection

Node collection that takes the set union of multiple node collections.

## Extends

- [`CombineNodeCollectionBase`](CombineNodeCollectionBase.md)

## Constructors

### new UnionNodeCollection()

> **new UnionNodeCollection**(`nodeCollections`?): [`UnionNodeCollection`](UnionNodeCollection.md)

#### Parameters

• **nodeCollections?**: [`NodeCollection`](NodeCollection.md)[]

#### Returns

[`UnionNodeCollection`](UnionNodeCollection.md)

#### Overrides

[`CombineNodeCollectionBase`](CombineNodeCollectionBase.md) . [`constructor`](CombineNodeCollectionBase.md#constructors)

#### Defined in

[packages/cad-styling/src/UnionNodeCollection.ts:21](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/UnionNodeCollection.ts#L21)

## Properties

### classToken

> `readonly` `static` **classToken**: `"UnionNodeCollection"` = `'UnionNodeCollection'`

#### Defined in

[packages/cad-styling/src/UnionNodeCollection.ts:19](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/UnionNodeCollection.ts#L19)

## Accessors

### classToken

> `get` **classToken**(): `string`

#### Returns

`string`

#### Inherited from

[`CombineNodeCollectionBase`](CombineNodeCollectionBase.md) . [`classToken`](CombineNodeCollectionBase.md#classtoken)

#### Defined in

[packages/cad-styling/src/NodeCollection.ts:23](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/NodeCollection.ts#L23)

***

### isLoading

> `get` **isLoading**(): `boolean`

**`Override`**

#### Returns

`boolean`

#### Inherited from

[`CombineNodeCollectionBase`](CombineNodeCollectionBase.md) . [`isLoading`](CombineNodeCollectionBase.md#isloading)

#### Defined in

[packages/cad-styling/src/CombineNodeCollectionBase.ts:67](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts#L67)

## Methods

### add()

> **add**(`nodeCollection`): `void`

#### Parameters

• **nodeCollection**: [`NodeCollection`](NodeCollection.md)

#### Returns

`void`

#### Inherited from

[`CombineNodeCollectionBase`](CombineNodeCollectionBase.md) . [`add`](CombineNodeCollectionBase.md#add)

#### Defined in

[packages/cad-styling/src/CombineNodeCollectionBase.ts:26](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts#L26)

***

### clear()

> **clear**(): `void`

Clears all underlying node collections.

#### Returns

`void`

#### Inherited from

[`CombineNodeCollectionBase`](CombineNodeCollectionBase.md) . [`clear`](CombineNodeCollectionBase.md#clear)

#### Defined in

[packages/cad-styling/src/CombineNodeCollectionBase.ts:46](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts#L46)

***

### getAreas()

> **getAreas**(): [`AreaCollection`](../interfaces/AreaCollection.md)

Returns areas surrounding the nodes in the collection. The areas
are boxes in "ThreeJS coordinates". Note that not all
implementations supports this.

#### Returns

[`AreaCollection`](../interfaces/AreaCollection.md)

#### Overrides

[`CombineNodeCollectionBase`](CombineNodeCollectionBase.md) . [`getAreas`](CombineNodeCollectionBase.md#getareas)

#### Defined in

[packages/cad-styling/src/UnionNodeCollection.ts:45](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/UnionNodeCollection.ts#L45)

***

### getIndexSet()

> **getIndexSet**(): [`IndexSet`](IndexSet.md)

**`Override`**

#### Returns

[`IndexSet`](IndexSet.md)

#### Inherited from

[`CombineNodeCollectionBase`](CombineNodeCollectionBase.md) . [`getIndexSet`](CombineNodeCollectionBase.md#getindexset)

#### Defined in

[packages/cad-styling/src/CombineNodeCollectionBase.ts:59](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts#L59)

***

### off()

> **off**(`event`, `listener`): `void`

#### Parameters

• **event**: `"changed"`

• **listener**

#### Returns

`void`

#### Inherited from

[`CombineNodeCollectionBase`](CombineNodeCollectionBase.md) . [`off`](CombineNodeCollectionBase.md#off)

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

[`CombineNodeCollectionBase`](CombineNodeCollectionBase.md) . [`on`](CombineNodeCollectionBase.md#on)

#### Defined in

[packages/cad-styling/src/NodeCollection.ts:27](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/NodeCollection.ts#L27)

***

### remove()

> **remove**(`nodeCollection`): `void`

#### Parameters

• **nodeCollection**: [`NodeCollection`](NodeCollection.md)

#### Returns

`void`

#### Inherited from

[`CombineNodeCollectionBase`](CombineNodeCollectionBase.md) . [`remove`](CombineNodeCollectionBase.md#remove)

#### Defined in

[packages/cad-styling/src/CombineNodeCollectionBase.ts:32](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts#L32)

***

### serialize()

> **serialize**(): [`SerializedNodeCollection`](../type-aliases/SerializedNodeCollection.md)

#### Returns

[`SerializedNodeCollection`](../type-aliases/SerializedNodeCollection.md)

#### Overrides

[`CombineNodeCollectionBase`](CombineNodeCollectionBase.md) . [`serialize`](CombineNodeCollectionBase.md#serialize)

#### Defined in

[packages/cad-styling/src/UnionNodeCollection.ts:25](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/UnionNodeCollection.ts#L25)
