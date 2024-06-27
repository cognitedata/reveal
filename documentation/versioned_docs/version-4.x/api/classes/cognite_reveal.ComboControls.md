---
id: "cognite_reveal.ComboControls"
title: "Class: ComboControls"
sidebar_label: "ComboControls"
custom_edit_url: null
---

[@cognite/reveal](../modules/cognite_reveal.md).ComboControls

## Hierarchy

- `EventDispatcher`

  ↳ **`ComboControls`**

## Constructors

### constructor

• **new ComboControls**(`camera`, `domElement`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `camera` | `PerspectiveCamera` \| `OrthographicCamera` |
| `domElement` | `HTMLElement` |

#### Overrides

EventDispatcher.constructor

#### Defined in

[packages/camera-manager/src/ComboControls.ts:218](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/camera-manager/src/ComboControls.ts#L218)

## Properties

### dispose

• **dispose**: () => `void`

#### Type declaration

▸ (): `void`

##### Returns

`void`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:115](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/camera-manager/src/ComboControls.ts#L115)

## Accessors

### cameraRawRotation

• `get` **cameraRawRotation**(): `Quaternion`

Camera rotation to be used by the camera instead of target-based rotation.
This rotation is used only when set to non-default quaternion value (not identity rotation quaternion).
Externally, value is updated by `CameraManager` when `setState` method with non-zero rotation is called. Automatically
resets to default value when `setState` method is called with no rotation value.

#### Returns

`Quaternion`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:337](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/camera-manager/src/ComboControls.ts#L337)

___

### enabled

• `get` **enabled**(): `boolean`

Returns true if these controls are enabled.

#### Returns

`boolean`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:200](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/camera-manager/src/ComboControls.ts#L200)

• `set` **enabled**(`newEnabledValue`): `void`

Sets the enabled state of these controls.

#### Parameters

| Name | Type |
| :------ | :------ |
| `newEnabledValue` | `boolean` |

#### Returns

`void`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:207](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/camera-manager/src/ComboControls.ts#L207)

___

### options

• `get` **options**(): `Readonly`\<[`ComboControlsOptions`](../modules/cognite_reveal.md#combocontrolsoptions)\>

Gets current Combo Controls options.

#### Returns

`Readonly`\<[`ComboControlsOptions`](../modules/cognite_reveal.md#combocontrolsoptions)\>

#### Defined in

[packages/camera-manager/src/ComboControls.ts:184](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/camera-manager/src/ComboControls.ts#L184)

• `set` **options**(`options`): `void`

Sets Combo Controls options.

Only the provided options will be changed, any undefined options will be kept as is.

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | `Partial`\<[`ComboControlsOptions`](../modules/cognite_reveal.md#combocontrolsoptions)\> |

#### Returns

`void`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:193](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/camera-manager/src/ComboControls.ts#L193)

## Methods

### getScrollTarget

▸ **getScrollTarget**(): `Vector3`

#### Returns

`Vector3`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:350](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/camera-manager/src/ComboControls.ts#L350)

___

### getState

▸ **getState**(): `Object`

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `position` | `Vector3` |
| `target` | `Vector3` |

#### Defined in

[packages/camera-manager/src/ComboControls.ts:312](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/camera-manager/src/ComboControls.ts#L312)

___

### setScrollTarget

▸ **setScrollTarget**(`target`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `target` | `Vector3` |

#### Returns

`void`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:346](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/camera-manager/src/ComboControls.ts#L346)

___

### setState

▸ **setState**(`position`, `target`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `position` | `Vector3` |
| `target` | `Vector3` |

#### Returns

`void`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:320](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/camera-manager/src/ComboControls.ts#L320)

___

### setViewTarget

▸ **setViewTarget**(`target`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `target` | `Vector3` |

#### Returns

`void`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:341](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/camera-manager/src/ComboControls.ts#L341)

___

### triggerCameraChangeEvent

▸ **triggerCameraChangeEvent**(): `void`

#### Returns

`void`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:354](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/camera-manager/src/ComboControls.ts#L354)

___

### update

▸ **update**(`deltaTime`, `forceUpdate?`): `boolean`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `deltaTime` | `number` | `undefined` |
| `forceUpdate` | `boolean` | `false` |

#### Returns

`boolean`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:238](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/camera-manager/src/ComboControls.ts#L238)
