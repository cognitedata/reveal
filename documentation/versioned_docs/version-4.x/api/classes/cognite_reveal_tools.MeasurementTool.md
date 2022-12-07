---
id: "cognite_reveal_tools.MeasurementTool"
title: "Class: MeasurementTool"
sidebar_label: "MeasurementTool"
custom_edit_url: null
---

[@cognite/reveal/tools](../modules/cognite_reveal_tools.md).MeasurementTool

Enables Cognite3DViewer to perform a point to point measurement.
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

```jsx runnable
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

[packages/tools/src/Measurement/MeasurementTool.ts:90](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L90)

## Accessors

### isInMeasurementMode

• `get` **isInMeasurementMode**(): `boolean`

Returns measurement mode state, is measurement mode started or ended.

#### Returns

`boolean`

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:54](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L54)

## Methods

### dispose

▸ **dispose**(): `void`

Dispose Measurement Tool.

#### Returns

`void`

#### Overrides

[Cognite3DViewerToolBase](cognite_reveal_tools.Cognite3DViewerToolBase.md).[dispose](cognite_reveal_tools.Cognite3DViewerToolBase.md#dispose)

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:364](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L364)

___

### enterMeasurementMode

▸ **enterMeasurementMode**(): `void`

Enter into point to point measurement mode.

#### Returns

`void`

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:234](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L234)

___

### exitMeasurementMode

▸ **exitMeasurementMode**(): `void`

Exit measurement mode.

#### Returns

`void`

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:247](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L247)

___

### getAllMeasurements

▸ **getAllMeasurements**(): [`Measurement`](../modules/cognite_reveal_tools.md#measurement)[]

Get all measurements from Cognite3DViewer.

#### Returns

[`Measurement`](../modules/cognite_reveal_tools.md#measurement)[]

Array of Measurements containing Id, start point, end point & measured distance.

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:343](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L343)

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

[packages/tools/src/Measurement/MeasurementTool.ts:178](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L178)

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

[packages/tools/src/Measurement/MeasurementTool.ts:186](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L186)

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

[packages/tools/src/Measurement/MeasurementTool.ts:194](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L194)

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

[packages/tools/src/Measurement/MeasurementTool.ts:202](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L202)

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

[packages/tools/src/Measurement/MeasurementTool.ts:116](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L116)

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

[packages/tools/src/Measurement/MeasurementTool.ts:125](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L125)

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

[packages/tools/src/Measurement/MeasurementTool.ts:134](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L134)

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

[packages/tools/src/Measurement/MeasurementTool.ts:143](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L143)

___

### removeAllMeasurements

▸ **removeAllMeasurements**(): `void`

Removes all measurements from the Cognite3DViewer.

#### Returns

`void`

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:276](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L276)

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

[packages/tools/src/Measurement/MeasurementTool.ts:261](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L261)

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

[packages/tools/src/Measurement/MeasurementTool.ts:300](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L300)

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

[packages/tools/src/Measurement/MeasurementTool.ts:289](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L289)

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

[packages/tools/src/Measurement/MeasurementTool.ts:328](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L328)

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

[packages/tools/src/Measurement/MeasurementTool.ts:312](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L312)

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

[packages/tools/src/Measurement/MeasurementTool.ts:351](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L351)
