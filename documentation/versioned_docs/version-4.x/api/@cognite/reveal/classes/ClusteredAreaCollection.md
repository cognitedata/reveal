# Class: ClusteredAreaCollection

AreaCollection that stores a representative box set by merging
inserted boxes that are overlapping or close to each other.
It uses simple heuristics to determine which boxes are to be merged.

## Implements

- [`AreaCollection`](../interfaces/AreaCollection.md)

## Constructors

### new ClusteredAreaCollection()

> **new ClusteredAreaCollection**(): [`ClusteredAreaCollection`](ClusteredAreaCollection.md)

#### Returns

[`ClusteredAreaCollection`](ClusteredAreaCollection.md)

## Accessors

### isEmpty

> `get` **isEmpty**(): `boolean`

#### Returns

`boolean`

#### Implementation of

[`AreaCollection`](../interfaces/AreaCollection.md) . [`isEmpty`](../interfaces/AreaCollection.md#isempty)

#### Defined in

[packages/cad-styling/src/prioritized/ClusteredAreaCollection.ts:17](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/prioritized/ClusteredAreaCollection.ts#L17)

## Methods

### addAreas()

> **addAreas**(`boxes`): `void`

Add areas to be covered by the representative set of this
AreaCollection.

#### Parameters

• **boxes**: `Iterable`\<`Box3`\>

#### Returns

`void`

#### Implementation of

[`AreaCollection`](../interfaces/AreaCollection.md) . [`addAreas`](../interfaces/AreaCollection.md#addareas)

#### Defined in

[packages/cad-styling/src/prioritized/ClusteredAreaCollection.ts:35](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/prioritized/ClusteredAreaCollection.ts#L35)

***

### areas()

> **areas**(): `Generator`\<`Box3`, `any`, `unknown`\>

Return some set of boxes that cover the boxes inserted with `addAreas`.
It is required that each inserted box is completely covered by some
subset of boxes in the set returned from `areas`

#### Returns

`Generator`\<`Box3`, `any`, `unknown`\>

#### Implementation of

[`AreaCollection`](../interfaces/AreaCollection.md) . [`areas`](../interfaces/AreaCollection.md#areas)

#### Defined in

[packages/cad-styling/src/prioritized/ClusteredAreaCollection.ts:21](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/prioritized/ClusteredAreaCollection.ts#L21)

***

### intersectWith()

> **intersectWith**(`boxes`): `void`

Alter the representative set to cover only the intersection between the
representative set of this AreaCollection and the incoming boxes.
Note that the intersection of two representative sets A' and B' that
represent the original box sets A and B will cover the intersection between
A and B, and will thus be a valid representative set for the intersection of A and B.

#### Parameters

• **boxes**: `Iterable`\<`Box3`\>

#### Returns

`void`

#### Implementation of

[`AreaCollection`](../interfaces/AreaCollection.md) . [`intersectWith`](../interfaces/AreaCollection.md#intersectwith)

#### Defined in

[packages/cad-styling/src/prioritized/ClusteredAreaCollection.ts:39](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/prioritized/ClusteredAreaCollection.ts#L39)

***

### intersectsBox()

> **intersectsBox**(`box`): `boolean`

Return whether the input box intersects the AreaCollection.

#### Parameters

• **box**: `Box3`

#### Returns

`boolean`

#### Implementation of

[`AreaCollection`](../interfaces/AreaCollection.md) . [`intersectsBox`](../interfaces/AreaCollection.md#intersectsbox)

#### Defined in

[packages/cad-styling/src/prioritized/ClusteredAreaCollection.ts:25](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/prioritized/ClusteredAreaCollection.ts#L25)
