---
id: "cognite_reveal.CognitePointCloudModel"
title: "Class: CognitePointCloudModel"
sidebar_label: "CognitePointCloudModel"
custom_edit_url: null
---

[@cognite/reveal](../modules/cognite_reveal.md).CognitePointCloudModel

## Properties

### modelId

• `Readonly` **modelId**: `number`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:30](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L30)

___

### revisionId

• `Readonly` **revisionId**: `number`

The modelId of the point cloud model in Cognite Data Fusion.

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:34](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L34)

___

### type

• `Readonly` **type**: [`SupportedModelTypes`](../modules/cognite_reveal.md#supportedmodeltypes) = `'pointcloud'`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:29](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L29)

## Accessors

### pointColorType

• `get` **pointColorType**(): [`PointColorType`](../enums/cognite_reveal.PointColorType.md)

Determines how points currently are colored.

#### Returns

[`PointColorType`](../enums/cognite_reveal.PointColorType.md)

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:186](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L186)

• `set` **pointColorType**(`type`): `void`

Specifies how points are colored.

**`Default`**

```ts
PointColorType.Rgb
```

**`Example`**

```js
model.pointColorType = PointColorType.Rgb
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | [`PointColorType`](../enums/cognite_reveal.PointColorType.md) |

#### Returns

`void`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:198](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L198)

___

### pointShape

• `get` **pointShape**(): [`PointShape`](../enums/cognite_reveal.PointShape.md)

Sets the point shape of each rendered point in the point cloud.

**`Default`**

`PointShape.Circle`

**`See`**

[PointShape](../enums/cognite_reveal.PointShape.md).

#### Returns

[`PointShape`](../enums/cognite_reveal.PointShape.md)

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:238](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L238)

• `set` **pointShape**(`shape`): `void`

Gets the point shape of each rendered point in the point cloud.

**`See`**

[PointShape](../enums/cognite_reveal.PointShape.md).

#### Parameters

| Name | Type |
| :------ | :------ |
| `shape` | [`PointShape`](../enums/cognite_reveal.PointShape.md) |

#### Returns

`void`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:246](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L246)

___

### pointSize

• `get` **pointSize**(): `number`

Returns the size of each rendered point in the point cloud.

#### Returns

`number`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:205](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L205)

• `set` **pointSize**(`size`): `void`

Sets the size of each rendered point in the point cloud.

**`Default`**

`1`

#### Parameters

| Name | Type |
| :------ | :------ |
| `size` | `number` |

#### Returns

`void`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:213](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L213)

___

### pointSizeType

• `get` **pointSizeType**(): [`PointSizeType`](../enums/cognite_reveal.PointSizeType.md)

Get the point size type.

#### Returns

[`PointSizeType`](../enums/cognite_reveal.PointSizeType.md)

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:220](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L220)

• `set` **pointSizeType**(`type`): `void`

Set the point size type for the point cloud.
The point size type can be either Fixed or Adaptive.

**`Default`**

`PointSizeType.Adaptive`

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | [`PointSizeType`](../enums/cognite_reveal.PointSizeType.md) |

#### Returns

`void`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:229](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L229)

___

### stylableObjectCount

• `get` **stylableObjectCount**(): `number`

#### Returns

`number`

The number of stylable objects

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:340](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L340)

___

### styledCollections

• `get` **styledCollections**(): [`StyledPointCloudObjectCollection`](cognite_reveal.StyledPointCloudObjectCollection.md)[]

Gets the object collections that have been assigned a style

#### Returns

[`StyledPointCloudObjectCollection`](cognite_reveal.StyledPointCloudObjectCollection.md)[]

All object collections and their associated style

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:285](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L285)

___

### visiblePointCount

• `get` **visiblePointCount**(): `number`

Returns the current number of visible/loaded points.

#### Returns

`number`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:179](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L179)

## Methods

### assignStyledObjectCollection

▸ **assignStyledObjectCollection**(`objectCollection`, `appearance`): `void`

Assign a style to a collection of objects. If the object collection has been assigned
a style previously, the previous style will be replaced by the new one.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `objectCollection` | [`PointCloudObjectCollection`](cognite_reveal.PointCloudObjectCollection.md) | The object collection to assign a style to |
| `appearance` | [`PointCloudAppearance`](../modules/cognite_reveal.md#pointcloudappearance) | The style to assign to the object collection |

#### Returns

`void`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:295](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L295)

___

### dispose

▸ **dispose**(): `void`

Used to clean up memory.

#### Returns

`void`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:58](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L58)

___

### getCameraConfiguration

▸ **getCameraConfiguration**(): `undefined` \| [`CameraConfiguration`](../modules/cognite_reveal.md#cameraconfiguration)

Retrieves the camera position and target stored for the model. Typically this
is used to store a good starting position for a model. Returns `undefined` if there
isn't any stored camera configuration for the model.

#### Returns

`undefined` \| [`CameraConfiguration`](../modules/cognite_reveal.md#cameraconfiguration)

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:84](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L84)

___

### getCdfToDefaultModelTransformation

▸ **getCdfToDefaultModelTransformation**(`out?`): `Matrix4`

Gets transformation from CDF space to ThreeJS space,
which includes any additional "default" transformations assigned to this model.
Does not include any custom transformations set by [setModelTransformation](cognite_reveal.CognitePointCloudModel.md#setmodeltransformation)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `out?` | `Matrix4` | Preallocated `THREE.Matrix4` (optional) |

#### Returns

`Matrix4`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:111](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L111)

___

### getClasses

▸ **getClasses**(): \{ `code`: `number` ; `name`: `string`  }[]

Returns a list of sorted classification names and codes present in the model.
Names will be the custom names provided by the user, or a default one if none have been provided.

#### Returns

\{ `code`: `number` ; `name`: `string`  }[]

A sorted list of classification codes and names from the model.

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:172](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L172)

___

### getDefaultPointCloudAppearance

▸ **getDefaultPointCloudAppearance**(): [`PointCloudAppearance`](../modules/cognite_reveal.md#pointcloudappearance)

Gets default point appearance

#### Returns

[`PointCloudAppearance`](../modules/cognite_reveal.md#pointcloudappearance)

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:268](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L268)

___

### getModelBoundingBox

▸ **getModelBoundingBox**(`outBbox?`): `Box3`

**`Example`**

```js
const box = new THREE.Box3()
model.getModelBoundingBox(box);
// box now has the bounding box
```
```js
// the following code does the same
const box = model.getModelBoundingBox();
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `outBbox?` | `Box3` | Optional. Used to write result to. |

#### Returns

`Box3`

Model's bounding box.

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:75](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L75)

___

### getModelClippingPlanes

▸ **getModelClippingPlanes**(): `Plane`[]

Get the clipping planes for this model.

#### Returns

`Plane`[]

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:261](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L261)

___

### getModelTransformation

▸ **getModelTransformation**(`out?`): `Matrix4`

Gets transformation matrix that has previously been
set with [setModelTransformation](cognite_reveal.CognitePointCloudModel.md#setmodeltransformation).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `out?` | `Matrix4` | Preallocated `THREE.Matrix4` (optional). |

#### Returns

`Matrix4`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:101](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L101)

___

### hasClass

▸ **hasClass**(`pointClass`): `boolean`

Returns true if the model has values with the given classification class.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `pointClass` | `number` | ASPRS classification class code. Either one of the well known classes from [WellKnownAsprsPointClassCodes](../enums/cognite_reveal.WellKnownAsprsPointClassCodes.md) or a number for user defined classes. |

#### Returns

`boolean`

True if model has values in the class given.

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:163](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L163)

___

### isClassVisible

▸ **isClassVisible**(`pointClass`): `boolean`

Determines if points from a given class are visible.

**`Throws`**

Error if the model doesn't have the class given.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `pointClass` | `number` | ASPRS classification class code. Either one of the well known classes from [WellKnownAsprsPointClassCodes](../enums/cognite_reveal.WellKnownAsprsPointClassCodes.md) or a number for user defined classes. |

#### Returns

`boolean`

True if points from the given class will be visible.

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:153](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L153)

___

### mapBoxFromCdfToModelCoordinates

▸ **mapBoxFromCdfToModelCoordinates**(`box`, `out?`): `Box3`

Map bounding box from CDF to model space, taking the model's custom transformation into account

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `box` | `Box3` | Box to compute transformation from |
| `out` | `Box3` | Optional pre-allocated box |

#### Returns

`Box3`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:130](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L130)

___

### mapPointFromCdfToModelCoordinates

▸ **mapPointFromCdfToModelCoordinates**(`point`, `out?`): `Vector3`

Map point from CDF to model space, taking the model's custom transformation into account

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `point` | `Vector3` | Point to compute transformation from |
| `out` | `Vector3` | Optional pre-allocated point |

#### Returns

`Vector3`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:120](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L120)

___

### removeAllStyledObjectCollections

▸ **removeAllStyledObjectCollections**(): `void`

Removes styling on all object collections in this model

#### Returns

`void`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:332](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L332)

___

### setClassVisible

▸ **setClassVisible**(`pointClass`, `visible`): `void`

Sets a visible filter on points of a given class.

**`Throws`**

Error if the model doesn't have the class given.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `pointClass` | `number` | ASPRS classification class code. Either one of the well known classes from [WellKnownAsprsPointClassCodes](../enums/cognite_reveal.WellKnownAsprsPointClassCodes.md) or a number for user defined classes. |
| `visible` | `boolean` | Boolean flag that determines if the point class type should be visible or not. |

#### Returns

`void`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:142](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L142)

___

### setDefaultPointCloudAppearance

▸ **setDefaultPointCloudAppearance**(`appearance`): `void`

Sets default apparance for points that are not styled otherwise

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `appearance` | [`PointCloudAppearance`](../modules/cognite_reveal.md#pointcloudappearance) | Appearance to assign as default |

#### Returns

`void`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:276](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L276)

___

### setModelClippingPlanes

▸ **setModelClippingPlanes**(`clippingPlanes`): `void`

Sets the clipping planes for this model. They will be combined with the
global clipping planes.

#### Parameters

| Name | Type |
| :------ | :------ |
| `clippingPlanes` | `Plane`[] |

#### Returns

`void`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:254](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L254)

___

### setModelTransformation

▸ **setModelTransformation**(`transformationMatrix`): `void`

Sets transformation matrix of the model. This overrides the current transformation.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `transformationMatrix` | `Matrix4` | The new transformation matrix |

#### Returns

`void`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:92](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L92)

___

### traverseStylableObjects

▸ **traverseStylableObjects**(`callback`): `void`

Iterates through all stylable objects for this model

**`Example`**

```js
model.traverseStylableObjects(
    annotationMetadata => console.log(annotationMetadata.annotationId)
);
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | (`annotationMetadata`: [`PointCloudObjectMetadata`](../modules/cognite_reveal.md#pointcloudobjectmetadata)) => `void` |

#### Returns

`void`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:353](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L353)

___

### unassignStyledObjectCollection

▸ **unassignStyledObjectCollection**(`objectCollection`): `void`

Unassign style from an already styled object collection.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `objectCollection` | [`PointCloudObjectCollection`](cognite_reveal.PointCloudObjectCollection.md) | The object collection from which to remove the style |

#### Returns

`void`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:313](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L313)
