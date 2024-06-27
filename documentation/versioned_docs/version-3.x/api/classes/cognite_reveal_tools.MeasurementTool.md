---
id: "cognite_reveal_tools.MeasurementTool"
title: "Class: MeasurementTool"
sidebar_label: "MeasurementTool"
custom_edit_url: null
---

[@cognite/reveal/tools](../modules/cognite_reveal_tools.md).MeasurementTool

Enables \{@see Cognite3DViewer} to perform a point to point measurement.
This can be achieved by selecting a point on the 3D Object and drag the pointer to
required point to get measurement of the distance.
The tools default measurement is in "Meters" as supported in Reveal, but it also provides
user to customise the measuring units based on their convinience with the callback.

**`example`**
```js
const measurementTool = new MeasurementTool(viewer);
measurementTool.enterMeasurementMode();
// ...
measurementTool.exitMeasurementMode();

// detach the tool from the viewer
measurementTool.dispose();
```

**`example`**
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

[packages/tools/src/Measurement/MeasurementTool.ts:87](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L87)

## Accessors

### isInMeasurementMode

• `get` **isInMeasurementMode**(): `boolean`

Returns measurement mode state, is measurement mode started or ended.

#### Returns

`boolean`

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:53](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L53)

## Methods

### dispose

▸ **dispose**(): `void`

Dispose Measurement Tool.

#### Returns

`void`

#### Overrides

[Cognite3DViewerToolBase](cognite_reveal_tools.Cognite3DViewerToolBase.md).[dispose](cognite_reveal_tools.Cognite3DViewerToolBase.md#dispose)

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:340](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L340)

___

### enterMeasurementMode

▸ **enterMeasurementMode**(): `void`

Enter into point to point measurement mode.

#### Returns

`void`

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:228](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L228)

___

### exitMeasurementMode

▸ **exitMeasurementMode**(): `void`

Exit measurement mode.

#### Returns

`void`

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:240](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L240)

___

### getAllMeasurements

▸ **getAllMeasurements**(): [`Measurement`](../modules/cognite_reveal_tools.md#measurement)[]

Get all measurements from [Cognite3DViewer](cognite_reveal.Cognite3DViewer.md).

#### Returns

[`Measurement`](../modules/cognite_reveal_tools.md#measurement)[]

Array of Measurements containing Id, start point, end point & measured distance.

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:333](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L333)

___

### off

▸ **off**(`event`, `callback`): `void`

Unsubscribe to the Measurement event

**`example`**
```js
measurementTool.off('disposed', onMeasurementDispose);
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"disposed"`` | `MeasurementEvents` event |
| `callback` | [`DisposedDelegate`](../modules/cognite_reveal.md#disposeddelegate) | Callback to measurements events |

#### Returns

`void`

#### Overrides

[Cognite3DViewerToolBase](cognite_reveal_tools.Cognite3DViewerToolBase.md).[off](cognite_reveal_tools.Cognite3DViewerToolBase.md#off)

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:172](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L172)

▸ **off**(`event`, `callback`): `void`

Unsubscribe to the Measurement event

**`example`**
```js
measurementTool.off('added', onMeasurementAdded);
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"added"`` | `MeasurementEvents` event |
| `callback` | [`MeasurementAddedDelegate`](../modules/cognite_reveal_tools.md#measurementaddeddelegate) | Callback to measurements events |

#### Returns

`void`

#### Overrides

Cognite3DViewerToolBase.off

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:180](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L180)

▸ **off**(`event`, `callback`): `void`

Unsubscribe to the Measurement event

**`example`**
```js
measurementTool.off('started', onMeasurementStarted);
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"started"`` | `MeasurementEvents` event |
| `callback` | [`MeasurementStartedDelegate`](../modules/cognite_reveal_tools.md#measurementstarteddelegate) | Callback to measurements events |

#### Returns

`void`

#### Overrides

Cognite3DViewerToolBase.off

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:188](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L188)

▸ **off**(`event`, `callback`): `void`

Unsubscribe to the Measurement event

**`example`**
```js
measurementTool.off('ended', onMeasurementEnded);
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"ended"`` | `MeasurementEvents` event |
| `callback` | [`MeasurementEndedDelegate`](../modules/cognite_reveal_tools.md#measurementendeddelegate) | Callback to measurements events |

#### Returns

`void`

#### Overrides

Cognite3DViewerToolBase.off

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:196](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L196)

___

### on

▸ **on**(`event`, `callback`): `void`

Triggered when the tool is disposed. Listeners should clean up any
resources held and remove the reference to the tool.

**`example`**
```js
measurementTool.on('disposed', onMeasurementDispose);
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"disposed"`` | `MeasurementEvents` event |
| `callback` | [`DisposedDelegate`](../modules/cognite_reveal.md#disposeddelegate) | Callback to measurements events |

#### Returns

`void`

#### Overrides

Cognite3DViewerToolBase.on

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:110](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L110)

▸ **on**(`event`, `callback`): `void`

Triggered when a measurement is added into the Cognite3DViewer.

**`example`**
```js
measurementTool.on('added', onMeasurementAdded);
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"added"`` | `MeasurementEvents` event |
| `callback` | [`MeasurementAddedDelegate`](../modules/cognite_reveal_tools.md#measurementaddeddelegate) | Callback to measurements events |

#### Returns

`void`

#### Overrides

Cognite3DViewerToolBase.on

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:119](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L119)

▸ **on**(`event`, `callback`): `void`

Triggered when a measurement mode is started.

**`example`**
```js
measurementTool.on('started', onMeasurementStarted);
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"started"`` | `MeasurementEvents` event |
| `callback` | [`MeasurementStartedDelegate`](../modules/cognite_reveal_tools.md#measurementstarteddelegate) | Callback to measurements events |

#### Returns

`void`

#### Overrides

Cognite3DViewerToolBase.on

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:128](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L128)

▸ **on**(`event`, `callback`): `void`

Triggered when measurement mode is ended.

**`example`**
```js
measurementTool.on('ended', onMeasurementEnded);
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"ended"`` | `MeasurementEvents` event |
| `callback` | [`MeasurementEndedDelegate`](../modules/cognite_reveal_tools.md#measurementendeddelegate) | Callback to measurements events |

#### Returns

`void`

#### Overrides

Cognite3DViewerToolBase.on

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:137](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L137)

___

### removeAllMeasurements

▸ **removeAllMeasurements**(): `void`

Removes all measurements from the Cognite3DViewer.

#### Returns

`void`

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:269](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L269)

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

[packages/tools/src/Measurement/MeasurementTool.ts:254](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L254)

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

[packages/tools/src/Measurement/MeasurementTool.ts:290](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L290)

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

[packages/tools/src/Measurement/MeasurementTool.ts:282](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L282)

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

[packages/tools/src/Measurement/MeasurementTool.ts:318](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L318)

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

[packages/tools/src/Measurement/MeasurementTool.ts:302](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L302)
