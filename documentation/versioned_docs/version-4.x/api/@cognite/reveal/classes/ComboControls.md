# Class: ComboControls

## Extends

- `EventDispatcher` \<[`ComboControlsEventType`](../type-aliases/ComboControlsEventType.md)\>

## Constructors

### new ComboControls()

> **new ComboControls**(`camera`, `domElement`): [`ComboControls`](ComboControls.md)

#### Parameters

• **camera**: `PerspectiveCamera` \| `OrthographicCamera`

• **domElement**: `HTMLElement`

#### Returns

[`ComboControls`](ComboControls.md)

#### Overrides

`EventDispatcher<ComboControlsEventType>.constructor`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:68](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/ComboControls.ts#L68)

## Properties

### dispose()

> **dispose**: () => `void`

#### Returns

`void`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:38](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/ComboControls.ts#L38)

## Accessors

### cameraRawRotation

> `get` **cameraRawRotation**(): `Quaternion`

Camera rotation to be used by the camera instead of target-based rotation.
This rotation is used only when set to non-default quaternion value (not identity rotation quaternion).
Externally, value is updated by `CameraManager` when `setState` method with non-zero rotation is called. Automatically
resets to default value when `setState` method is called with no rotation value.

#### Returns

`Quaternion`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:130](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/ComboControls.ts#L130)

***

### enabled

> `get` **enabled**(): `boolean`

Returns true if these controls are enabled.

> `set` **enabled**(`newEnabledValue`): `void`

Sets the enabled state of these controls.

#### Parameters

• **newEnabledValue**: `boolean`

#### Returns

`boolean`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:108](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/ComboControls.ts#L108)

***

### options

> `get` **options**(): `Readonly` \<[`ComboControlsOptions`](../type-aliases/ComboControlsOptions.md)\>

Gets current Combo Controls options.

> `set` **options**(`options`): `void`

Sets Combo Controls options.

Only the provided options will be changed, any undefined options will be kept as is.

#### Parameters

• **options**: `Partial` \<[`ComboControlsOptions`](../type-aliases/ComboControlsOptions.md)\>

#### Returns

`Readonly` \<[`ComboControlsOptions`](../type-aliases/ComboControlsOptions.md)\>

#### Defined in

[packages/camera-manager/src/ComboControls.ts:92](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/ComboControls.ts#L92)

## Methods

### getScrollTarget()

> **getScrollTarget**(): `Vector3`

#### Returns

`Vector3`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:138](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/ComboControls.ts#L138)

***

### getState()

> **getState**(): `object`

#### Returns

`object`

##### position

> **position**: `Vector3`

##### target

> **target**: `Vector3`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:142](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/ComboControls.ts#L142)

***

### setScrollTarget()

> **setScrollTarget**(`target`): `void`

#### Parameters

• **target**: `Vector3`

#### Returns

`void`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:149](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/ComboControls.ts#L149)

***

### setState()

> **setState**(`position`, `target`): `void`

#### Parameters

• **position**: `Vector3`

• **target**: `Vector3`

#### Returns

`void`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:153](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/ComboControls.ts#L153)

***

### setViewTarget()

> **setViewTarget**(`target`): `void`

#### Parameters

• **target**: `Vector3`

#### Returns

`void`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:164](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/ComboControls.ts#L164)

***

### triggerCameraChangeEvent()

> **triggerCameraChangeEvent**(): `void`

#### Returns

`void`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:260](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/ComboControls.ts#L260)

***

### update()

> **update**(`deltaTimeS`, `forceUpdate`): `boolean`

#### Parameters

• **deltaTimeS**: `number`

• **forceUpdate**: `boolean` = `false`

#### Returns

`boolean`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:197](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/camera-manager/src/ComboControls.ts#L197)
