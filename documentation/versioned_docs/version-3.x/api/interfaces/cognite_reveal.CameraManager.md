---
id: "cognite_reveal.CameraManager"
title: "Interface: CameraManager"
sidebar_label: "CameraManager"
custom_edit_url: null
---

[@cognite/reveal](../modules/cognite_reveal.md).CameraManager

Interface for manager responsible for all manipulations to the camera,
including animations and modification of state. Implementations are responsible for
providing a `THREE.PerspectiveCamera` instance to [Cognite3DViewer](../classes/cognite_reveal.Cognite3DViewer.md). Implementations
must trigger the `cameraChange`-event when camera is changed.
The default implementation is [DefaultCameraManager](../classes/cognite_reveal.DefaultCameraManager.md).

## Implemented by

- [`DefaultCameraManager`](../classes/cognite_reveal.DefaultCameraManager.md)

## Properties

### enabled

• `Optional` **enabled**: `boolean`

Enables or disables camera manager. When disabled, camera manager shouldn't consume or react to any DOM events.

#### Defined in

[packages/camera-manager/src/CameraManager.ts:81](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/camera-manager/src/CameraManager.ts#L81)

## Methods

### dispose

▸ **dispose**(): `void`

**`obvious`**

#### Returns

`void`

#### Defined in

[packages/camera-manager/src/CameraManager.ts:77](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/camera-manager/src/CameraManager.ts#L77)

___

### fitCameraToBoundingBox

▸ **fitCameraToBoundingBox**(`boundingBox`, `duration?`, `radiusFactor?`): `void`

Moves camera to a place where the content of a bounding box is visible to the camera.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `boundingBox` | `Box3` | - |
| `duration?` | `number` | The duration of the animation moving the camera. |
| `radiusFactor?` | `number` | The ratio of the distance from camera to center of box and radius of the box. |

#### Returns

`void`

#### Defined in

[packages/camera-manager/src/CameraManager.ts:65](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/camera-manager/src/CameraManager.ts#L65)

___

### getCamera

▸ **getCamera**(): `PerspectiveCamera`

Returns the camera used for rendering in [Cognite3DViewer](../classes/cognite_reveal.Cognite3DViewer.md).
Note that the camera will not be modified directly by Reveal.
Implementations must trigger the `cameraChange`-event whenever the
camera changes.

#### Returns

`PerspectiveCamera`

#### Defined in

[packages/camera-manager/src/CameraManager.ts:21](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/camera-manager/src/CameraManager.ts#L21)

___

### getCameraState

▸ **getCameraState**(): `Required`\<[`CameraState`](../modules/cognite_reveal.md#camerastate)\>

Get camera's state

#### Returns

`Required`\<[`CameraState`](../modules/cognite_reveal.md#camerastate)\>

Camera state: position, target and rotation.

#### Defined in

[packages/camera-manager/src/CameraManager.ts:44](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/camera-manager/src/CameraManager.ts#L44)

___

### off

▸ **off**(`event`, `callback`): `void`

Unsubscribes from changes of the camera event.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"cameraChange"`` | Name of the event. |
| `callback` | [`CameraChangeDelegate`](../modules/cognite_reveal.md#camerachangedelegate) | Callback function to be unsubscribed. |

#### Returns

`void`

#### Defined in

[packages/camera-manager/src/CameraManager.ts:57](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/camera-manager/src/CameraManager.ts#L57)

___

### on

▸ **on**(`event`, `callback`): `void`

Subscribes to changes of the camera event. This is used by Reveal to react on changes of the camera.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"cameraChange"`` | Name of the event. |
| `callback` | [`CameraChangeDelegate`](../modules/cognite_reveal.md#camerachangedelegate) | Callback to be called when the event is fired. |

#### Returns

`void`

#### Defined in

[packages/camera-manager/src/CameraManager.ts:51](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/camera-manager/src/CameraManager.ts#L51)

___

### setCameraState

▸ **setCameraState**(`state`): `void`

Set camera's state. Rotation and target can't be set at the same time as they could conflict,
should throw an error if both are passed with non-zero value inside state.

**`example`**
```js
// store position, target
const { position, target } = cameraManager.getCameraState();
// restore position, target
cameraManager.setCameraState({ position, target });
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `state` | [`CameraState`](../modules/cognite_reveal.md#camerastate) | Camera state, all fields are optional. |

#### Returns

`void`

#### Defined in

[packages/camera-manager/src/CameraManager.ts:38](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/camera-manager/src/CameraManager.ts#L38)

___

### update

▸ **update**(`deltaTime`, `boundingBox`): `void`

Updates internal state of camera manager. Expected to update visual state of the camera
as well as it's near and far planes if needed. Called in `requestAnimationFrame`-loop.
Reveal performance affects frequency with which this method is called.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `deltaTime` | `number` | Delta time since last update in seconds. |
| `boundingBox` | `Box3` | Global bounding box of the model(s) and any custom objects added to the scene. |

#### Returns

`void`

#### Defined in

[packages/camera-manager/src/CameraManager.ts:73](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/camera-manager/src/CameraManager.ts#L73)
