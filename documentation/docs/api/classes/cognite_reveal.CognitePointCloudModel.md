---
id: "cognite_reveal.CognitePointCloudModel"
title: "Class: CognitePointCloudModel"
sidebar_label: "CognitePointCloudModel"
custom_edit_url: null
---

[@cognite/reveal](../modules/cognite_reveal.md).CognitePointCloudModel

## Implements

- [`CogniteModelBase`](../interfaces/cognite_reveal.CogniteModelBase.md)

## Properties

### modelId

• `Readonly` **modelId**: `number`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:30](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L30)

___

### revisionId

• `Readonly` **revisionId**: `number`

The modelId of the point cloud model in Cognite Data Fusion.

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:34](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L34)

___

### type

• `Readonly` **type**: [`SupportedModelTypes`](../modules/cognite_reveal.md#supportedmodeltypes) = `'pointcloud'`

#### Implementation of

[CogniteModelBase](../interfaces/cognite_reveal.CogniteModelBase.md).[type](../interfaces/cognite_reveal.CogniteModelBase.md#type)

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:29](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L29)

## Accessors

### pointColorType

• `get` **pointColorType**(): [`PotreePointColorType`](../enums/cognite_reveal.PotreePointColorType.md)

Determines how points currently are colored.

#### Returns

[`PotreePointColorType`](../enums/cognite_reveal.PotreePointColorType.md)

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:154](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L154)

• `set` **pointColorType**(`type`): `void`

Specifies how points are colored.

**`Default`**

PotreePointColorType.Rgb

**`Example`**

```js
model.pointColorType = PotreePointColorType.Rgb
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | [`PotreePointColorType`](../enums/cognite_reveal.PotreePointColorType.md) |

#### Returns

`void`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:166](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L166)

___

### pointShape

• `get` **pointShape**(): [`PotreePointShape`](../enums/cognite_reveal.PotreePointShape.md)

Sets the point shape of each rendered point in the point cloud.

**`Default`**

`PotreePointShape.Circle`

**`See`**

[PotreePointShape](../enums/cognite_reveal.PotreePointShape.md).

#### Returns

[`PotreePointShape`](../enums/cognite_reveal.PotreePointShape.md)

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:206](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L206)

• `set` **pointShape**(`shape`): `void`

Gets the point shape of each rendered point in the point cloud.

**`See`**

[PotreePointShape](../enums/cognite_reveal.PotreePointShape.md).

#### Parameters

| Name | Type |
| :------ | :------ |
| `shape` | [`PotreePointShape`](../enums/cognite_reveal.PotreePointShape.md) |

#### Returns

`void`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:214](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L214)

___

### pointSize

• `get` **pointSize**(): `number`

Returns the size of each rendered point in the point cloud.

#### Returns

`number`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:173](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L173)

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

[packages/pointclouds/src/CognitePointCloudModel.ts:181](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L181)

___

### pointSizeType

• `get` **pointSizeType**(): [`PotreePointSizeType`](../enums/cognite_reveal.PotreePointSizeType.md)

Get the point size type.

#### Returns

[`PotreePointSizeType`](../enums/cognite_reveal.PotreePointSizeType.md)

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:188](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L188)

• `set` **pointSizeType**(`type`): `void`

Set the point size type for the point cloud.
The point size type can be either Fixed or Adaptive.

**`Default`**

`PotreePointSizeType.Adaptive`

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | [`PotreePointSizeType`](../enums/cognite_reveal.PotreePointSizeType.md) |

#### Returns

`void`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:197](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L197)

___

### stylableObjectCount

• `get` **stylableObjectCount**(): `number`

#### Returns

`number`

The number of stylable objects

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:291](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L291)

___

### styledCollections

• `get` **styledCollections**(): `StyledPointCloudObjectCollection`[]

Gets the object collections that have been assigned a style

#### Returns

`StyledPointCloudObjectCollection`[]

All object collections and their associated style

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:238](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L238)

___

### visiblePointCount

• `get` **visiblePointCount**(): `number`

Returns the current number of visible/loaded points.

#### Returns

`number`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:147](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L147)

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

[packages/pointclouds/src/CognitePointCloudModel.ts:248](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L248)

___

### dispose

▸ **dispose**(): `void`

Used to clean up memory.

#### Returns

`void`

#### Implementation of

[CogniteModelBase](../interfaces/cognite_reveal.CogniteModelBase.md).[dispose](../interfaces/cognite_reveal.CogniteModelBase.md#dispose)

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:58](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L58)

___

### getCameraConfiguration

▸ **getCameraConfiguration**(): [`CameraConfiguration`](../modules/cognite_reveal.md#cameraconfiguration)

Retrieves the camera position and target stored for the model. Typically this
is used to store a good starting position for a model. Returns `undefined` if there
isn't any stored camera configuration for the model.

#### Returns

[`CameraConfiguration`](../modules/cognite_reveal.md#cameraconfiguration)

#### Implementation of

[CogniteModelBase](../interfaces/cognite_reveal.CogniteModelBase.md).[getCameraConfiguration](../interfaces/cognite_reveal.CogniteModelBase.md#getcameraconfiguration)

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:84](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L84)

___

### getClasses

▸ **getClasses**(): `number`[]

Returns a list of sorted classification codes present in the model.

#### Returns

`number`[]

A sorted list of classification codes from the model.

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:140](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L140)

___

### getDefaultPointCloudAppearance

▸ **getDefaultPointCloudAppearance**(): [`PointCloudAppearance`](../modules/cognite_reveal.md#pointcloudappearance)

Gets default point appearance

#### Returns

[`PointCloudAppearance`](../modules/cognite_reveal.md#pointcloudappearance)

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:221](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L221)

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

#### Implementation of

[CogniteModelBase](../interfaces/cognite_reveal.CogniteModelBase.md).[getModelBoundingBox](../interfaces/cognite_reveal.CogniteModelBase.md#getmodelboundingbox)

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:75](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L75)

___

### getModelTransformation

▸ **getModelTransformation**(`out?`): `Matrix4`

Gets transformation matrix of the model.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `out?` | `Matrix4` | Preallocated `THREE.Matrix4` (optional). |

#### Returns

`Matrix4`

#### Implementation of

[CogniteModelBase](../interfaces/cognite_reveal.CogniteModelBase.md).[getModelTransformation](../interfaces/cognite_reveal.CogniteModelBase.md#getmodeltransformation)

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:100](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L100)

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

[packages/pointclouds/src/CognitePointCloudModel.ts:132](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L132)

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

[packages/pointclouds/src/CognitePointCloudModel.ts:122](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L122)

___

### removeAllStyledObjectCollections

▸ **removeAllStyledObjectCollections**(): `void`

Removes styling on all object collections in this model

#### Returns

`void`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:283](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L283)

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

[packages/pointclouds/src/CognitePointCloudModel.ts:111](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L111)

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

[packages/pointclouds/src/CognitePointCloudModel.ts:229](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L229)

___

### setModelTransformation

▸ **setModelTransformation**(`transformationMatrix`): `void`

Sets transformation matrix of the model. This overrides the current transformation.

#### Parameters

| Name | Type |
| :------ | :------ |
| `transformationMatrix` | `Matrix4` |

#### Returns

`void`

#### Implementation of

[CogniteModelBase](../interfaces/cognite_reveal.CogniteModelBase.md).[setModelTransformation](../interfaces/cognite_reveal.CogniteModelBase.md#setmodeltransformation)

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:92](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L92)

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
| `callback` | (`annotationMetadata`: `PointCloudObjectMetadata`) => `void` |

#### Returns

`void`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:304](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L304)

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

[packages/pointclouds/src/CognitePointCloudModel.ts:266](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L266)
