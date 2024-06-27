# Type Alias: CustomObjectIntersection

> **CustomObjectIntersection**: `object`

**`Beta`**

This class is used as output intersecting custom objects

## Type declaration

### boundingBox?

> `optional` **boundingBox**: `Box3`

**`Beta`**

The bounding box of the part of the CustomObject that was intersected.

### customObject

> **customObject**: [`ICustomObject`](../interfaces/ICustomObject.md)

**`Beta`**

The CustomObject that was intersected.

### distanceToCamera

> **distanceToCamera**: `number`

**`Beta`**

Distance from the camera to the intersection.

### point

> **point**: `Vector3`

**`Beta`**

Coordinate of the intersection.

### type

> **type**: `"customObject"`

**`Beta`**

The intersection type.

### userData?

> `optional` **userData**: `any`

**`Beta`**

Additional info, for instance which part of the CustomObject was intersected.

## Defined in

[packages/utilities/src/customObject/CustomObjectIntersection.ts:12](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/customObject/CustomObjectIntersection.ts#L12)
