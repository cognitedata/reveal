# Class: `abstract` NodeCollection

Abstract class for implementing a set of nodes to be styled.

## Extended by

- [`CdfNodeCollectionBase`](CdfNodeCollectionBase.md)
- [`CombineNodeCollectionBase`](CombineNodeCollectionBase.md)
- [`TreeIndexNodeCollection`](TreeIndexNodeCollection.md)
- [`AssetNodeCollection`](AssetNodeCollection.md)
- [`InvertedNodeCollection`](InvertedNodeCollection.md)

## Accessors

### classToken

> `get` **classToken**(): `string`

#### Returns

`string`

#### Defined in

[packages/cad-styling/src/NodeCollection.ts:23](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/NodeCollection.ts#L23)

***

### isLoading

> `get` `abstract` **isLoading**(): `boolean`

#### Returns

`boolean`

#### Defined in

[packages/cad-styling/src/NodeCollection.ts:37](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/NodeCollection.ts#L37)

## Methods

### clear()

> `abstract` **clear**(): `void`

#### Returns

`void`

#### Defined in

[packages/cad-styling/src/NodeCollection.ts:45](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/NodeCollection.ts#L45)

***

### getAreas()

> `abstract` **getAreas**(): [`AreaCollection`](../interfaces/AreaCollection.md)

Returns areas surrounding the nodes in the collection. The areas
are boxes in "ThreeJS coordinates". Note that not all
implementations supports this.

#### Returns

[`AreaCollection`](../interfaces/AreaCollection.md)

#### Defined in

[packages/cad-styling/src/NodeCollection.ts:44](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/NodeCollection.ts#L44)

***

### getIndexSet()

> `abstract` **getIndexSet**(): [`IndexSet`](IndexSet.md)

#### Returns

[`IndexSet`](IndexSet.md)

#### Defined in

[packages/cad-styling/src/NodeCollection.ts:38](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/NodeCollection.ts#L38)

***

### off()

> **off**(`event`, `listener`): `void`

#### Parameters

• **event**: `"changed"`

• **listener**

#### Returns

`void`

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

#### Defined in

[packages/cad-styling/src/NodeCollection.ts:27](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/NodeCollection.ts#L27)

***

### serialize()

> `abstract` **serialize**(): [`SerializedNodeCollection`](../type-aliases/SerializedNodeCollection.md)

#### Returns

[`SerializedNodeCollection`](../type-aliases/SerializedNodeCollection.md)

#### Defined in

[packages/cad-styling/src/NodeCollection.ts:46](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/NodeCollection.ts#L46)
