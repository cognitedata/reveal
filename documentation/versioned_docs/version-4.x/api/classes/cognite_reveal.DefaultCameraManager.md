---
id: "cognite_reveal.DefaultCameraManager"
title: "Class: DefaultCameraManager"
sidebar_label: "DefaultCameraManager"
custom_edit_url: null
---

[@cognite/reveal](../modules/cognite_reveal.md).DefaultCameraManager

Default implementation of [CameraManager](../interfaces/cognite_reveal.CameraManager.md). Uses target-based orbit controls combined with
keyboard and mouse navigation possibility. Supports automatic update of camera near and far
planes and animated change of camera position and target.

## Implements

- [`CameraManager`](../interfaces/cognite_reveal.CameraManager.md)

## Properties

### automaticControlsSensitivity

• **automaticControlsSensitivity**: `boolean` = `true`

When false, the sensitivity of the camera controls will not be updated automatically.
This can be useful to better control the sensitivity of the 3D navigation.

When not set, control the sensitivity of the camera using `viewer.cameraManager.cameraControls.minDistance`
and `viewer.cameraManager.cameraControls.maxDistance`.

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:103](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L103)

___

### automaticNearFarPlane

• **automaticNearFarPlane**: `boolean` = `true`

When false, camera near and far planes will not be updated automatically (defaults to true).
This can be useful when you have custom content in the 3D view and need to better
control the view frustum.

When automatic camera near/far planes are disabled, you are responsible for setting
this on your own.

**`Example`**

```
viewer.camera.near = 0.1;
viewer.camera.far = 1000.0;
viewer.camera.updateProjectionMatrix();
```

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:95](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L95)

## Accessors

### keyboardNavigationEnabled

• `get` **keyboardNavigationEnabled**(): `boolean`

Whether keyboard control of the camera is enabled/disabled.

#### Returns

`boolean`

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:190](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L190)

• `set` **keyboardNavigationEnabled**(`enabled`): `void`

Sets whether keyboard control of the camera is enabled/disabled.

#### Parameters

| Name | Type |
| :------ | :------ |
| `enabled` | `boolean` |

#### Returns

`void`

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:183](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L183)

## Methods

### activate

▸ **activate**(`cameraManager?`): `void`

Set this manager as active and enable controls.

Should update CameraManager.enabled to reflect the state of the manager.
Note that this is called automatically when a new CameraManager is set on the viewer.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cameraManager?` | [`CameraManager`](../interfaces/cognite_reveal.CameraManager.md) | Previously used camera manager. |

#### Returns

`void`

#### Implementation of

[CameraManager](../interfaces/cognite_reveal.CameraManager.md).[activate](../interfaces/cognite_reveal.CameraManager.md#activate)

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:232](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L232)

___

### deactivate

▸ **deactivate**(): `void`

Deactivate this manager and disable controls.

Should update CameraManager.enabled to reflect the state of the manager.
Note that this is called automatically when a new CameraManager is set on the viewer.

#### Returns

`void`

#### Implementation of

[CameraManager](../interfaces/cognite_reveal.CameraManager.md).[deactivate](../interfaces/cognite_reveal.CameraManager.md#deactivate)

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:246](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L246)

___

### dispose

▸ **dispose**(): `void`

**`Obvious`**

#### Returns

`void`

#### Implementation of

[CameraManager](../interfaces/cognite_reveal.CameraManager.md).[dispose](../interfaces/cognite_reveal.CameraManager.md#dispose)

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:285](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L285)

___

### fitCameraToBoundingBox

▸ **fitCameraToBoundingBox**(`box`, `duration?`, `radiusFactor?`): `void`

Moves camera to a place where the content of a bounding box is visible to the camera.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `box` | `Box3` | `undefined` | The bounding box in world space. |
| `duration?` | `number` | `undefined` | The duration of the animation moving the camera. |
| `radiusFactor` | `number` | `2` | The ratio of the distance from camera to center of box and radius of the box. |

#### Returns

`void`

#### Implementation of

[CameraManager](../interfaces/cognite_reveal.CameraManager.md).[fitCameraToBoundingBox](../interfaces/cognite_reveal.CameraManager.md#fitcameratoboundingbox)

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:159](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L159)

___

### getCamera

▸ **getCamera**(): `PerspectiveCamera`

Returns the camera used for rendering the viewer.
Note that the camera will not be modified directly by Reveal.
Implementations must trigger the `cameraChange`-event whenever the
camera changes.

#### Returns

`PerspectiveCamera`

#### Implementation of

[CameraManager](../interfaces/cognite_reveal.CameraManager.md).[getCamera](../interfaces/cognite_reveal.CameraManager.md#getcamera)

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:194](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L194)

___

### getCameraControlsOptions

▸ **getCameraControlsOptions**(): [`CameraControlsOptions`](../modules/cognite_reveal.md#cameracontrolsoptions)

Gets current camera controls options.

#### Returns

[`CameraControlsOptions`](../modules/cognite_reveal.md#cameracontrolsoptions)

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:257](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L257)

___

### getCameraState

▸ **getCameraState**(): `Required`\<[`CameraState`](../modules/cognite_reveal.md#camerastate)\>

Get camera's state

#### Returns

`Required`\<[`CameraState`](../modules/cognite_reveal.md#camerastate)\>

Camera state: position, target and rotation.

#### Implementation of

[CameraManager](../interfaces/cognite_reveal.CameraManager.md).[getCameraState](../interfaces/cognite_reveal.CameraManager.md#getcamerastate)

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:224](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L224)

___

### getComboControlsOptions

▸ **getComboControlsOptions**(): `Readonly`\<[`ComboControlsOptions`](../modules/cognite_reveal.md#combocontrolsoptions)\>

Gets current Combo Controls options.

#### Returns

`Readonly`\<[`ComboControlsOptions`](../modules/cognite_reveal.md#combocontrolsoptions)\>

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:168](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L168)

___

### off

▸ **off**(`event`, `callback`): `void`

Unsubscribes from changes of the camera event.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"cameraChange"`` \| ``"cameraStop"`` | The event type. |
| `callback` | [`CameraEventDelegate`](../modules/cognite_reveal.md#cameraeventdelegate) | Callback function to be unsubscribed. |

#### Returns

`void`

#### Implementation of

[CameraManager](../interfaces/cognite_reveal.CameraManager.md).[off](../interfaces/cognite_reveal.CameraManager.md#off)

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:146](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L146)

___

### on

▸ **on**(`event`, `callback`): `void`

Subscribes to events on this camera manager. There are several event types:
'cameraChange' - Subscribes to changes of the camera. This is used by Reveal to react on changes of the camera.
'cameraStop' - Subscribes to events indicating the camera has stopped

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"cameraChange"`` \| ``"cameraStop"`` | The event type. |
| `callback` | [`CameraEventDelegate`](../modules/cognite_reveal.md#cameraeventdelegate) | Callback to be called when the event is fired. |

#### Returns

`void`

#### Implementation of

[CameraManager](../interfaces/cognite_reveal.CameraManager.md).[on](../interfaces/cognite_reveal.CameraManager.md#on)

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:133](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L133)

___

### setCameraControlsOptions

▸ **setCameraControlsOptions**(`controlsOptions`): `void`

Sets camera controls options to customize camera controls modes. See [CameraControlsOptions](../modules/cognite_reveal.md#cameracontrolsoptions).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `controlsOptions` | [`CameraControlsOptions`](../modules/cognite_reveal.md#cameracontrolsoptions) | JSON object with camera controls options. |

#### Returns

`void`

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:265](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L265)

___

### setCameraState

▸ **setCameraState**(`state`): `void`

Sets camera state. All parameters are optional. Rotation and target can't be set at the same time,
if so, error will be thrown. Set rotation is preserved until next call of setCameraState with
empty rotation field.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `state` | [`CameraState`](../modules/cognite_reveal.md#camerastate) | Camera state. * |

#### Returns

`void`

#### Implementation of

[CameraManager](../interfaces/cognite_reveal.CameraManager.md).[setCameraState](../interfaces/cognite_reveal.CameraManager.md#setcamerastate)

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:204](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L204)

___

### setComboControlsOptions

▸ **setComboControlsOptions**(`options`): `void`

Sets Combo Controls options.
Only provided options will be changed, any undefined options will be kept as is.

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | `Partial`\<[`ComboControlsOptions`](../modules/cognite_reveal.md#combocontrolsoptions)\> |

#### Returns

`void`

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:176](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L176)

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

#### Implementation of

[CameraManager](../interfaces/cognite_reveal.CameraManager.md).[update](../interfaces/cognite_reveal.CameraManager.md#update)

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:275](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L275)
