# Type Alias: PointCloudObjectMetadata

> **PointCloudObjectMetadata**: `object`

Metadata for a single point cloud object

## Type declaration

### annotationId

> **annotationId**: `number`

The CDF Annotation ID associated with the point cloud object.

### ~~assetId?~~

> `optional` **assetId**: `number`

The CDF Asset ID associated with the point cloud object, if any.

#### Deprecated

Use PointCloudObjectMetadata.assetRef instead.

### assetRef?

> `optional` **assetRef**: `AnnotationsAssetRef`

Asset identifiers for asset associated with this point cloud object, if any.

### boundingBox

> **boundingBox**: `Box3`

The bounding box of this annotation

## Defined in

[packages/data-providers/src/pointcloud-stylable-object-providers/types.ts:21](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/data-providers/src/pointcloud-stylable-object-providers/types.ts#L21)
