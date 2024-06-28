# Class: CognitePointCloudModel

## Properties

### modelId

> `readonly` **modelId**: `number`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:30](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L30)

***

### revisionId

> `readonly` **revisionId**: `number`

The modelId of the point cloud model in Cognite Data Fusion.

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:34](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L34)

***

### type

> `readonly` **type**: [`SupportedModelTypes`](../type-aliases/SupportedModelTypes.md) = `'pointcloud'`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:29](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L29)

## Accessors

### pointColorType

> `get` **pointColorType**(): [`PointColorType`](../enumerations/PointColorType.md)

Determines how points currently are colored.

> `set` **pointColorType**(`type`): `void`

Specifies how points are colored.

#### Default

```ts
PointColorType.Rgb
```

#### Example

```js
model.pointColorType = PointColorType.Rgb
```

#### Parameters

• **type**: [`PointColorType`](../enumerations/PointColorType.md)

#### Returns

[`PointColorType`](../enumerations/PointColorType.md)

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:186](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L186)

***

### pointShape

> `get` **pointShape**(): [`PointShape`](../enumerations/PointShape.md)

Sets the point shape of each rendered point in the point cloud.

#### Default

`PointShape.Circle`

#### See

[PointShape](../enumerations/PointShape.md).

> `set` **pointShape**(`shape`): `void`

Gets the point shape of each rendered point in the point cloud.

#### See

[PointShape](../enumerations/PointShape.md).

#### Parameters

• **shape**: [`PointShape`](../enumerations/PointShape.md)

#### Returns

[`PointShape`](../enumerations/PointShape.md)

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:238](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L238)

***

### pointSize

> `get` **pointSize**(): `number`

Returns the size of each rendered point in the point cloud.

> `set` **pointSize**(`size`): `void`

Sets the size of each rendered point in the point cloud.

#### Default

`1`

#### Parameters

• **size**: `number`

#### Returns

`number`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:205](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L205)

***

### pointSizeType

> `get` **pointSizeType**(): [`PointSizeType`](../enumerations/PointSizeType.md)

Get the point size type.

> `set` **pointSizeType**(`type`): `void`

Set the point size type for the point cloud.
The point size type can be either Fixed or Adaptive.

#### Default

`PointSizeType.Adaptive`

#### Parameters

• **type**: [`PointSizeType`](../enumerations/PointSizeType.md)

#### Returns

[`PointSizeType`](../enumerations/PointSizeType.md)

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:220](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L220)

***

### stylableObjectCount

> `get` **stylableObjectCount**(): `number`

#### Returns

`number`

The number of stylable objects

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:358](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L358)

***

### styledCollections

> `get` **styledCollections**(): [`StyledPointCloudObjectCollection`](StyledPointCloudObjectCollection.md)[]

Gets the object collections that have been assigned a style

#### Returns

[`StyledPointCloudObjectCollection`](StyledPointCloudObjectCollection.md)[]

All object collections and their associated style

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:303](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L303)

***

### visible

> `get` **visible**(): `boolean`

Returns the model visibility.

> `set` **visible**(`value`): `void`

Sets the model visibility.

#### Example

```js
model.visible = false
```

#### Parameters

• **value**: `boolean`

#### Returns

`boolean`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:264](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L264)

***

### visiblePointCount

> `get` **visiblePointCount**(): `number`

Returns the current number of visible/loaded points.

#### Returns

`number`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:179](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L179)

## Methods

### assignStyledObjectCollection()

> **assignStyledObjectCollection**(`objectCollection`, `appearance`): `void`

Assign a style to a collection of objects. If the object collection has been assigned
a style previously, the previous style will be replaced by the new one.

#### Parameters

• **objectCollection**: [`PointCloudObjectCollection`](PointCloudObjectCollection.md)

The object collection to assign a style to

• **appearance**: [`PointCloudAppearance`](../type-aliases/PointCloudAppearance.md)

The style to assign to the object collection

#### Returns

`void`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:313](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L313)

***

### dispose()

> **dispose**(): `void`

Used to clean up memory.

#### Returns

`void`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:58](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L58)

***

### getCameraConfiguration()

> **getCameraConfiguration**(): `undefined` \| [`CameraConfiguration`](../type-aliases/CameraConfiguration.md)

Retrieves the camera position and target stored for the model. Typically this
is used to store a good starting position for a model. Returns `undefined` if there
isn't any stored camera configuration for the model.

#### Returns

`undefined` \| [`CameraConfiguration`](../type-aliases/CameraConfiguration.md)

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:84](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L84)

***

### getCdfToDefaultModelTransformation()

> **getCdfToDefaultModelTransformation**(`out`?): `Matrix4`

Gets transformation from CDF space to ThreeJS space,
which includes any additional "default" transformations assigned to this model.
Does not include any custom transformations set by [CognitePointCloudModel.setModelTransformation](CognitePointCloudModel.md#setmodeltransformation)

#### Parameters

• **out?**: `Matrix4`

Preallocated `THREE.Matrix4` (optional)

#### Returns

`Matrix4`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:111](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L111)

***

### getClasses()

> **getClasses**(): `object`[]

Returns a list of sorted classification names and codes present in the model.
Names will be the custom names provided by the user, or a default one if none have been provided.

#### Returns

`object`[]

A sorted list of classification codes and names from the model.

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:172](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L172)

***

### getDefaultPointCloudAppearance()

> **getDefaultPointCloudAppearance**(): [`PointCloudAppearance`](../type-aliases/PointCloudAppearance.md)

Gets default point appearance

#### Returns

[`PointCloudAppearance`](../type-aliases/PointCloudAppearance.md)

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:286](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L286)

***

### getModelBoundingBox()

> **getModelBoundingBox**(`outBoundingBox`?): `Box3`

#### Parameters

• **outBoundingBox?**: `Box3`

Optional. Used to write result to.

#### Returns

`Box3`

Model's bounding box.

#### Example

```js
const boundingBox = new THREE.Box3()
model.getModelBoundingBox(boundingBox);
// boundingBox now has the bounding box
```
```js
// the following code does the same
const boundingBox = model.getModelBoundingBox();
```

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:75](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L75)

***

### getModelClippingPlanes()

> **getModelClippingPlanes**(): `Plane`[]

Get the clipping planes for this model.

#### Returns

`Plane`[]

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:279](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L279)

***

### getModelTransformation()

> **getModelTransformation**(`out`?): `Matrix4`

Gets transformation matrix that has previously been
set with [CognitePointCloudModel.setModelTransformation](CognitePointCloudModel.md#setmodeltransformation).

#### Parameters

• **out?**: `Matrix4`

Preallocated `THREE.Matrix4` (optional).

#### Returns

`Matrix4`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:101](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L101)

***

### hasClass()

> **hasClass**(`pointClass`): `boolean`

Returns true if the model has values with the given classification class.

#### Parameters

• **pointClass**: `number`

ASPRS classification class code. Either one of the well known
classes from [WellKnownAsprsPointClassCodes](../enumerations/WellKnownAsprsPointClassCodes.md) or a number for user defined classes.

#### Returns

`boolean`

True if model has values in the class given.

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:163](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L163)

***

### isClassVisible()

> **isClassVisible**(`pointClass`): `boolean`

Determines if points from a given class are visible.

#### Parameters

• **pointClass**: `number`

ASPRS classification class code. Either one of the well known
classes from [WellKnownAsprsPointClassCodes](../enumerations/WellKnownAsprsPointClassCodes.md) or a number for user defined classes.

#### Returns

`boolean`

True if points from the given class will be visible.

#### Throws

Error if the model doesn't have the class given.

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:153](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L153)

***

### mapBoxFromCdfToModelCoordinates()

> **mapBoxFromCdfToModelCoordinates**(`box`, `out`): `Box3`

Map bounding box from CDF to model space, taking the model's custom transformation into account

#### Parameters

• **box**: `Box3`

Box to compute transformation from

• **out**: `Box3` = `...`

Optional pre-allocated box

#### Returns

`Box3`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:130](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L130)

***

### mapPointFromCdfToModelCoordinates()

> **mapPointFromCdfToModelCoordinates**(`point`, `out`): `Vector3`

Map point from CDF to model space, taking the model's custom transformation into account

#### Parameters

• **point**: `Vector3`

Point to compute transformation from

• **out**: `Vector3` = `...`

Optional pre-allocated point

#### Returns

`Vector3`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:120](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L120)

***

### removeAllStyledObjectCollections()

> **removeAllStyledObjectCollections**(): `void`

Removes styling on all object collections in this model

#### Returns

`void`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:350](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L350)

***

### setClassVisible()

> **setClassVisible**(`pointClass`, `visible`): `void`

Sets a visible filter on points of a given class.

#### Parameters

• **pointClass**: `number`

ASPRS classification class code. Either one of the well known
classes from [WellKnownAsprsPointClassCodes](../enumerations/WellKnownAsprsPointClassCodes.md) or a number for user defined classes.

• **visible**: `boolean`

Boolean flag that determines if the point class type should be visible or not.

#### Returns

`void`

#### Throws

Error if the model doesn't have the class given.

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:142](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L142)

***

### setDefaultPointCloudAppearance()

> **setDefaultPointCloudAppearance**(`appearance`): `void`

Sets default apparance for points that are not styled otherwise

#### Parameters

• **appearance**: [`PointCloudAppearance`](../type-aliases/PointCloudAppearance.md)

Appearance to assign as default

#### Returns

`void`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:294](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L294)

***

### setModelClippingPlanes()

> **setModelClippingPlanes**(`clippingPlanes`): `void`

Sets the clipping planes for this model. They will be combined with the
global clipping planes.

#### Parameters

• **clippingPlanes**: `Plane`[]

#### Returns

`void`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:272](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L272)

***

### setModelTransformation()

> **setModelTransformation**(`transformationMatrix`): `void`

Sets transformation matrix of the model. This overrides the current transformation.

#### Parameters

• **transformationMatrix**: `Matrix4`

The new transformation matrix

#### Returns

`void`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:92](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L92)

***

### traverseStylableObjects()

> **traverseStylableObjects**(`callback`): `void`

Iterates through all stylable objects for this model

#### Parameters

• **callback**

#### Returns

`void`

#### Example

```js
model.traverseStylableObjects(
    annotationMetadata => console.log(annotationMetadata.annotationId)
);
```

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:371](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L371)

***

### unassignStyledObjectCollection()

> **unassignStyledObjectCollection**(`objectCollection`): `void`

Unassign style from an already styled object collection.

#### Parameters

• **objectCollection**: [`PointCloudObjectCollection`](PointCloudObjectCollection.md)

The object collection from which to remove the style

#### Returns

`void`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:331](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L331)
