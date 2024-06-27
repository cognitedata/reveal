# Class: Vector3Pool

**`Beta`**

Represents a pool of Vector3 objects that can be reused.

## Constructors

### new Vector3Pool()

> **new Vector3Pool**(`size`): [`Vector3Pool`](Vector3Pool.md)

**`Beta`**

Creates a new Vector3Pool instance.

#### Parameters

• **size**: `number` = `30`

The size of the pool (default: 30)

#### Returns

[`Vector3Pool`](Vector3Pool.md)

#### Defined in

[packages/utilities/src/three/Vector3Pool.ts:20](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/three/Vector3Pool.ts#L20)

## Methods

### getNext()

> **getNext**(`copyFrom`?): `Vector3`

**`Beta`**

Gets the next available Vector3 object from the pool.

#### Parameters

• **copyFrom?**: `Vector3`

An optional Vector3 object to copy the values from

#### Returns

`Vector3`

The next available Vector3 object

#### Defined in

[packages/utilities/src/three/Vector3Pool.ts:30](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/three/Vector3Pool.ts#L30)
