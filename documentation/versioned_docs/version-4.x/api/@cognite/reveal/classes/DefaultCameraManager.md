# Class: DefaultCameraManager

Default implementation of [CameraManager](../interfaces/CameraManager.md). Uses target-based orbit controls combined with
keyboard and mouse navigation possibility. Supports automatic update of camera near and far
planes and animated change of camera position and target.

## Implements

- [`CameraManager`](../interfaces/CameraManager.md)

## Properties

### automaticControlsSensitivity

> **automaticControlsSensitivity**: `boolean` = `true`

When false, the sensitivity of the camera controls will not be updated automatically.
This can be useful to better control the sensitivity of the 3D navigation.

When not set, control the sensitivity of the camera using `viewer.cameraManager.cameraControls.minDistance`
and `viewer.cameraManager.cameraControls.maxDistance`.

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:108](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L108)

***

### automaticNearFarPlane

> **automaticNearFarPlane**: `boolean` = `true`

When false, camera near and far planes will not be updated automatically (defaults to true).
This can be useful when you have custom content in the 3D view and need to better
control the view frustum.

When automatic camera near/far planes are disabled, you are responsible for setting
this on your own.

#### Example

```
viewer.camera.near = 0.1;
viewer.camera.far = 1000.0;
viewer.camera.updateProjectionMatrix();
```

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:100](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L100)

## Accessors

### keyboardNavigationEnabled

> `get` **keyboardNavigationEnabled**(): `boolean`

Whether keyboard control of the camera is enabled/disabled.

> `set` **keyboardNavigationEnabled**(`enabled`): `void`

Sets whether keyboard control of the camera is enabled/disabled.

#### Parameters

• **enabled**: `boolean`

#### Returns

`boolean`

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:194](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L194)

## Methods

### activate()

> **activate**(`cameraManager`?): `void`

Set this manager as active and enable controls.

Should update CameraManager.enabled to reflect the state of the manager.
Note that this is called automatically when a new CameraManager is set on the viewer.

#### Parameters

• **cameraManager?**: [`CameraManager`](../interfaces/CameraManager.md)

Previously used camera manager.

#### Returns

`void`

#### Implementation of

[`CameraManager`](../interfaces/CameraManager.md) . [`activate`](../interfaces/CameraManager.md#activate)

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:237](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L237)

***

### deactivate()

> **deactivate**(): `void`

Deactivate this manager and disable controls.

Should update CameraManager.enabled to reflect the state of the manager.
Note that this is called automatically when a new CameraManager is set on the viewer.

#### Returns

`void`

#### Implementation of

[`CameraManager`](../interfaces/CameraManager.md) . [`deactivate`](../interfaces/CameraManager.md#deactivate)

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:251](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L251)

***

### dispose()

> **dispose**(): `void`

#### Returns

`void`

#### Implementation of

[`CameraManager`](../interfaces/CameraManager.md) . [`dispose`](../interfaces/CameraManager.md#dispose)

#### Obvious

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:289](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L289)

***

### fitCameraToBoundingBox()

> **fitCameraToBoundingBox**(`box`, `duration`?, `radiusFactor`?): `void`

Moves camera to a place where the content of a bounding box is visible to the camera.

#### Parameters

• **box**: `Box3`

The bounding box in world space.

• **duration?**: `number`

The duration of the animation moving the camera.

• **radiusFactor?**: `number` = `2`

The ratio of the distance from camera to center of box and radius of the box.

#### Returns

`void`

#### Implementation of

[`CameraManager`](../interfaces/CameraManager.md) . [`fitCameraToBoundingBox`](../interfaces/CameraManager.md#fitcameratoboundingbox)

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:164](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L164)

***

### getCamera()

> **getCamera**(): `PerspectiveCamera`

Returns the camera used for rendering the viewer.
Note that the camera will not be modified directly by Reveal.
Implementations must trigger the `cameraChange`-event whenever the
camera changes.

#### Returns

`PerspectiveCamera`

#### Implementation of

[`CameraManager`](../interfaces/CameraManager.md) . [`getCamera`](../interfaces/CameraManager.md#getcamera)

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:198](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L198)

***

### getCameraControlsOptions()

> **getCameraControlsOptions**(): [`CameraControlsOptions`](../type-aliases/CameraControlsOptions.md)

Gets current camera controls options.

#### Returns

[`CameraControlsOptions`](../type-aliases/CameraControlsOptions.md)

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:262](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L262)

***

### getCameraState()

> **getCameraState**(): `Required` \<[`CameraState`](../type-aliases/CameraState.md)\>

Get camera's state

#### Returns

`Required` \<[`CameraState`](../type-aliases/CameraState.md)\>

Camera state: position, target and rotation.

#### Implementation of

[`CameraManager`](../interfaces/CameraManager.md) . [`getCameraState`](../interfaces/CameraManager.md#getcamerastate)

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:229](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L229)

***

### getComboControlsOptions()

> **getComboControlsOptions**(): `Readonly` \<[`ComboControlsOptions`](../type-aliases/ComboControlsOptions.md)\>

Gets current Combo Controls options.

#### Returns

`Readonly` \<[`ComboControlsOptions`](../type-aliases/ComboControlsOptions.md)\>

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:172](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L172)

***

### off()

> **off**(`event`, `callback`): `void`

Unsubscribes from changes of the camera event.

#### Parameters

• **event**: `"cameraChange"` \| `"cameraStop"`

The event type.

• **callback**: [`CameraEventDelegate`](../type-aliases/CameraEventDelegate.md)

Callback function to be unsubscribed.

#### Returns

`void`

#### Implementation of

[`CameraManager`](../interfaces/CameraManager.md) . [`off`](../interfaces/CameraManager.md#off)

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:151](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L151)

***

### on()

> **on**(`event`, `callback`): `void`

Subscribes to events on this camera manager. There are several event types:
'cameraChange' - Subscribes to changes of the camera. This is used by Reveal to react on changes of the camera.
'cameraStop' - Subscribes to events indicating the camera has stopped

#### Parameters

• **event**: `"cameraChange"` \| `"cameraStop"`

The event type.

• **callback**: [`CameraEventDelegate`](../type-aliases/CameraEventDelegate.md)

Callback to be called when the event is fired.

#### Returns

`void`

#### Implementation of

[`CameraManager`](../interfaces/CameraManager.md) . [`on`](../interfaces/CameraManager.md#on)

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:138](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L138)

***

### setCameraControlsOptions()

> **setCameraControlsOptions**(`controlsOptions`): `void`

Sets camera controls options to customize camera controls modes. See [CameraControlsOptions](../type-aliases/CameraControlsOptions.md).

#### Parameters

• **controlsOptions**: [`CameraControlsOptions`](../type-aliases/CameraControlsOptions.md)

JSON object with camera controls options.

#### Returns

`void`

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:270](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L270)

***

### setCameraState()

> **setCameraState**(`state`): `void`

Sets camera state. All parameters are optional. Rotation and target can't be set at the same time,
if so, error will be thrown. Set rotation is preserved until next call of setCameraState with
empty rotation field.

#### Parameters

• **state**: [`CameraState`](../type-aliases/CameraState.md)

Camera state.
*

#### Returns

`void`

#### Implementation of

[`CameraManager`](../interfaces/CameraManager.md) . [`setCameraState`](../interfaces/CameraManager.md#setcamerastate)

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:208](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L208)

***

### setComboControlsOptions()

> **setComboControlsOptions**(`options`): `void`

Sets Combo Controls options.
Only provided options will be changed, any undefined options will be kept as is.

#### Parameters

• **options**: `Partial` \<[`ComboControlsOptions`](../type-aliases/ComboControlsOptions.md)\>

#### Returns

`void`

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:180](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L180)

***

### update()

> **update**(`deltaTime`, `boundingBox`): `void`

Updates internal state of camera manager. Expected to update visual state of the camera
as well as it's near and far planes if needed. Called in `requestAnimationFrame`-loop.
Reveal performance affects frequency with which this method is called.

#### Parameters

• **deltaTime**: `number`

Delta time since last update in seconds.

• **boundingBox**: `Box3`

Global bounding box of the model(s) and any custom objects added to the scene.

#### Returns

`void`

#### Implementation of

[`CameraManager`](../interfaces/CameraManager.md) . [`update`](../interfaces/CameraManager.md#update)

#### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:280](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L280)
