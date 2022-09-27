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

[packages/camera-manager/src/ComboControls.ts:108](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/camera-manager/src/ComboControls.ts#L108)

## Properties

### EPSILON

• **EPSILON**: `number` = `0.001`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:70](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/camera-manager/src/ComboControls.ts#L70)

___

### dampingFactor

• **dampingFactor**: `number` = `0.25`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:48](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/camera-manager/src/ComboControls.ts#L48)

___

### dispose

• **dispose**: () => `void`

#### Type declaration

▸ (): `void`

##### Returns

`void`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:71](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/camera-manager/src/ComboControls.ts#L71)

___

### dollyFactor

• **dollyFactor**: `number` = `0.99`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:52](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/camera-manager/src/ComboControls.ts#L52)

___

### dynamicTarget

• **dynamicTarget**: `boolean` = `true`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:49](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/camera-manager/src/ComboControls.ts#L49)

___

### enableDamping

• **enableDamping**: `boolean` = `true`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:47](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/camera-manager/src/ComboControls.ts#L47)

___

### enableKeyboardNavigation

• **enableKeyboardNavigation**: `boolean` = `true`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:61](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/camera-manager/src/ComboControls.ts#L61)

___

### enabled

• **enabled**: `boolean` = `true`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:46](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/camera-manager/src/ComboControls.ts#L46)

___

### firstPersonRotationFactor

• **firstPersonRotationFactor**: `number` = `0.4`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:58](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/camera-manager/src/ComboControls.ts#L58)

___

### keyboardDollySpeed

• **keyboardDollySpeed**: `number` = `2`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:65](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/camera-manager/src/ComboControls.ts#L65)

___

### keyboardPanSpeed

• **keyboardPanSpeed**: `number` = `10`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:66](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/camera-manager/src/ComboControls.ts#L66)

___

### keyboardRotationSpeedAzimuth

• **keyboardRotationSpeedAzimuth**: `number` = `defaultKeyboardRotationSpeed`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:62](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/camera-manager/src/ComboControls.ts#L62)

___

### keyboardRotationSpeedPolar

• **keyboardRotationSpeedPolar**: `number` = `defaultKeyboardRotationSpeed`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:63](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/camera-manager/src/ComboControls.ts#L63)

___

### keyboardSpeedFactor

• **keyboardSpeedFactor**: `number` = `3`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:67](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/camera-manager/src/ComboControls.ts#L67)

___

### lookAtViewTarget

• **lookAtViewTarget**: `boolean` = `false`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:76](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/camera-manager/src/ComboControls.ts#L76)

___

### maxAzimuthAngle

• **maxAzimuthAngle**: `number` = `Infinity`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:56](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/camera-manager/src/ComboControls.ts#L56)

___

### maxDeltaDownscaleCoefficient

• **maxDeltaDownscaleCoefficient**: `number` = `1`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:82](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/camera-manager/src/ComboControls.ts#L82)

___

### maxDeltaRatio

• **maxDeltaRatio**: `number` = `8`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:80](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/camera-manager/src/ComboControls.ts#L80)

___

### maxPolarAngle

• **maxPolarAngle**: `number` = `Math.PI`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:54](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/camera-manager/src/ComboControls.ts#L54)

___

### maxZoom

• **maxZoom**: `number` = `Infinity`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:73](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/camera-manager/src/ComboControls.ts#L73)

___

### minAzimuthAngle

• **minAzimuthAngle**: `number` = `-Infinity`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:55](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/camera-manager/src/ComboControls.ts#L55)

___

### minDeltaDownscaleCoefficient

• **minDeltaDownscaleCoefficient**: `number` = `0.1`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:81](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/camera-manager/src/ComboControls.ts#L81)

___

### minDeltaRatio

• **minDeltaRatio**: `number` = `1`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:79](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/camera-manager/src/ComboControls.ts#L79)

___

### minDistance

• **minDistance**: `number` = `0.8`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:50](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/camera-manager/src/ComboControls.ts#L50)

___

### minPolarAngle

• **minPolarAngle**: `number` = `0`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:53](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/camera-manager/src/ComboControls.ts#L53)

___

### minZoom

• **minZoom**: `number` = `0`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:72](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/camera-manager/src/ComboControls.ts#L72)

___

### minZoomDistance

• **minZoomDistance**: `number` = `0.4`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:51](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/camera-manager/src/ComboControls.ts#L51)

___

### mouseFirstPersonRotationSpeed

• **mouseFirstPersonRotationSpeed**: `number`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:64](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/camera-manager/src/ComboControls.ts#L64)

___

### orthographicCameraDollyFactor

• **orthographicCameraDollyFactor**: `number` = `0.3`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:74](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/camera-manager/src/ComboControls.ts#L74)

___

### panDollyMinDistanceFactor

• **panDollyMinDistanceFactor**: `number` = `10.0`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:57](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/camera-manager/src/ComboControls.ts#L57)

___

### pinchEpsilon

• **pinchEpsilon**: `number` = `2`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:68](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/camera-manager/src/ComboControls.ts#L68)

___

### pinchPanSpeed

• **pinchPanSpeed**: `number` = `1`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:69](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/camera-manager/src/ComboControls.ts#L69)

___

### pointerRotationSpeedAzimuth

• **pointerRotationSpeedAzimuth**: `number` = `defaultPointerRotationSpeed`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:59](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/camera-manager/src/ComboControls.ts#L59)

___

### pointerRotationSpeedPolar

• **pointerRotationSpeedPolar**: `number` = `defaultPointerRotationSpeed`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:60](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/camera-manager/src/ComboControls.ts#L60)

___

### useScrollTarget

• **useScrollTarget**: `boolean` = `false`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:77](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/camera-manager/src/ComboControls.ts#L77)

___

### zoomToCursor

• **zoomToCursor**: `boolean` = `true`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:78](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/camera-manager/src/ComboControls.ts#L78)

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

[packages/camera-manager/src/ComboControls.ts:258](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/camera-manager/src/ComboControls.ts#L258)

## Methods

### getScrollTarget

▸ **getScrollTarget**(): `Vector3`

#### Returns

`Vector3`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:270](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/camera-manager/src/ComboControls.ts#L270)

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

[packages/camera-manager/src/ComboControls.ts:233](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/camera-manager/src/ComboControls.ts#L233)

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

[packages/camera-manager/src/ComboControls.ts:266](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/camera-manager/src/ComboControls.ts#L266)

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

[packages/camera-manager/src/ComboControls.ts:241](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/camera-manager/src/ComboControls.ts#L241)

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

[packages/camera-manager/src/ComboControls.ts:262](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/camera-manager/src/ComboControls.ts#L262)

___

### triggerCameraChangeEvent

▸ **triggerCameraChangeEvent**(): `void`

#### Returns

`void`

#### Defined in

[packages/camera-manager/src/ComboControls.ts:274](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/camera-manager/src/ComboControls.ts#L274)

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

[packages/camera-manager/src/ComboControls.ts:147](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/camera-manager/src/ComboControls.ts#L147)
