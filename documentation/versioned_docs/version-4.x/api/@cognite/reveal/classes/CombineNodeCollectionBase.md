# Class: `abstract` CombineNodeCollectionBase

Node collection that combines the result from multiple underlying node collections.

## Extends

- [`NodeCollection`](NodeCollection.md)

## Extended by

- [`IntersectionNodeCollection`](IntersectionNodeCollection.md)
- [`UnionNodeCollection`](UnionNodeCollection.md)

## Constructors

### new CombineNodeCollectionBase()

> **new CombineNodeCollectionBase**(`classToken`, `nodeCollections`?): [`CombineNodeCollectionBase`](CombineNodeCollectionBase.md)

#### Parameters

• **classToken**: `string`

• **nodeCollections?**: [`NodeCollection`](NodeCollection.md)[]

#### Returns

[`CombineNodeCollectionBase`](CombineNodeCollectionBase.md)

#### Overrides

`NodeCollection.constructor`

#### Defined in

[packages/cad-styling/src/CombineNodeCollectionBase.ts:17](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts#L17)

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

**`Override`**

#### Returns

`boolean`

#### Overrides

[`NodeCollection`](NodeCollection.md) . [`isLoading`](NodeCollection.md#isloading)

#### Defined in

[packages/cad-styling/src/CombineNodeCollectionBase.ts:67](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts#L67)

## Methods

### add()

> **add**(`nodeCollection`): `void`

#### Parameters

• **nodeCollection**: [`NodeCollection`](NodeCollection.md)

#### Returns

`void`

#### Defined in

[packages/cad-styling/src/CombineNodeCollectionBase.ts:26](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts#L26)

***

### clear()

> **clear**(): `void`

Clears all underlying node collections.

#### Returns

`void`

#### Overrides

[`NodeCollection`](NodeCollection.md) . [`clear`](NodeCollection.md#clear)

#### Defined in

[packages/cad-styling/src/CombineNodeCollectionBase.ts:46](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts#L46)

***

### getAreas()

> `abstract` **getAreas**(): [`AreaCollection`](../interfaces/AreaCollection.md)

Returns areas surrounding the nodes in the collection. The areas
are boxes in "ThreeJS coordinates". Note that not all
implementations supports this.

#### Returns

[`AreaCollection`](../interfaces/AreaCollection.md)

#### Overrides

[`NodeCollection`](NodeCollection.md) . [`getAreas`](NodeCollection.md#getareas)

#### Defined in

[packages/cad-styling/src/CombineNodeCollectionBase.ts:73](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts#L73)

***

### getIndexSet()

> **getIndexSet**(): [`IndexSet`](IndexSet.md)

**`Override`**

#### Returns

[`IndexSet`](IndexSet.md)

#### Overrides

[`NodeCollection`](NodeCollection.md) . [`getIndexSet`](NodeCollection.md#getindexset)

#### Defined in

[packages/cad-styling/src/CombineNodeCollectionBase.ts:59](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts#L59)

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

### remove()

> **remove**(`nodeCollection`): `void`

#### Parameters

• **nodeCollection**: [`NodeCollection`](NodeCollection.md)

#### Returns

`void`

#### Defined in

[packages/cad-styling/src/CombineNodeCollectionBase.ts:32](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts#L32)

***

### serialize()

> `abstract` **serialize**(): [`SerializedNodeCollection`](../type-aliases/SerializedNodeCollection.md)

#### Returns

[`SerializedNodeCollection`](../type-aliases/SerializedNodeCollection.md)

#### Overrides

[`NodeCollection`](NodeCollection.md) . [`serialize`](NodeCollection.md#serialize)

#### Defined in

[packages/cad-styling/src/CombineNodeCollectionBase.ts:71](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts#L71)
