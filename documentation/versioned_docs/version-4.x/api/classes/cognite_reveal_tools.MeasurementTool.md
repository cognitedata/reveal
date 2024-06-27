---
id: "cognite_reveal_tools.MeasurementTool"
title: "Class: MeasurementTool"
sidebar_label: "MeasurementTool"
custom_edit_url: null
---

[@cognite/reveal/tools](../modules/cognite_reveal_tools.md).MeasurementTool

Enables [Cognite3DViewer](cognite_reveal.Cognite3DViewer.md) to perform a point to point measurement.
This can be achieved by selecting a point on the 3D Object and drag the pointer to
required point to get measurement of the distance.
The tools default measurement is in "Meters" as supported in Reveal, but it also provides
user to customise the measuring units based on their convinience with the callback.

**`Example`**

```js
const measurementTool = new MeasurementTool(viewer);
measurementTool.enterMeasurementMode();
// ...
measurementTool.exitMeasurementMode();

// detach the tool from the viewer
measurementTool.dispose();
```

**`Example`**

```jsx runnable-4x
const measurementTool = new MeasurementTool(viewer, {distanceToLabelCallback: (distanceInMeters) => {
   // 1 meters = 3.281 feet
   const distancesInFeet = distanceInMeters * 3.281;
   return { distanceInMeters: distancesInFeet, units: 'ft'};
 }});
 measurementTool.enterMeasurementMode();
```

## Hierarchy

- [`Cognite3DViewerToolBase`](cognite_reveal_tools.Cognite3DViewerToolBase.md)

  ↳ **`MeasurementTool`**

## Constructors

### constructor

• **new MeasurementTool**(`viewer`, `options?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `viewer` | [`Cognite3DViewer`](cognite_reveal.Cognite3DViewer.md) |
| `options?` | [`MeasurementOptions`](../modules/cognite_reveal_tools.md#measurementoptions) |

#### Overrides

[Cognite3DViewerToolBase](cognite_reveal_tools.Cognite3DViewerToolBase.md).[constructor](cognite_reveal_tools.Cognite3DViewerToolBase.md#constructor)

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:91](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L91)

## Accessors

### isInMeasurementMode

• `get` **isInMeasurementMode**(): `boolean`

Returns measurement mode state, is measurement mode started or ended.

#### Returns

`boolean`

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:54](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L54)

## Methods

### dispose

▸ **dispose**(): `void`

Dispose Measurement Tool.

#### Returns

`void`

#### Overrides

[Cognite3DViewerToolBase](cognite_reveal_tools.Cognite3DViewerToolBase.md).[dispose](cognite_reveal_tools.Cognite3DViewerToolBase.md#dispose)

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:367](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L367)

___

### enterMeasurementMode

▸ **enterMeasurementMode**(): `void`

Enter into point to point measurement mode.

#### Returns

`void`

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:235](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L235)

___

### exitMeasurementMode

▸ **exitMeasurementMode**(): `void`

Exit measurement mode.

#### Returns

`void`

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:249](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L249)

___

### getAllMeasurements

▸ **getAllMeasurements**(): [`Measurement`](../modules/cognite_reveal_tools.md#measurement)[]

Get all measurements from [Cognite3DViewer](cognite_reveal.Cognite3DViewer.md).

#### Returns

[`Measurement`](../modules/cognite_reveal_tools.md#measurement)[]

Array of Measurements containing Id, start point, end point & measured distance.

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:346](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L346)

___

### off

▸ **off**(`event`, `callback`): `void`

**`Example`**

```js
measurementTool.off('disposed', onMeasurementDispose);
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"disposed"`` |
| `callback` | [`DisposedDelegate`](../modules/cognite_reveal.md#disposeddelegate) |

#### Returns

`void`

#### Overrides

[Cognite3DViewerToolBase](cognite_reveal_tools.Cognite3DViewerToolBase.md).[off](cognite_reveal_tools.Cognite3DViewerToolBase.md#off)

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:179](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L179)

▸ **off**(`event`, `callback`): `void`

**`Example`**

```js
measurementTool.off('added', onMeasurementAdded);
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"added"`` |
| `callback` | [`MeasurementAddedDelegate`](../modules/cognite_reveal_tools.md#measurementaddeddelegate) |

#### Returns

`void`

#### Overrides

Cognite3DViewerToolBase.off

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:187](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L187)

▸ **off**(`event`, `callback`): `void`

**`Example`**

```js
measurementTool.off('started', onMeasurementStarted);
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"started"`` |
| `callback` | [`MeasurementStartedDelegate`](../modules/cognite_reveal_tools.md#measurementstarteddelegate) |

#### Returns

`void`

#### Overrides

Cognite3DViewerToolBase.off

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:195](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L195)

▸ **off**(`event`, `callback`): `void`

**`Example`**

```js
measurementTool.off('ended', onMeasurementEnded);
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"ended"`` |
| `callback` | [`MeasurementEndedDelegate`](../modules/cognite_reveal_tools.md#measurementendeddelegate) |

#### Returns

`void`

#### Overrides

Cognite3DViewerToolBase.off

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:203](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L203)

___

### on

▸ **on**(`event`, `callback`): `void`

Triggered when the tool is disposed. Listeners should clean up any
resources held and remove the reference to the tool.

**`Example`**

```js
measurementTool.on('disposed', onMeasurementDispose);
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"disposed"`` |
| `callback` | [`DisposedDelegate`](../modules/cognite_reveal.md#disposeddelegate) |

#### Returns

`void`

#### Overrides

Cognite3DViewerToolBase.on

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:117](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L117)

▸ **on**(`event`, `callback`): `void`

Triggered when a measurement is added into the Cognite3DViewer.

**`Example`**

```js
measurementTool.on('added', onMeasurementAdded);
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"added"`` |
| `callback` | [`MeasurementAddedDelegate`](../modules/cognite_reveal_tools.md#measurementaddeddelegate) |

#### Returns

`void`

#### Overrides

Cognite3DViewerToolBase.on

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:126](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L126)

▸ **on**(`event`, `callback`): `void`

Triggered when a measurement mode is started.

**`Example`**

```js
measurementTool.on('started', onMeasurementStarted);
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"started"`` |
| `callback` | [`MeasurementStartedDelegate`](../modules/cognite_reveal_tools.md#measurementstarteddelegate) |

#### Returns

`void`

#### Overrides

Cognite3DViewerToolBase.on

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:135](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L135)

▸ **on**(`event`, `callback`): `void`

Triggered when measurement mode is ended.

**`Example`**

```js
measurementTool.on('ended', onMeasurementEnded);
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"ended"`` |
| `callback` | [`MeasurementEndedDelegate`](../modules/cognite_reveal_tools.md#measurementendeddelegate) |

#### Returns

`void`

#### Overrides

Cognite3DViewerToolBase.on

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:144](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L144)

___

### removeAllMeasurements

▸ **removeAllMeasurements**(): `void`

Removes all measurements from the Cognite3DViewer.

#### Returns

`void`

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:279](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L279)

___

### removeMeasurement

▸ **removeMeasurement**(`measurement`): `void`

Removes a measurement from the Cognite3DViewer.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `measurement` | [`Measurement`](../modules/cognite_reveal_tools.md#measurement) | Measurement to be removed from Cognite3DViewer. |

#### Returns

`void`

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:264](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L264)

___

### setLineOptions

▸ **setLineOptions**(`options`): `void`

Sets Measurement line width, color and label units value for the next measurment.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`MeasurementOptions`](../modules/cognite_reveal_tools.md#measurementoptions) | MeasurementOptions to set line width, color and callback for custom operation on measurement labels. |

#### Returns

`void`

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:303](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L303)

___

### setMeasurementLabelsVisible

▸ **setMeasurementLabelsVisible**(`enable`): `void`

Sets the visiblity of labels in the Measurement.

#### Parameters

| Name | Type |
| :------ | :------ |
| `enable` | `boolean` |

#### Returns

`void`

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:292](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L292)

___

### updateLineColor

▸ **updateLineColor**(`measurement`, `color`): `void`

Update selected line color.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `measurement` | [`Measurement`](../modules/cognite_reveal_tools.md#measurement) | Measurement to be updated. |
| `color` | `Color` | Color of the measuring line. |

#### Returns

`void`

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:331](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L331)

___

### updateLineWidth

▸ **updateLineWidth**(`measurement`, `lineWidth`): `void`

Update selected line width.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `measurement` | [`Measurement`](../modules/cognite_reveal_tools.md#measurement) | Measurement to be updated. |
| `lineWidth` | `number` | Width of the measuring line. |

#### Returns

`void`

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:315](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L315)

___

### visible

▸ **visible**(`enable`): `void`

Hide/unhide all measurements

#### Parameters

| Name | Type |
| :------ | :------ |
| `enable` | `boolean` |

#### Returns

`void`

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:354](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L354)
