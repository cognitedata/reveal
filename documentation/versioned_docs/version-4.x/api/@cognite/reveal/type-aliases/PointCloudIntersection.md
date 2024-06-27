# Type Alias: PointCloudIntersection

> **PointCloudIntersection**: `object`

## Type declaration

### annotationId

> **annotationId**: `number`

Annotation Id of the intersected object within a pointcloud. (0 if not applicable)

### assetRef?

> `optional` **assetRef**: `AnnotationsAssetRef`

Reference to the asset associated to the intersected point cloud object, if any.

### distanceToCamera

> **distanceToCamera**: `number`

Distance from the camera to the intersection.

### model

> **model**: [`CognitePointCloudModel`](../classes/CognitePointCloudModel.md)

The model that was intersected.

### point

> **point**: `Vector3`

Coordinate of the intersection.

### pointIndex

> **pointIndex**: `number`

The index of the point that was intersected.

### type

> **type**: `"pointcloud"`

The intersection type.

## Defined in

[packages/pointclouds/src/PointCloudIntersection.ts:8](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/pointclouds/src/PointCloudIntersection.ts#L8)
