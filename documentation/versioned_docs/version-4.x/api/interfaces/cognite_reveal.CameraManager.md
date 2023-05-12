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

## Methods

### activate

▸ **activate**(`cameraManager?`): `void`

Set this manager as active and enable controls.

Should update CameraManager.enabled to reflect the state of the manager.
Note that this is called automatically when a new CameraManager is set on the [Cognite3DViewer](../classes/cognite_reveal.Cognite3DViewer.md).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cameraManager?` | [`CameraManager`](cognite_reveal.CameraManager.md) | Previously used camera manager. |

#### Returns

`void`

#### Defined in

[packages/camera-manager/src/CameraManager.ts:59](https://github.com/cognitedata/reveal/blob/917d1d190/viewer/packages/camera-manager/src/CameraManager.ts#L59)

___

### deactivate

▸ **deactivate**(): `void`

Deactivate this manager and disable controls.

Should update CameraManager.enabled to reflect the state of the manager.
Note that this is called automatically when a new CameraManager is set on the [Cognite3DViewer](../classes/cognite_reveal.Cognite3DViewer.md).

#### Returns

`void`

#### Defined in

[packages/camera-manager/src/CameraManager.ts:67](https://github.com/cognitedata/reveal/blob/917d1d190/viewer/packages/camera-manager/src/CameraManager.ts#L67)

___

### dispose

▸ **dispose**(): `void`

**`Obvious`**

#### Returns

`void`

#### Defined in

[packages/camera-manager/src/CameraManager.ts:107](https://github.com/cognitedata/reveal/blob/917d1d190/viewer/packages/camera-manager/src/CameraManager.ts#L107)

___

### fitCameraToBoundingBox

▸ **fitCameraToBoundingBox**(`boundingBox`, `duration?`, `radiusFactor?`): `void`

Moves camera to a place where the content of a bounding box is visible to the camera.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `boundingBox` | `Box3` | The bounding box in world space. |
| `duration?` | `number` | The duration of the animation moving the camera. |
| `radiusFactor?` | `number` | The ratio of the distance from camera to center of box and radius of the box. |

#### Returns

`void`

#### Defined in

[packages/camera-manager/src/CameraManager.ts:95](https://github.com/cognitedata/reveal/blob/917d1d190/viewer/packages/camera-manager/src/CameraManager.ts#L95)

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

[packages/camera-manager/src/CameraManager.ts:27](https://github.com/cognitedata/reveal/blob/917d1d190/viewer/packages/camera-manager/src/CameraManager.ts#L27)

___

### getCameraState

▸ **getCameraState**(): `Required`<[`CameraState`](../modules/cognite_reveal.md#camerastate)\>

Get camera's state

#### Returns

`Required`<[`CameraState`](../modules/cognite_reveal.md#camerastate)\>

Camera state: position, target and rotation.

#### Defined in

[packages/camera-manager/src/CameraManager.ts:50](https://github.com/cognitedata/reveal/blob/917d1d190/viewer/packages/camera-manager/src/CameraManager.ts#L50)

___

### off

▸ **off**(`event`, `callback`): `void`

Unsubscribes from changes of the camera event.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"cameraChange"`` | The event type. |
| `callback` | [`CameraChangeDelegate`](../modules/cognite_reveal.md#camerachangedelegate) | Callback function to be unsubscribed. |

#### Returns

`void`

#### Defined in

[packages/camera-manager/src/CameraManager.ts:85](https://github.com/cognitedata/reveal/blob/917d1d190/viewer/packages/camera-manager/src/CameraManager.ts#L85)

▸ **off**(`event`, `callback`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"cameraStop"`` |
| `callback` | [`CameraStopDelegate`](../modules/cognite_reveal.md#camerastopdelegate) |

#### Returns

`void`

#### Defined in

[packages/camera-manager/src/CameraManager.ts:86](https://github.com/cognitedata/reveal/blob/917d1d190/viewer/packages/camera-manager/src/CameraManager.ts#L86)

▸ **off**(`event`, `callback`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"cameraChange"`` \| ``"cameraStop"`` |
| `callback` | [`CameraEventDelegate`](../modules/cognite_reveal.md#cameraeventdelegate) |

#### Returns

`void`

#### Defined in

[packages/camera-manager/src/CameraManager.ts:87](https://github.com/cognitedata/reveal/blob/917d1d190/viewer/packages/camera-manager/src/CameraManager.ts#L87)

___

### on

▸ **on**(`event`, `callback`): `void`

Subscribes to events on this camera manager. There are several event types:
'cameraChange' - Subscribes to changes of the camera. This is used by Reveal to react on changes of the camera.
'cameraStop' - Subscribes to events indicating the camera has stopped

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"cameraChange"`` | The event type. |
| `callback` | [`CameraChangeDelegate`](../modules/cognite_reveal.md#camerachangedelegate) | Callback to be called when the event is fired. |

#### Returns

`void`

#### Defined in

[packages/camera-manager/src/CameraManager.ts:76](https://github.com/cognitedata/reveal/blob/917d1d190/viewer/packages/camera-manager/src/CameraManager.ts#L76)

▸ **on**(`event`, `callback`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"cameraStop"`` |
| `callback` | [`CameraStopDelegate`](../modules/cognite_reveal.md#camerastopdelegate) |

#### Returns

`void`

#### Defined in

[packages/camera-manager/src/CameraManager.ts:77](https://github.com/cognitedata/reveal/blob/917d1d190/viewer/packages/camera-manager/src/CameraManager.ts#L77)

▸ **on**(`event`, `callback`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"cameraChange"`` \| ``"cameraStop"`` |
| `callback` | [`CameraEventDelegate`](../modules/cognite_reveal.md#cameraeventdelegate) |

#### Returns

`void`

#### Defined in

[packages/camera-manager/src/CameraManager.ts:78](https://github.com/cognitedata/reveal/blob/917d1d190/viewer/packages/camera-manager/src/CameraManager.ts#L78)

___

### setCameraState

▸ **setCameraState**(`state`): `void`

Set camera's state. Rotation and target can't be set at the same time as they could conflict,
should throw an error if both are passed with non-zero value inside state.

**`Example`**

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

[packages/camera-manager/src/CameraManager.ts:44](https://github.com/cognitedata/reveal/blob/917d1d190/viewer/packages/camera-manager/src/CameraManager.ts#L44)

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

[packages/camera-manager/src/CameraManager.ts:103](https://github.com/cognitedata/reveal/blob/917d1d190/viewer/packages/camera-manager/src/CameraManager.ts#L103)
