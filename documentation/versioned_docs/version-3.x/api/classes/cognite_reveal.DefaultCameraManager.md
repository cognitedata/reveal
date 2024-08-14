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

[packages/camera-manager/src/DefaultCameraManager.ts:85](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L85)

___

### automaticNearFarPlane

• **automaticNearFarPlane**: `boolean` = `true`

When false, camera near and far planes will not be updated automatically (defaults to true).
This can be useful when you have custom content in the 3D view and need to better
control the view frustum.

When automatic camera near/far planes are disabled, you are responsible for setting
this on your own.

**`example`**
```
viewer.camera.near = 0.1;
viewer.camera.far = 1000.0;
viewer.camera.updateProjectionMatrix();
```

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:77](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L77)

## Accessors

### cameraControls

• `get` **cameraControls**(): [`ComboControls`](cognite_reveal.ComboControls.md)

Gets instance of camera controls that are used by camera manager. See [ComboControls](cognite_reveal.ComboControls.md) for more
information on all adjustable properties.

**`deprecated`** Will be removed in 4.0.0.

#### Returns

[`ComboControls`](cognite_reveal.ComboControls.md)

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:144](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L144)

___

### cameraControlsEnabled

• `get` **cameraControlsEnabled**(): `boolean`

Gets whether camera controls through mouse, touch and keyboard are enabled.

**`deprecated`** Will be removed in 4.0.0. Use [DefaultCameraManager.enabled](cognite_reveal.DefaultCameraManager.md#enabled) instead.

#### Returns

`boolean`

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:178](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L178)

• `set` **cameraControlsEnabled**(`enabled`): `void`

Sets whether camera controls through mouse, touch and keyboard are enabled.
This can be useful to e.g. temporarily disable navigation when manipulating other
objects in the scene or when implementing a "cinematic" viewer.

**`deprecated`** Will be removed in 4.0.0. Use [DefaultCameraManager.enabled](cognite_reveal.DefaultCameraManager.md#enabled) instead.

#### Parameters

| Name | Type |
| :------ | :------ |
| `enabled` | `boolean` |

#### Returns

`void`

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:169](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L169)

___

### enabled

• `get` **enabled**(): `boolean`

Gets whether camera controls through mouse, touch and keyboard are enabled.

#### Returns

`boolean`

#### Implementation of

[CameraManager](../interfaces/cognite_reveal.CameraManager.md).[enabled](../interfaces/cognite_reveal.CameraManager.md#enabled)

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:159](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L159)

• `set` **enabled**(`enabled`): `void`

Sets whether camera controls through mouse, touch and keyboard are enabled.

#### Parameters

| Name | Type |
| :------ | :------ |
| `enabled` | `boolean` |

#### Returns

`void`

#### Implementation of

[CameraManager](../interfaces/cognite_reveal.CameraManager.md).[enabled](../interfaces/cognite_reveal.CameraManager.md#enabled)

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:151](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L151)

___

### keyboardNavigationEnabled

• `get` **keyboardNavigationEnabled**(): `boolean`

Whether keyboard control of the camera is enabled/disabled.

#### Returns

`boolean`

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:192](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L192)

• `set` **keyboardNavigationEnabled**(`enabled`): `void`

Sets whether keyboard control of the camera is enabled/disabled.

#### Parameters

| Name | Type |
| :------ | :------ |
| `enabled` | `boolean` |

#### Returns

`void`

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:185](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L185)

## Methods

### dispose

▸ **dispose**(): `void`

#### Returns

`void`

#### Implementation of

[CameraManager](../interfaces/cognite_reveal.CameraManager.md).[dispose](../interfaces/cognite_reveal.CameraManager.md#dispose)

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:262](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L262)

___

### fitCameraToBoundingBox

▸ **fitCameraToBoundingBox**(`box`, `duration?`, `radiusFactor?`): `void`

Moves camera to a place where the content of a bounding box is visible to the camera.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `box` | `Box3` | `undefined` |
| `duration?` | `number` | `undefined` |
| `radiusFactor` | `number` | `2` |

#### Returns

`void`

#### Implementation of

[CameraManager](../interfaces/cognite_reveal.CameraManager.md).[fitCameraToBoundingBox](../interfaces/cognite_reveal.CameraManager.md#fitcameratoboundingbox)

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:133](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L133)

___

### getCamera

▸ **getCamera**(): `PerspectiveCamera`

Returns the camera used for rendering in [Cognite3DViewer](cognite_reveal.Cognite3DViewer.md).
Note that the camera will not be modified directly by Reveal.
Implementations must trigger the `cameraChange`-event whenever the
camera changes.

#### Returns

`PerspectiveCamera`

#### Implementation of

[CameraManager](../interfaces/cognite_reveal.CameraManager.md).[getCamera](../interfaces/cognite_reveal.CameraManager.md#getcamera)

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:196](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L196)

___

### getCameraControlsOptions

▸ **getCameraControlsOptions**(): [`CameraControlsOptions`](../modules/cognite_reveal.md#cameracontrolsoptions)

Gets current camera controls options.

#### Returns

[`CameraControlsOptions`](../modules/cognite_reveal.md#cameracontrolsoptions)

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:237](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L237)

___

### getCameraState

▸ **getCameraState**(): `Required`\<[`CameraState`](../modules/cognite_reveal.md#camerastate)\>

Get camera's state

#### Returns

`Required`\<[`CameraState`](../modules/cognite_reveal.md#camerastate)\>

#### Implementation of

[CameraManager](../interfaces/cognite_reveal.CameraManager.md).[getCameraState](../interfaces/cognite_reveal.CameraManager.md#getcamerastate)

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:226](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L226)

___

### off

▸ **off**(`event`, `callback`): `void`

Unsubscribes from changes of the camera event.

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"cameraChange"`` |
| `callback` | [`CameraChangeDelegate`](../modules/cognite_reveal.md#camerachangedelegate) |

#### Returns

`void`

#### Implementation of

[CameraManager](../interfaces/cognite_reveal.CameraManager.md).[off](../interfaces/cognite_reveal.CameraManager.md#off)

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:123](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L123)

___

### on

▸ **on**(`event`, `callback`): `void`

Subscribes to changes of the camera event. This is used by Reveal to react on changes of the camera.

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"cameraChange"`` |
| `callback` | [`CameraChangeDelegate`](../modules/cognite_reveal.md#camerachangedelegate) |

#### Returns

`void`

#### Implementation of

[CameraManager](../interfaces/cognite_reveal.CameraManager.md).[on](../interfaces/cognite_reveal.CameraManager.md#on)

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:113](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L113)

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

[packages/camera-manager/src/DefaultCameraManager.ts:245](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L245)

___

### setCameraState

▸ **setCameraState**(`state`): `void`

Sets camera state. All parameters are optional. Rotation and target can't be set at the same time,
if so, error will be thrown. Set rotation is preserved until next call of setCameraState with
empty rotation field.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `state` | [`CameraState`](../modules/cognite_reveal.md#camerastate) | Camera state. |

#### Returns

`void`

#### Implementation of

[CameraManager](../interfaces/cognite_reveal.CameraManager.md).[setCameraState](../interfaces/cognite_reveal.CameraManager.md#setcamerastate)

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:206](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L206)

___

### update

▸ **update**(`deltaTime`, `boundingBox`): `void`

Updates internal state of camera manager. Expected to update visual state of the camera
as well as it's near and far planes if needed. Called in `requestAnimationFrame`-loop.
Reveal performance affects frequency with which this method is called.

#### Parameters

| Name | Type |
| :------ | :------ |
| `deltaTime` | `number` |
| `boundingBox` | `Box3` |

#### Returns

`void`

#### Implementation of

[CameraManager](../interfaces/cognite_reveal.CameraManager.md).[update](../interfaces/cognite_reveal.CameraManager.md#update)

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:252](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L252)
