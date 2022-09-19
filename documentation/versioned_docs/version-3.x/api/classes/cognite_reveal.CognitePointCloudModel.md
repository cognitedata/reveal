---
id: "cognite_reveal.CognitePointCloudModel"
title: "Class: CognitePointCloudModel"
sidebar_label: "CognitePointCloudModel"
custom_edit_url: null
---

[@cognite/reveal](../modules/cognite_reveal.md).CognitePointCloudModel

## Hierarchy

- `Object3D`

  ↳ **`CognitePointCloudModel`**

## Implements

- [`CogniteModelBase`](../interfaces/cognite_reveal.CogniteModelBase.md)

## Properties

### modelId

• `Readonly` **modelId**: `number`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:21](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L21)

___

### revisionId

• `Readonly` **revisionId**: `number`

The modelId of the point cloud model in Cognite Data Fusion.

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:25](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L25)

___

### type

• `Readonly` **type**: [`SupportedModelTypes`](../modules/cognite_reveal.md#supportedmodeltypes) = `'pointcloud'`

#### Implementation of

[CogniteModelBase](../interfaces/cognite_reveal.CogniteModelBase.md).[type](../interfaces/cognite_reveal.CogniteModelBase.md#type)

#### Overrides

THREE.Object3D.type

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:20](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L20)

## Accessors

### pointColorType

• `get` **pointColorType**(): [`PotreePointColorType`](../enums/cognite_reveal.PotreePointColorType.md)

Determines how points currently are colored.

#### Returns

[`PotreePointColorType`](../enums/cognite_reveal.PotreePointColorType.md)

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:147](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L147)

• `set` **pointColorType**(`type`): `void`

Specifies how points are colored.

**`default`** PotreePointColorType.Rgb

**`example`**
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

[packages/pointclouds/src/CognitePointCloudModel.ts:159](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L159)

___

### pointShape

• `get` **pointShape**(): [`PotreePointShape`](../enums/cognite_reveal.PotreePointShape.md)

Sets the point shape of each rendered point in the point cloud.

**`default`** `PotreePointShape.Circle`

**`see`** [PotreePointShape](../enums/cognite_reveal.PotreePointShape.md).

#### Returns

[`PotreePointShape`](../enums/cognite_reveal.PotreePointShape.md)

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:199](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L199)

• `set` **pointShape**(`shape`): `void`

Gets the point shape of each rendered point in the point cloud.

**`see`** [PotreePointShape](../enums/cognite_reveal.PotreePointShape.md).

#### Parameters

| Name | Type |
| :------ | :------ |
| `shape` | [`PotreePointShape`](../enums/cognite_reveal.PotreePointShape.md) |

#### Returns

`void`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:207](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L207)

___

### pointSize

• `get` **pointSize**(): `number`

Returns the size of each rendered point in the point cloud.

#### Returns

`number`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:166](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L166)

• `set` **pointSize**(`size`): `void`

Sets the size of each rendered point in the point cloud.

**`default`** `1`

#### Parameters

| Name | Type |
| :------ | :------ |
| `size` | `number` |

#### Returns

`void`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:174](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L174)

___

### pointSizeType

• `get` **pointSizeType**(): [`PotreePointSizeType`](../enums/cognite_reveal.PotreePointSizeType.md)

Get the point size type.

#### Returns

[`PotreePointSizeType`](../enums/cognite_reveal.PotreePointSizeType.md)

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:181](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L181)

• `set` **pointSizeType**(`type`): `void`

Set the point size type for the point cloud.
The point size type can be either Fixed or Adaptive.

**`default`** `PotreePointSizeType.Adaptive`

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | [`PotreePointSizeType`](../enums/cognite_reveal.PotreePointSizeType.md) |

#### Returns

`void`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:190](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L190)

___

### visiblePointCount

• `get` **visiblePointCount**(): `number`

Returns the current number of visible/loaded points.

#### Returns

`number`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:140](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L140)

## Methods

### dispose

▸ **dispose**(): `void`

Used to clean up memory.

#### Returns

`void`

#### Implementation of

[CogniteModelBase](../interfaces/cognite_reveal.CogniteModelBase.md).[dispose](../interfaces/cognite_reveal.CogniteModelBase.md#dispose)

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:49](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L49)

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

[packages/pointclouds/src/CognitePointCloudModel.ts:77](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L77)

___

### getClasses

▸ **getClasses**(): `number`[]

Returns a list of sorted classification codes present in the model.

#### Returns

`number`[]

A sorted list of classification codes from the model.

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:133](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L133)

___

### getModelBoundingBox

▸ **getModelBoundingBox**(`outBbox?`): `Box3`

**`example`**
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

[packages/pointclouds/src/CognitePointCloudModel.ts:68](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L68)

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

[packages/pointclouds/src/CognitePointCloudModel.ts:93](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L93)

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

[packages/pointclouds/src/CognitePointCloudModel.ts:125](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L125)

___

### isClassVisible

▸ **isClassVisible**(`pointClass`): `boolean`

Determines if points from a given class are visible.

**`throws`** Error if the model doesn't have the class given.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `pointClass` | `number` | ASPRS classification class code. Either one of the well known classes from [WellKnownAsprsPointClassCodes](../enums/cognite_reveal.WellKnownAsprsPointClassCodes.md) or a number for user defined classes. |

#### Returns

`boolean`

True if points from the given class will be visible.

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:115](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L115)

___

### setClassVisible

▸ **setClassVisible**(`pointClass`, `visible`): `void`

Sets a visible filter on points of a given class.

**`throws`** Error if the model doesn't have the class given.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `pointClass` | `number` | ASPRS classification class code. Either one of the well known classes from [WellKnownAsprsPointClassCodes](../enums/cognite_reveal.WellKnownAsprsPointClassCodes.md) or a number for user defined classes. |
| `visible` | `boolean` | Boolean flag that determines if the point class type should be visible or not. |

#### Returns

`void`

#### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:104](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L104)

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

[packages/pointclouds/src/CognitePointCloudModel.ts:85](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L85)
