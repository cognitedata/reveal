# Class: CameraManagerHelper

Helper methods for implementing a camera manager.

## Constructors

### new CameraManagerHelper()

> **new CameraManagerHelper**(): [`CameraManagerHelper`](CameraManagerHelper.md)

#### Returns

[`CameraManagerHelper`](CameraManagerHelper.md)

## Methods

### calculateCameraStateToFitBoundingBox()

> `static` **calculateCameraStateToFitBoundingBox**(`camera`, `boundingBox`, `radiusFactor`): `object`

Calculates camera position and target that allows to see the content of provided bounding box.

#### Parameters

• **camera**: `PerspectiveCamera`

Used camera instance.

• **boundingBox**: `Box3`

Bounding box to be fitted.

• **radiusFactor**: `number` = `2`

The ratio of the distance from camera to center of box and radius of the box.

#### Returns

`object`

##### position

> **position**: `Vector3`

##### target

> **target**: `Vector3`

#### Defined in

[packages/camera-manager/src/CameraManagerHelper.ts:111](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/CameraManagerHelper.ts#L111)

***

### calculateNewRotationFromTarget()

> `static` **calculateNewRotationFromTarget**(`camera`, `newTarget`): `Quaternion`

Calculates camera rotation from target

#### Parameters

• **camera**: `PerspectiveCamera`

Used Camera instance

• **newTarget**: `Vector3`

The target to compute rotation from

#### Returns

`Quaternion`

New camera rotationg

#### Defined in

[packages/camera-manager/src/CameraManagerHelper.ts:70](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/CameraManagerHelper.ts#L70)

***

### calculateNewTargetFromRotation()

> `static` **calculateNewTargetFromRotation**(`camera`, `rotation`, `currentTarget`, `position`): `Vector3`

Calculates camera target based on new camera rotation.

#### Parameters

• **camera**: `PerspectiveCamera`

Used camera instance.

• **rotation**: `Quaternion`

New camera rotation in quaternion form.

• **currentTarget**: `Vector3`

Current camera target.

• **position**: `Vector3`

New camera position.

#### Returns

`Vector3`

#### Defined in

[packages/camera-manager/src/CameraManagerHelper.ts:43](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/CameraManagerHelper.ts#L43)

***

### updateCameraNearAndFar()

> `static` **updateCameraNearAndFar**(`camera`, `boundingBox`): `void`

Updates near and far plane of the camera based on the bounding box.

#### Parameters

• **camera**: `PerspectiveCamera`

Used camera instance.

• **boundingBox**: `Box3`

Bounding box of all objects on the scene.

#### Returns

`void`

#### Defined in

[packages/camera-manager/src/CameraManagerHelper.ts:80](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/CameraManagerHelper.ts#L80)
