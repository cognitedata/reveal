# Class: MeasurementTool

Enables [Cognite3DViewer](../../classes/Cognite3DViewer.md) to perform a point to point measurement.
This can be achieved by selecting a point on the 3D Object and drag the pointer to
required point to get measurement of the distance.
The tools default measurement is in "Meters" as supported in Reveal, but it also provides
user to customise the measuring units based on their convinience with the callback.

## Examples

```js
const measurementTool = new MeasurementTool(viewer);
measurementTool.enterMeasurementMode();
// ...
measurementTool.exitMeasurementMode();

// detach the tool from the viewer
measurementTool.dispose();
```

```js
const measurementTool = new MeasurementTool(viewer, {distanceToLabelCallback: (distanceInMeters) => {
   // 1 meters = 3.281 feet
   const distancesInFeet = distanceInMeters * 3.281;
   return { distanceInMeters: distancesInFeet, units: 'ft'};
 }});
 measurementTool.enterMeasurementMode();
```

## Extends

- [`Cognite3DViewerToolBase`](Cognite3DViewerToolBase.md)

## Constructors

### new MeasurementTool()

> **new MeasurementTool**(`viewer`, `options`?): [`MeasurementTool`](MeasurementTool.md)

#### Parameters

• **viewer**: [`Cognite3DViewer`](../../classes/Cognite3DViewer.md)

• **options?**: [`MeasurementOptions`](../type-aliases/MeasurementOptions.md)

#### Returns

[`MeasurementTool`](MeasurementTool.md)

#### Overrides

[`Cognite3DViewerToolBase`](Cognite3DViewerToolBase.md) . [`constructor`](Cognite3DViewerToolBase.md#constructors)

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:93](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L93)

## Accessors

### isInMeasurementMode

> `get` **isInMeasurementMode**(): `boolean`

Returns measurement mode state, is measurement mode started or ended.

#### Returns

`boolean`

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:56](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L56)

## Methods

### addMeasurement()

> **addMeasurement**(`startPoint`, `endPoint`): [`Measurement`](../type-aliases/Measurement.md)

Adds a measurement directly. E.g. to restore a previous state programatically

#### Parameters

• **startPoint**: `Vector3`

• **endPoint**: `Vector3`

#### Returns

[`Measurement`](../type-aliases/Measurement.md)

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:288](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L288)

***

### dispose()

> **dispose**(): `void`

Dispose Measurement Tool.

#### Returns

`void`

#### Overrides

[`Cognite3DViewerToolBase`](Cognite3DViewerToolBase.md) . [`dispose`](Cognite3DViewerToolBase.md#dispose)

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:396](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L396)

***

### enterMeasurementMode()

> **enterMeasurementMode**(): `void`

Enter into point to point measurement mode.

#### Returns

`void`

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:237](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L237)

***

### exitMeasurementMode()

> **exitMeasurementMode**(): `void`

Exit measurement mode.

#### Returns

`void`

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:255](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L255)

***

### getAllMeasurements()

> **getAllMeasurements**(): [`Measurement`](../type-aliases/Measurement.md)[]

Get all measurements from [Cognite3DViewer](../../classes/Cognite3DViewer.md).

#### Returns

[`Measurement`](../type-aliases/Measurement.md)[]

Array of Measurements containing Id, start point, end point & measured distance.

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:375](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L375)

***

### off()

Unsubscribe to the Measurement event

#### Param

`MeasurementEvents` event

#### Param

Callback to measurements events

#### off(event, callback)

> **off**(`event`, `callback`): `void`

##### Parameters

• **event**: `"disposed"`

• **callback**: [`DisposedDelegate`](../../type-aliases/DisposedDelegate.md)

##### Returns

`void`

##### Overrides

[`Cognite3DViewerToolBase`](Cognite3DViewerToolBase.md) . [`off`](Cognite3DViewerToolBase.md#off)

##### Example

```js
measurementTool.off('disposed', onMeasurementDispose);
```

##### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:181](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L181)

#### off(event, callback)

> **off**(`event`, `callback`): `void`

##### Parameters

• **event**: `"added"`

• **callback**: [`MeasurementAddedDelegate`](../type-aliases/MeasurementAddedDelegate.md)

##### Returns

`void`

##### Overrides

`Cognite3DViewerToolBase.off`

##### Example

```js
measurementTool.off('added', onMeasurementAdded);
```

##### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:189](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L189)

#### off(event, callback)

> **off**(`event`, `callback`): `void`

##### Parameters

• **event**: `"started"`

• **callback**: [`MeasurementStartedDelegate`](../type-aliases/MeasurementStartedDelegate.md)

##### Returns

`void`

##### Overrides

`Cognite3DViewerToolBase.off`

##### Example

```js
measurementTool.off('started', onMeasurementStarted);
```

##### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:197](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L197)

#### off(event, callback)

> **off**(`event`, `callback`): `void`

##### Parameters

• **event**: `"ended"`

• **callback**: [`MeasurementEndedDelegate`](../type-aliases/MeasurementEndedDelegate.md)

##### Returns

`void`

##### Overrides

`Cognite3DViewerToolBase.off`

##### Example

```js
measurementTool.off('ended', onMeasurementEnded);
```

##### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:205](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L205)

***

### on()

Subscribe to the Measurement events

#### Param

`MeasurementEvents` event

#### Param

Callback to measurements events

#### on(event, callback)

> **on**(`event`, `callback`): `void`

Triggered when the tool is disposed. Listeners should clean up any
resources held and remove the reference to the tool.

##### Parameters

• **event**: `"disposed"`

• **callback**: [`DisposedDelegate`](../../type-aliases/DisposedDelegate.md)

##### Returns

`void`

##### Overrides

`Cognite3DViewerToolBase.on`

##### Example

```js
measurementTool.on('disposed', onMeasurementDispose);
```

##### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:119](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L119)

#### on(event, callback)

> **on**(`event`, `callback`): `void`

Triggered when a measurement is added into the Cognite3DViewer.

##### Parameters

• **event**: `"added"`

• **callback**: [`MeasurementAddedDelegate`](../type-aliases/MeasurementAddedDelegate.md)

##### Returns

`void`

##### Overrides

`Cognite3DViewerToolBase.on`

##### Example

```js
measurementTool.on('added', onMeasurementAdded);
```

##### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:128](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L128)

#### on(event, callback)

> **on**(`event`, `callback`): `void`

Triggered when a measurement mode is started.

##### Parameters

• **event**: `"started"`

• **callback**: [`MeasurementStartedDelegate`](../type-aliases/MeasurementStartedDelegate.md)

##### Returns

`void`

##### Overrides

`Cognite3DViewerToolBase.on`

##### Example

```js
measurementTool.on('started', onMeasurementStarted);
```

##### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:137](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L137)

#### on(event, callback)

> **on**(`event`, `callback`): `void`

Triggered when measurement mode is ended.

##### Parameters

• **event**: `"ended"`

• **callback**: [`MeasurementEndedDelegate`](../type-aliases/MeasurementEndedDelegate.md)

##### Returns

`void`

##### Overrides

`Cognite3DViewerToolBase.on`

##### Example

```js
measurementTool.on('ended', onMeasurementEnded);
```

##### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:146](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L146)

***

### removeAllMeasurements()

> **removeAllMeasurements**(): `void`

Removes all measurements from the Cognite3DViewer.

#### Returns

`void`

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:308](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L308)

***

### removeMeasurement()

> **removeMeasurement**(`measurement`): `void`

Removes a measurement from the Cognite3DViewer.

#### Parameters

• **measurement**: [`Measurement`](../type-aliases/Measurement.md)

Measurement to be removed from Cognite3DViewer.

#### Returns

`void`

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:273](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L273)

***

### setLineOptions()

> **setLineOptions**(`options`): `void`

Sets Measurement line width, color and label units value for the next measurment.

#### Parameters

• **options**: [`MeasurementOptions`](../type-aliases/MeasurementOptions.md)

MeasurementOptions to set line width, color and callback for custom operation on measurement labels.

#### Returns

`void`

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:332](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L332)

***

### setMeasurementLabelsVisible()

> **setMeasurementLabelsVisible**(`enable`): `void`

Sets the visiblity of labels in the Measurement.

#### Parameters

• **enable**: `boolean`

#### Returns

`void`

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:321](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L321)

***

### updateLineColor()

> **updateLineColor**(`measurement`, `color`): `void`

Update selected line color.

#### Parameters

• **measurement**: [`Measurement`](../type-aliases/Measurement.md)

Measurement to be updated.

• **color**: `Color`

Color of the measuring line.

#### Returns

`void`

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:360](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L360)

***

### updateLineWidth()

> **updateLineWidth**(`measurement`, `lineWidth`): `void`

Update selected line width.

#### Parameters

• **measurement**: [`Measurement`](../type-aliases/Measurement.md)

Measurement to be updated.

• **lineWidth**: `number`

Width of the measuring line.

#### Returns

`void`

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:344](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L344)

***

### visible()

> **visible**(`enable`): `void`

Hide/unhide all measurements

#### Parameters

• **enable**: `boolean`

#### Returns

`void`

#### Defined in

[packages/tools/src/Measurement/MeasurementTool.ts:383](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/tools/src/Measurement/MeasurementTool.ts#L383)
