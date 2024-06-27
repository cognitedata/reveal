# Class: TreeIndexNodeCollection

Node collection that holds a set of nodes defined by a set of tree indices.

## Extends

- [`NodeCollection`](NodeCollection.md)

## Constructors

### new TreeIndexNodeCollection()

> **new TreeIndexNodeCollection**(`treeIndexSet`?): [`TreeIndexNodeCollection`](TreeIndexNodeCollection.md)

#### Parameters

• **treeIndexSet?**: [`IndexSet`](IndexSet.md)

#### Returns

[`TreeIndexNodeCollection`](TreeIndexNodeCollection.md)

#### Overrides

`NodeCollection.constructor`

#### Defined in

[packages/cad-styling/src/TreeIndexNodeCollection.ts:23](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L23)

### new TreeIndexNodeCollection()

> **new TreeIndexNodeCollection**(`treeIndices`?): [`TreeIndexNodeCollection`](TreeIndexNodeCollection.md)

#### Parameters

• **treeIndices?**: `Iterable`\<`number`\>

#### Returns

[`TreeIndexNodeCollection`](TreeIndexNodeCollection.md)

#### Overrides

`NodeCollection.constructor`

#### Defined in

[packages/cad-styling/src/TreeIndexNodeCollection.ts:24](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L24)

### new TreeIndexNodeCollection()

> **new TreeIndexNodeCollection**(`treeIndexRange`?): [`TreeIndexNodeCollection`](TreeIndexNodeCollection.md)

#### Parameters

• **treeIndexRange?**: [`NumericRange`](NumericRange.md)

#### Returns

[`TreeIndexNodeCollection`](TreeIndexNodeCollection.md)

#### Overrides

`NodeCollection.constructor`

#### Defined in

[packages/cad-styling/src/TreeIndexNodeCollection.ts:25](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L25)

## Properties

### classToken

> `readonly` `static` **classToken**: `"TreeIndexNodeCollection"` = `'TreeIndexNodeCollection'`

#### Defined in

[packages/cad-styling/src/TreeIndexNodeCollection.ts:18](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L18)

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

[packages/cad-styling/src/TreeIndexNodeCollection.ts:110](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L110)

## Methods

### addAreaPoints()

> **addAreaPoints**(`points`): `void`

Add points to this node collection's area set.
This effectively adds boxes of size 1x1x1 meter with the points as their centers.

#### Parameters

• **points**: `Vector3`[]

#### Returns

`void`

#### Defined in

[packages/cad-styling/src/TreeIndexNodeCollection.ts:96](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L96)

***

### addAreas()

> **addAreas**(`areas`): `void`

Add areas to this node collection's area set.
Nearby areas may be clustered and merged together to keep
the number of areas in the set small.

#### Parameters

• **areas**: `Box3`[]

#### Returns

`void`

#### Defined in

[packages/cad-styling/src/TreeIndexNodeCollection.ts:84](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L84)

***

### clear()

> **clear**(): `void`

Sets this set to hold an empty set.

#### Returns

`void`

#### Overrides

[`NodeCollection`](NodeCollection.md) . [`clear`](NodeCollection.md#clear)

#### Defined in

[packages/cad-styling/src/TreeIndexNodeCollection.ts:56](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L56)

***

### clearAreas()

> **clearAreas**(): `void`

#### Returns

`void`

#### Defined in

[packages/cad-styling/src/TreeIndexNodeCollection.ts:106](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L106)

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

[packages/cad-styling/src/TreeIndexNodeCollection.ts:65](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L65)

***

### getIndexSet()

> **getIndexSet**(): [`IndexSet`](IndexSet.md)

#### Returns

[`IndexSet`](IndexSet.md)

#### Overrides

[`NodeCollection`](NodeCollection.md) . [`getIndexSet`](NodeCollection.md#getindexset)

#### Defined in

[packages/cad-styling/src/TreeIndexNodeCollection.ts:61](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L61)

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

[packages/cad-styling/src/TreeIndexNodeCollection.ts:114](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L114)

***

### updateSet()

#### updateSet(treeIndices)

> **updateSet**(`treeIndices`): `void`

##### Parameters

• **treeIndices**: [`IndexSet`](IndexSet.md)

##### Returns

`void`

##### Defined in

[packages/cad-styling/src/TreeIndexNodeCollection.ts:37](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L37)

#### updateSet(treeIndices)

> **updateSet**(`treeIndices`): `void`

##### Parameters

• **treeIndices**: [`NumericRange`](NumericRange.md)

##### Returns

`void`

##### Defined in

[packages/cad-styling/src/TreeIndexNodeCollection.ts:38](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L38)

#### updateSet(treeIndices)

> **updateSet**(`treeIndices`): `void`

##### Parameters

• **treeIndices**: `Iterable`\<`number`\>

##### Returns

`void`

##### Defined in

[packages/cad-styling/src/TreeIndexNodeCollection.ts:39](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L39)
