# Interface: AreaCollection

Represents a collection of areas/axis-aligned
bounding boxes for use e.g. for load prioritization. Implementations
are not expected to store all areas inserted with `addAreas`,
but rather some "representative box set" covering the inserted areas.
Performance will be better the fewer boxes the representative set contains,
while the effectiveness of node prioritization will suffer if the
representative set covers too much area that is not part
of the inserted boxes

## Properties

### isEmpty

> `readonly` **isEmpty**: `boolean`

#### Defined in

[packages/cad-styling/src/prioritized/AreaCollection.ts:18](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/prioritized/AreaCollection.ts#L18)

## Methods

### addAreas()

> **addAreas**(`boxes`): `void`

Add areas to be covered by the representative set of this
AreaCollection.

#### Parameters

• **boxes**: `Iterable`\<`Box3`\>

#### Returns

`void`

#### Defined in

[packages/cad-styling/src/prioritized/AreaCollection.ts:36](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/prioritized/AreaCollection.ts#L36)

***

### areas()

> **areas**(): `Generator`\<`Box3`, `any`, `unknown`\>

Return some set of boxes that cover the boxes inserted with `addAreas`.
It is required that each inserted box is completely covered by some
subset of boxes in the set returned from `areas`

#### Returns

`Generator`\<`Box3`, `any`, `unknown`\>

#### Defined in

[packages/cad-styling/src/prioritized/AreaCollection.ts:25](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/prioritized/AreaCollection.ts#L25)

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

#### Defined in

[packages/cad-styling/src/prioritized/AreaCollection.ts:45](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/prioritized/AreaCollection.ts#L45)

***

### intersectsBox()

> **intersectsBox**(`box`): `boolean`

Return whether the input box intersects the AreaCollection.

#### Parameters

• **box**: `Box3`

#### Returns

`boolean`

#### Defined in

[packages/cad-styling/src/prioritized/AreaCollection.ts:30](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/prioritized/AreaCollection.ts#L30)
