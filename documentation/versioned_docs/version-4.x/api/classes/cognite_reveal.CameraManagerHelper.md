---
id: "cognite_reveal.CameraManagerHelper"
title: "Class: CameraManagerHelper"
sidebar_label: "CameraManagerHelper"
custom_edit_url: null
---

[@cognite/reveal](../modules/cognite_reveal.md).CameraManagerHelper

Helper methods for implementing a camera manager.

## Constructors

### constructor

• **new CameraManagerHelper**()

## Methods

### calculateCameraStateToFitBoundingBox

▸ `Static` **calculateCameraStateToFitBoundingBox**(`camera`, `box`, `radiusFactor?`): `Object`

Calculates camera position and target that allows to see the content of provided bounding box.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `camera` | `PerspectiveCamera` | `undefined` | Used camera instance. |
| `box` | `Box3` | `undefined` | Bounding box to be fitted. |
| `radiusFactor` | `number` | `2` | The ratio of the distance from camera to center of box and radius of the box. |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `position` | `Vector3` |
| `target` | `Vector3` |

#### Defined in

[packages/camera-manager/src/CameraManagerHelper.ts:97](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/camera-manager/src/CameraManagerHelper.ts#L97)

___

### calculateNewTargetFromRotation

▸ `Static` **calculateNewTargetFromRotation**(`camera`, `rotation`, `currentTarget`): `Vector3`

Calculates camera target based on new camera rotation.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `camera` | `PerspectiveCamera` | Used camera instance. |
| `rotation` | `Quaternion` | New camera rotation in quaternion form. |
| `currentTarget` | `Vector3` | Current camera target. |

#### Returns

`Vector3`

#### Defined in

[packages/camera-manager/src/CameraManagerHelper.ts:42](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/camera-manager/src/CameraManagerHelper.ts#L42)

___

### updateCameraNearAndFar

▸ `Static` **updateCameraNearAndFar**(`camera`, `combinedBbox`): `void`

Updates near and far plane of the camera based on the bounding box.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `camera` | `PerspectiveCamera` | Used camera instance. |
| `combinedBbox` | `Box3` | Bounding box of all objects on the scene. |

#### Returns

`void`

#### Defined in

[packages/camera-manager/src/CameraManagerHelper.ts:66](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/camera-manager/src/CameraManagerHelper.ts#L66)
