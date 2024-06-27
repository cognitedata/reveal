---
id: "cognite_reveal.TreeIndexNodeCollection"
title: "Class: TreeIndexNodeCollection"
sidebar_label: "TreeIndexNodeCollection"
custom_edit_url: null
---

[@cognite/reveal](../modules/cognite_reveal.md).TreeIndexNodeCollection

Node collection that holds a set of nodes defined by a set of tree indices.

## Hierarchy

- [`NodeCollection`](cognite_reveal.NodeCollection.md)

  ↳ **`TreeIndexNodeCollection`**

## Constructors

### constructor

• **new TreeIndexNodeCollection**(`treeIndexSet?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `treeIndexSet?` | [`IndexSet`](cognite_reveal.IndexSet.md) |

#### Overrides

NodeCollection.constructor

#### Defined in

[packages/cad-styling/src/TreeIndexNodeCollection.ts:23](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L23)

• **new TreeIndexNodeCollection**(`treeIndices?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `treeIndices?` | `Iterable`\<`number`\> |

#### Overrides

NodeCollection.constructor

#### Defined in

[packages/cad-styling/src/TreeIndexNodeCollection.ts:24](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L24)

• **new TreeIndexNodeCollection**(`treeIndexRange?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `treeIndexRange?` | [`NumericRange`](cognite_reveal.NumericRange.md) |

#### Overrides

NodeCollection.constructor

#### Defined in

[packages/cad-styling/src/TreeIndexNodeCollection.ts:25](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L25)

## Properties

### classToken

▪ `Static` `Readonly` **classToken**: ``"TreeIndexNodeCollection"``

#### Defined in

[packages/cad-styling/src/TreeIndexNodeCollection.ts:18](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L18)

## Accessors

### classToken

• `get` **classToken**(): `string`

#### Returns

`string`

#### Inherited from

NodeCollection.classToken

#### Defined in

[packages/cad-styling/src/NodeCollection.ts:23](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/NodeCollection.ts#L23)

___

### isLoading

• `get` **isLoading**(): `boolean`

#### Returns

`boolean`

#### Overrides

NodeCollection.isLoading

#### Defined in

[packages/cad-styling/src/TreeIndexNodeCollection.ts:110](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L110)

## Methods

### addAreaPoints

▸ **addAreaPoints**(`points`): `void`

Add points to this node collection's area set.
This effectively adds boxes of size 1x1x1 meter with the points as their centers.

#### Parameters

| Name | Type |
| :------ | :------ |
| `points` | `Vector3`[] |

#### Returns

`void`

#### Defined in

[packages/cad-styling/src/TreeIndexNodeCollection.ts:96](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L96)

___

### addAreas

▸ **addAreas**(`areas`): `void`

Add areas to this node collection's area set.
Nearby areas may be clustered and merged together to keep
the number of areas in the set small.

#### Parameters

| Name | Type |
| :------ | :------ |
| `areas` | `Box3`[] |

#### Returns

`void`

#### Defined in

[packages/cad-styling/src/TreeIndexNodeCollection.ts:84](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L84)

___

### clear

▸ **clear**(): `void`

Sets this set to hold an empty set.

#### Returns

`void`

#### Overrides

[NodeCollection](cognite_reveal.NodeCollection.md).[clear](cognite_reveal.NodeCollection.md#clear)

#### Defined in

[packages/cad-styling/src/TreeIndexNodeCollection.ts:56](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L56)

___

### clearAreas

▸ **clearAreas**(): `void`

#### Returns

`void`

#### Defined in

[packages/cad-styling/src/TreeIndexNodeCollection.ts:106](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L106)

___

### getAreas

▸ **getAreas**(): [`AreaCollection`](../interfaces/cognite_reveal.AreaCollection.md)

Returns areas surrounding the nodes in the collection. The areas
are boxes in "ThreeJS coordinates". Note that not all
implementations supports this.

#### Returns

[`AreaCollection`](../interfaces/cognite_reveal.AreaCollection.md)

#### Overrides

[NodeCollection](cognite_reveal.NodeCollection.md).[getAreas](cognite_reveal.NodeCollection.md#getareas)

#### Defined in

[packages/cad-styling/src/TreeIndexNodeCollection.ts:65](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L65)

___

### getIndexSet

▸ **getIndexSet**(): [`IndexSet`](cognite_reveal.IndexSet.md)

#### Returns

[`IndexSet`](cognite_reveal.IndexSet.md)

#### Overrides

[NodeCollection](cognite_reveal.NodeCollection.md).[getIndexSet](cognite_reveal.NodeCollection.md#getindexset)

#### Defined in

[packages/cad-styling/src/TreeIndexNodeCollection.ts:61](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L61)

___

### off

▸ **off**(`event`, `listener`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

#### Returns

`void`

#### Inherited from

[NodeCollection](cognite_reveal.NodeCollection.md).[off](cognite_reveal.NodeCollection.md#off)

#### Defined in

[packages/cad-styling/src/NodeCollection.ts:32](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/NodeCollection.ts#L32)

___

### on

▸ **on**(`event`, `listener`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

#### Returns

`void`

#### Inherited from

[NodeCollection](cognite_reveal.NodeCollection.md).[on](cognite_reveal.NodeCollection.md#on)

#### Defined in

[packages/cad-styling/src/NodeCollection.ts:27](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/NodeCollection.ts#L27)

___

### serialize

▸ **serialize**(): [`SerializedNodeCollection`](../modules/cognite_reveal.md#serializednodecollection)

#### Returns

[`SerializedNodeCollection`](../modules/cognite_reveal.md#serializednodecollection)

#### Overrides

[NodeCollection](cognite_reveal.NodeCollection.md).[serialize](cognite_reveal.NodeCollection.md#serialize)

#### Defined in

[packages/cad-styling/src/TreeIndexNodeCollection.ts:114](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L114)

___

### updateSet

▸ **updateSet**(`treeIndices`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `treeIndices` | [`IndexSet`](cognite_reveal.IndexSet.md) |

#### Returns

`void`

#### Defined in

[packages/cad-styling/src/TreeIndexNodeCollection.ts:37](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L37)

▸ **updateSet**(`treeIndices`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `treeIndices` | [`NumericRange`](cognite_reveal.NumericRange.md) |

#### Returns

`void`

#### Defined in

[packages/cad-styling/src/TreeIndexNodeCollection.ts:38](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L38)

▸ **updateSet**(`treeIndices`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `treeIndices` | `Iterable`\<`number`\> |

#### Returns

`void`

#### Defined in

[packages/cad-styling/src/TreeIndexNodeCollection.ts:39](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L39)
