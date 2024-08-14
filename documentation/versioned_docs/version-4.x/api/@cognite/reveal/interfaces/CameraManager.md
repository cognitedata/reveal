# Interface: CameraManager

Interface for manager responsible for all manipulations to the camera,
including animations and modification of state. Implementations are responsible for
providing a `THREE.PerspectiveCamera` instance to the viewer. Implementations
must trigger the `cameraChange`-event when camera is changed.
The default implementation is [DefaultCameraManager](../classes/DefaultCameraManager.md).

## Extended by

- [`IFlexibleCameraManager`](IFlexibleCameraManager.md)

## Methods

### activate()

> **activate**(`cameraManager`?): `void`

Set this manager as active and enable controls.

Should update CameraManager.enabled to reflect the state of the manager.
Note that this is called automatically when a new CameraManager is set on the viewer.

#### Parameters

• **cameraManager?**: [`CameraManager`](CameraManager.md)

Previously used camera manager.

#### Returns

`void`

#### Defined in

[packages/camera-manager/src/CameraManager.ts:61](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/CameraManager.ts#L61)

***

### deactivate()

> **deactivate**(): `void`

Deactivate this manager and disable controls.

Should update CameraManager.enabled to reflect the state of the manager.
Note that this is called automatically when a new CameraManager is set on the viewer.

#### Returns

`void`

#### Defined in

[packages/camera-manager/src/CameraManager.ts:69](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/CameraManager.ts#L69)

***

### dispose()

> **dispose**(): `void`

#### Returns

`void`

#### Obvious

#### Defined in

[packages/camera-manager/src/CameraManager.ts:109](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/CameraManager.ts#L109)

***

### fitCameraToBoundingBox()

> **fitCameraToBoundingBox**(`boundingBox`, `duration`?, `radiusFactor`?): `void`

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

#### Defined in

[packages/camera-manager/src/CameraManager.ts:97](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/CameraManager.ts#L97)

***

### getCamera()

> **getCamera**(): `PerspectiveCamera`

Returns the camera used for rendering the viewer.
Note that the camera will not be modified directly by Reveal.
Implementations must trigger the `cameraChange`-event whenever the
camera changes.

#### Returns

`PerspectiveCamera`

#### Defined in

[packages/camera-manager/src/CameraManager.ts:29](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/CameraManager.ts#L29)

***

### getCameraState()

> **getCameraState**(): `Required` \<[`CameraState`](../type-aliases/CameraState.md)\>

Get camera's state

#### Returns

`Required` \<[`CameraState`](../type-aliases/CameraState.md)\>

Camera state: position, target and rotation.

#### Defined in

[packages/camera-manager/src/CameraManager.ts:52](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/CameraManager.ts#L52)

***

### off()

#### off(event, callback)

> **off**(`event`, `callback`): `void`

Unsubscribes from changes of the camera event.

##### Parameters

• **event**: `"cameraChange"`

The event type.

• **callback**: [`CameraChangeDelegate`](../type-aliases/CameraChangeDelegate.md)

Callback function to be unsubscribed.

##### Returns

`void`

##### Defined in

[packages/camera-manager/src/CameraManager.ts:87](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/CameraManager.ts#L87)

#### off(event, callback)

> **off**(`event`, `callback`): `void`

##### Parameters

• **event**: `"cameraStop"`

• **callback**: [`CameraStopDelegate`](../type-aliases/CameraStopDelegate.md)

##### Returns

`void`

##### Defined in

[packages/camera-manager/src/CameraManager.ts:88](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/CameraManager.ts#L88)

#### off(event, callback)

> **off**(`event`, `callback`): `void`

##### Parameters

• **event**: `"cameraChange"` \| `"cameraStop"`

• **callback**: [`CameraEventDelegate`](../type-aliases/CameraEventDelegate.md)

##### Returns

`void`

##### Defined in

[packages/camera-manager/src/CameraManager.ts:89](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/CameraManager.ts#L89)

***

### on()

#### on(event, callback)

> **on**(`event`, `callback`): `void`

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

##### Defined in

[packages/camera-manager/src/CameraManager.ts:78](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/CameraManager.ts#L78)

#### on(event, callback)

> **on**(`event`, `callback`): `void`

##### Parameters

• **event**: `"cameraStop"`

• **callback**: [`CameraStopDelegate`](../type-aliases/CameraStopDelegate.md)

##### Returns

`void`

##### Defined in

[packages/camera-manager/src/CameraManager.ts:79](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/CameraManager.ts#L79)

#### on(event, callback)

> **on**(`event`, `callback`): `void`

##### Parameters

• **event**: `"cameraChange"` \| `"cameraStop"`

• **callback**: [`CameraEventDelegate`](../type-aliases/CameraEventDelegate.md)

##### Returns

`void`

##### Defined in

[packages/camera-manager/src/CameraManager.ts:80](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/CameraManager.ts#L80)

***

### setCameraState()

> **setCameraState**(`state`): `void`

Set camera's state. Rotation and target can't be set at the same time as they could conflict,
should throw an error if both are passed with non-zero value inside state.

#### Parameters

• **state**: [`CameraState`](../type-aliases/CameraState.md)

Camera state, all fields are optional.

#### Returns

`void`

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

#### Defined in

[packages/camera-manager/src/CameraManager.ts:105](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/CameraManager.ts#L105)
