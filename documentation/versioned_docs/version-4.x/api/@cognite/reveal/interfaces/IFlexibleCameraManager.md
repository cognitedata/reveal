# Interface: IFlexibleCameraManager

**`Beta`**

Flexible implementation of [CameraManager](CameraManager.md). The user can switch between Orbit, FirstPerson or OrbitInCenter
Supports automatic update of camera near and far planes and animated change of camera position and target.
It provides additional functionality for controlling camera behavior and rotation.

## Extends

- [`CameraManager`](CameraManager.md)

## Accessors

### controlsType

> `get` **controlsType**(): [`FlexibleControlsType`](../enumerations/FlexibleControlsType.md)

**`Beta`**

Get current FlexibleControlsType type

> `set` **controlsType**(`value`): `void`

**`Beta`**

Set current FlexibleControlsType type

#### Parameters

• **value**: [`FlexibleControlsType`](../enumerations/FlexibleControlsType.md)

#### Returns

[`FlexibleControlsType`](../enumerations/FlexibleControlsType.md)

#### Defined in

[packages/camera-manager/src/Flexible/IFlexibleCameraManager.ts:26](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/Flexible/IFlexibleCameraManager.ts#L26)

***

### options

> `get` **options**(): [`FlexibleControlsOptions`](../classes/FlexibleControlsOptions.md)

**`Beta`**

Set the options for the camera manager

#### Returns

[`FlexibleControlsOptions`](../classes/FlexibleControlsOptions.md)

#### Defined in

[packages/camera-manager/src/Flexible/IFlexibleCameraManager.ts:37](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/Flexible/IFlexibleCameraManager.ts#L37)

## Methods

### activate()

> **activate**(`cameraManager`?): `void`

**`Beta`**

Set this manager as active and enable controls.

Should update CameraManager.enabled to reflect the state of the manager.
Note that this is called automatically when a new CameraManager is set on the viewer.

#### Parameters

• **cameraManager?**: [`CameraManager`](CameraManager.md)

Previously used camera manager.

#### Returns

`void`

#### Inherited from

[`CameraManager`](CameraManager.md) . [`activate`](CameraManager.md#activate)

#### Defined in

[packages/camera-manager/src/CameraManager.ts:61](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/CameraManager.ts#L61)

***

### addControlsTypeChangeListener()

> **addControlsTypeChangeListener**(`callback`): `void`

**`Beta`**

Adds a listener for changes in the controls type of the camera manager.

#### Parameters

• **callback**: [`FlexibleControlsTypeChangeDelegate`](../type-aliases/FlexibleControlsTypeChangeDelegate.md)

The callback function to be invoked when the controls type changes.

#### Returns

`void`

#### Defined in

[packages/camera-manager/src/Flexible/IFlexibleCameraManager.ts:52](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/Flexible/IFlexibleCameraManager.ts#L52)

***

### deactivate()

> **deactivate**(): `void`

**`Beta`**

Deactivate this manager and disable controls.

Should update CameraManager.enabled to reflect the state of the manager.
Note that this is called automatically when a new CameraManager is set on the viewer.

#### Returns

`void`

#### Inherited from

[`CameraManager`](CameraManager.md) . [`deactivate`](CameraManager.md#deactivate)

#### Defined in

[packages/camera-manager/src/CameraManager.ts:69](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/CameraManager.ts#L69)

***

### dispose()

> **dispose**(): `void`

**`Beta`**

#### Returns

`void`

#### Inherited from

[`CameraManager`](CameraManager.md) . [`dispose`](CameraManager.md#dispose)

#### Obvious

#### Defined in

[packages/camera-manager/src/CameraManager.ts:109](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/CameraManager.ts#L109)

***

### fitCameraToBoundingBox()

> **fitCameraToBoundingBox**(`boundingBox`, `duration`?, `radiusFactor`?): `void`

**`Beta`**

Moves camera to a place where the content of a bounding box is visible to the camera.

#### Parameters

• **boundingBox**: `Box3`

The bounding box in world space.

• **duration?**: `number`

The duration of the animation moving the camera.

• **radiusFactor?**: `number`

The ratio of the distance from camera to center of box and radius of the box.

#### Returns

`void`

#### Inherited from

[`CameraManager`](CameraManager.md) . [`fitCameraToBoundingBox`](CameraManager.md#fitcameratoboundingbox)

#### Defined in

[packages/camera-manager/src/CameraManager.ts:97](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/CameraManager.ts#L97)

***

### getCamera()

> **getCamera**(): `PerspectiveCamera`

**`Beta`**

Returns the camera used for rendering the viewer.
Note that the camera will not be modified directly by Reveal.
Implementations must trigger the `cameraChange`-event whenever the
camera changes.

#### Returns

`PerspectiveCamera`

#### Inherited from

[`CameraManager`](CameraManager.md) . [`getCamera`](CameraManager.md#getcamera)

#### Defined in

[packages/camera-manager/src/CameraManager.ts:29](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/CameraManager.ts#L29)

***

### getCameraState()

> **getCameraState**(): `Required` \<[`CameraState`](../type-aliases/CameraState.md)\>

**`Beta`**

Get camera's state

#### Returns

`Required` \<[`CameraState`](../type-aliases/CameraState.md)\>

Camera state: position, target and rotation.

#### Inherited from

[`CameraManager`](CameraManager.md) . [`getCameraState`](CameraManager.md#getcamerastate)

#### Defined in

[packages/camera-manager/src/CameraManager.ts:52](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/CameraManager.ts#L52)

***

### off()

#### off(event, callback)

> **off**(`event`, `callback`): `void`

**`Beta`**

Unsubscribes from changes of the camera event.

##### Parameters

• **event**: `"cameraChange"`

The event type.

• **callback**: [`CameraChangeDelegate`](../type-aliases/CameraChangeDelegate.md)

Callback function to be unsubscribed.

##### Returns

`void`

##### Inherited from

[`CameraManager`](CameraManager.md) . [`off`](CameraManager.md#off)

##### Defined in

[packages/camera-manager/src/CameraManager.ts:87](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/CameraManager.ts#L87)

#### off(event, callback)

> **off**(`event`, `callback`): `void`

**`Beta`**

##### Parameters

• **event**: `"cameraStop"`

• **callback**: [`CameraStopDelegate`](../type-aliases/CameraStopDelegate.md)

##### Returns

`void`

##### Inherited from

[`CameraManager`](CameraManager.md) . [`off`](CameraManager.md#off)

##### Defined in

[packages/camera-manager/src/CameraManager.ts:88](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/CameraManager.ts#L88)

#### off(event, callback)

> **off**(`event`, `callback`): `void`

**`Beta`**

##### Parameters

• **event**: `"cameraChange"` \| `"cameraStop"`

• **callback**: [`CameraEventDelegate`](../type-aliases/CameraEventDelegate.md)

##### Returns

`void`

##### Inherited from

[`CameraManager`](CameraManager.md) . [`off`](CameraManager.md#off)

##### Defined in

[packages/camera-manager/src/CameraManager.ts:89](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/CameraManager.ts#L89)

***

### on()

#### on(event, callback)

> **on**(`event`, `callback`): `void`

**`Beta`**

Subscribes to events on this camera manager. There are several event types:
'cameraChange' - Subscribes to changes of the camera. This is used by Reveal to react on changes of the camera.
'cameraStop' - Subscribes to events indicating the camera has stopped

##### Parameters

• **event**: `"cameraChange"`

The event type.

• **callback**: [`CameraChangeDelegate`](../type-aliases/CameraChangeDelegate.md)

Callback to be called when the event is fired.

##### Returns

`void`

##### Inherited from

[`CameraManager`](CameraManager.md) . [`on`](CameraManager.md#on)

##### Defined in

[packages/camera-manager/src/CameraManager.ts:78](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/CameraManager.ts#L78)

#### on(event, callback)

> **on**(`event`, `callback`): `void`

**`Beta`**

##### Parameters

• **event**: `"cameraStop"`

• **callback**: [`CameraStopDelegate`](../type-aliases/CameraStopDelegate.md)

##### Returns

`void`

##### Inherited from

[`CameraManager`](CameraManager.md) . [`on`](CameraManager.md#on)

##### Defined in

[packages/camera-manager/src/CameraManager.ts:79](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/CameraManager.ts#L79)

#### on(event, callback)

> **on**(`event`, `callback`): `void`

**`Beta`**

##### Parameters

• **event**: `"cameraChange"` \| `"cameraStop"`

• **callback**: [`CameraEventDelegate`](../type-aliases/CameraEventDelegate.md)

##### Returns

`void`

##### Inherited from

[`CameraManager`](CameraManager.md) . [`on`](CameraManager.md#on)

##### Defined in

[packages/camera-manager/src/CameraManager.ts:80](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/CameraManager.ts#L80)

***

### onClick()

> **onClick**(`event`): `Promise`\<`void`\>

**`Beta`**

Called when a click event is triggered

#### Parameters

• **event**: `PointerEvent`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/camera-manager/src/Flexible/IFlexibleCameraManager.ts:64](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/Flexible/IFlexibleCameraManager.ts#L64)

***

### onDoubleClick()

> **onDoubleClick**(`event`): `Promise`\<`void`\>

**`Beta`**

Called when double click event is triggered

#### Parameters

• **event**: `PointerEvent`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/camera-manager/src/Flexible/IFlexibleCameraManager.ts:70](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/Flexible/IFlexibleCameraManager.ts#L70)

***

### onFocusChanged()

> **onFocusChanged**(`haveFocus`): `void`

**`Beta`**

Called when focus is changed

#### Parameters

• **haveFocus**: `boolean`

#### Returns

`void`

#### Defined in

[packages/camera-manager/src/Flexible/IFlexibleCameraManager.ts:105](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/Flexible/IFlexibleCameraManager.ts#L105)

***

### onKey()

> **onKey**(`event`, `down`): `void`

**`Beta`**

Called when a key is pressed or released

#### Parameters

• **event**: `KeyboardEvent`

• **down**: `boolean`

#### Returns

`void`

#### Defined in

[packages/camera-manager/src/Flexible/IFlexibleCameraManager.ts:99](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/Flexible/IFlexibleCameraManager.ts#L99)

***

### onPointerDown()

> **onPointerDown**(`event`, `leftButton`): `Promise`\<`void`\>

**`Beta`**

Called when pointer is pressed

#### Parameters

• **event**: `PointerEvent`

• **leftButton**: `boolean`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/camera-manager/src/Flexible/IFlexibleCameraManager.ts:76](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/Flexible/IFlexibleCameraManager.ts#L76)

***

### onPointerDrag()

> **onPointerDrag**(`event`, `leftButton`): `Promise`\<`void`\>

**`Beta`**

Called when pointer is dragged

#### Parameters

• **event**: `PointerEvent`

• **leftButton**: `boolean`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/camera-manager/src/Flexible/IFlexibleCameraManager.ts:82](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/Flexible/IFlexibleCameraManager.ts#L82)

***

### onPointerUp()

> **onPointerUp**(`event`, `leftButton`): `Promise`\<`void`\>

**`Beta`**

Called when pointer is released

#### Parameters

• **event**: `PointerEvent`

• **leftButton**: `boolean`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/camera-manager/src/Flexible/IFlexibleCameraManager.ts:88](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/Flexible/IFlexibleCameraManager.ts#L88)

***

### onWheel()

> **onWheel**(`event`, `delta`): `Promise`\<`void`\>

**`Beta`**

Called when wheel event is triggered

#### Parameters

• **event**: `WheelEvent`

• **delta**: `number`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/camera-manager/src/Flexible/IFlexibleCameraManager.ts:93](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/Flexible/IFlexibleCameraManager.ts#L93)

***

### removeControlsTypeChangeListener()

> **removeControlsTypeChangeListener**(`callback`): `void`

**`Beta`**

Removes a listener for changes in the controls type of the camera manager.

#### Parameters

• **callback**: [`FlexibleControlsTypeChangeDelegate`](../type-aliases/FlexibleControlsTypeChangeDelegate.md)

The callback function to be removed from the controls type change listeners.

#### Returns

`void`

#### Defined in

[packages/camera-manager/src/Flexible/IFlexibleCameraManager.ts:58](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/Flexible/IFlexibleCameraManager.ts#L58)

***

### rotateCameraTo()

> **rotateCameraTo**(`direction`, `animationDuration`): `void`

**`Beta`**

Rotates the camera to look in the specified direction.
Supports automatic update of camera near and far planes and animated change of camera position and target.

#### Parameters

• **direction**: `Vector3`

The direction to rotate the camera towards.

• **animationDuration**: `number`

The duration of the rotation animation in milliseconds.

#### Returns

`void`

#### Defined in

[packages/camera-manager/src/Flexible/IFlexibleCameraManager.ts:46](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/Flexible/IFlexibleCameraManager.ts#L46)

***

### setCameraState()

> **setCameraState**(`state`): `void`

**`Beta`**

Set camera's state. Rotation and target can't be set at the same time as they could conflict,
should throw an error if both are passed with non-zero value inside state.

#### Parameters

• **state**: [`CameraState`](../type-aliases/CameraState.md)

Camera state, all fields are optional.

#### Returns

`void`

#### Inherited from

[`CameraManager`](CameraManager.md) . [`setCameraState`](CameraManager.md#setcamerastate)

#### Example

```js
// store position, target
const { position, target } = cameraManager.getCameraState();
// restore position, target
cameraManager.setCameraState({ position, target });
```

#### Defined in

[packages/camera-manager/src/CameraManager.ts:46](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/CameraManager.ts#L46)

***

### update()

> **update**(`deltaTime`, `boundingBox`): `void`

**`Beta`**

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

#### Inherited from

[`CameraManager`](CameraManager.md) . [`update`](CameraManager.md#update)

#### Defined in

[packages/camera-manager/src/CameraManager.ts:105](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/CameraManager.ts#L105)
