# Class: CustomObjectIntersectInput

**`Beta`**

This class is used as input for intersecting custom objects

## Constructors

### new CustomObjectIntersectInput()

> **new CustomObjectIntersectInput**(`normalizedCoords`, `camera`, `clippingPlanes`): [`CustomObjectIntersectInput`](CustomObjectIntersectInput.md)

**`Beta`**

#### Parameters

• **normalizedCoords**: `Vector2`

• **camera**: `PerspectiveCamera`

• **clippingPlanes**: `undefined` \| `Plane`[] = `undefined`

#### Returns

[`CustomObjectIntersectInput`](CustomObjectIntersectInput.md)

#### Defined in

[packages/utilities/src/customObject/CustomObjectIntersectInput.ts:18](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/utilities/src/customObject/CustomObjectIntersectInput.ts#L18)

## Properties

### camera

> `readonly` **camera**: `PerspectiveCamera`

**`Beta`**

#### Defined in

[packages/utilities/src/customObject/CustomObjectIntersectInput.ts:14](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/utilities/src/customObject/CustomObjectIntersectInput.ts#L14)

***

### clippingPlanes

> `readonly` **clippingPlanes**: `undefined` \| `Plane`[]

**`Beta`**

#### Defined in

[packages/utilities/src/customObject/CustomObjectIntersectInput.ts:15](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/utilities/src/customObject/CustomObjectIntersectInput.ts#L15)

***

### normalizedCoords

> `readonly` **normalizedCoords**: `Vector2`

**`Beta`**

#### Defined in

[packages/utilities/src/customObject/CustomObjectIntersectInput.ts:13](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/utilities/src/customObject/CustomObjectIntersectInput.ts#L13)

***

### raycaster

> `readonly` **raycaster**: `Raycaster`

**`Beta`**

#### Defined in

[packages/utilities/src/customObject/CustomObjectIntersectInput.ts:16](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/utilities/src/customObject/CustomObjectIntersectInput.ts#L16)

## Methods

### isVisible()

> **isVisible**(`point`): `boolean`

**`Beta`**

#### Parameters

• **point**: `Vector3`

#### Returns

`boolean`

#### Defined in

[packages/utilities/src/customObject/CustomObjectIntersectInput.ts:25](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/utilities/src/customObject/CustomObjectIntersectInput.ts#L25)
