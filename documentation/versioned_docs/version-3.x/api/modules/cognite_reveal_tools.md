---
id: "cognite_reveal_tools"
title: "Module: @cognite/reveal/tools"
sidebar_label: "@cognite/reveal/tools"
sidebar_position: 0
custom_edit_url: null
---

## Enumerations

- [BingMapImageFormat](../enums/cognite_reveal_tools.BingMapImageFormat.md)
- [BingMapType](../enums/cognite_reveal_tools.BingMapType.md)
- [Corner](../enums/cognite_reveal_tools.Corner.md)
- [HereMapImageFormat](../enums/cognite_reveal_tools.HereMapImageFormat.md)
- [HereMapScheme](../enums/cognite_reveal_tools.HereMapScheme.md)
- [HereMapType](../enums/cognite_reveal_tools.HereMapType.md)
- [MapProviders](../enums/cognite_reveal_tools.MapProviders.md)
- [MapboxImageFormat](../enums/cognite_reveal_tools.MapboxImageFormat.md)
- [MapboxMode](../enums/cognite_reveal_tools.MapboxMode.md)
- [MapboxStyle](../enums/cognite_reveal_tools.MapboxStyle.md)

## Classes

- [AxisViewTool](../classes/cognite_reveal_tools.AxisViewTool.md)
- [Cognite3DViewerToolBase](../classes/cognite_reveal_tools.Cognite3DViewerToolBase.md)
- [DebugCameraTool](../classes/cognite_reveal_tools.DebugCameraTool.md)
- [DebugLoadedSectorsTool](../classes/cognite_reveal_tools.DebugLoadedSectorsTool.md)
- [ExplodedViewTool](../classes/cognite_reveal_tools.ExplodedViewTool.md)
- [GeomapTool](../classes/cognite_reveal_tools.GeomapTool.md)
- [HtmlOverlayTool](../classes/cognite_reveal_tools.HtmlOverlayTool.md)
- [Keyframe](../classes/cognite_reveal_tools.Keyframe.md)
- [MeasurementTool](../classes/cognite_reveal_tools.MeasurementTool.md)
- [TimelineTool](../classes/cognite_reveal_tools.TimelineTool.md)

## Type Aliases

### AbsolutePosition

Ƭ **AbsolutePosition**: `Object`

Absolute position in pixels.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `xAbsolute` | `number` |
| `yAbsolute` | `number` |

#### Defined in

[packages/tools/src/AxisView/types.ts:47](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/AxisView/types.ts#L47)

___

### AxisBoxCompassConfig

Ƭ **AxisBoxCompassConfig**: `Object`

Configuration of the compass.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `fontColor?` | `THREE.Color` | - |
| `fontSize?` | `number` | - |
| `labelDelta?` | `number` | Offset in radians of the orientation indicator. |
| `ringLabel?` | `string` | Label of the orientation indicator. Defaults to 'N' for north. |
| `tickColor?` | `THREE.Color` | - |

#### Defined in

[packages/tools/src/AxisView/types.ts:79](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/AxisView/types.ts#L79)

___

### AxisBoxConfig

Ƭ **AxisBoxConfig**: `Object`

Configuration of [AxisViewTool](../classes/cognite_reveal_tools.AxisViewTool.md).

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `animationSpeed?` | `number` | How long the camera animation lasts when clicking a face of the orientation box. |
| `compass?` | [`AxisBoxCompassConfig`](cognite_reveal_tools.md#axisboxcompassconfig) | Configuration of the compass "base" of the tool. |
| `faces?` | \{ `xNegativeFace?`: [`AxisBoxFaceConfig`](cognite_reveal_tools.md#axisboxfaceconfig) ; `xPositiveFace?`: [`AxisBoxFaceConfig`](cognite_reveal_tools.md#axisboxfaceconfig) ; `yNegativeFace?`: [`AxisBoxFaceConfig`](cognite_reveal_tools.md#axisboxfaceconfig) ; `yPositiveFace?`: [`AxisBoxFaceConfig`](cognite_reveal_tools.md#axisboxfaceconfig) ; `zNegativeFace?`: [`AxisBoxFaceConfig`](cognite_reveal_tools.md#axisboxfaceconfig) ; `zPositiveFace?`: [`AxisBoxFaceConfig`](cognite_reveal_tools.md#axisboxfaceconfig)  } | Configuration for each of the faces of the orientation box. Note that Reveal uses a right-handed Y up coordinate system, which might differ from the original model space. To account for this, you might want to reassign labels of the faces. |
| `faces.xNegativeFace?` | [`AxisBoxFaceConfig`](cognite_reveal_tools.md#axisboxfaceconfig) | - |
| `faces.xPositiveFace?` | [`AxisBoxFaceConfig`](cognite_reveal_tools.md#axisboxfaceconfig) | - |
| `faces.yNegativeFace?` | [`AxisBoxFaceConfig`](cognite_reveal_tools.md#axisboxfaceconfig) | - |
| `faces.yPositiveFace?` | [`AxisBoxFaceConfig`](cognite_reveal_tools.md#axisboxfaceconfig) | - |
| `faces.zNegativeFace?` | [`AxisBoxFaceConfig`](cognite_reveal_tools.md#axisboxfaceconfig) | - |
| `faces.zPositiveFace?` | [`AxisBoxFaceConfig`](cognite_reveal_tools.md#axisboxfaceconfig) | - |
| `position?` | [`AbsolutePosition`](cognite_reveal_tools.md#absoluteposition) \| [`RelativePosition`](cognite_reveal_tools.md#relativeposition) | Position, either absolute or relative. |
| `size?` | `number` | Size in pixels of the axis tool. |

#### Defined in

[packages/tools/src/AxisView/types.ts:10](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/AxisView/types.ts#L10)

___

### AxisBoxFaceConfig

Ƭ **AxisBoxFaceConfig**: `Object`

Configuration of each face of the orientation box.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `faceColor?` | `THREE.Color` | - |
| `fontColor?` | `THREE.Color` | - |
| `fontSize?` | `number` | - |
| `label?` | `string` | Label of the respective face, e.g. 'X' or 'Right'. |
| `outlineColor?` | `THREE.Color` | - |
| `outlineSize?` | `number` | - |

#### Defined in

[packages/tools/src/AxisView/types.ts:64](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/AxisView/types.ts#L64)

___

### BingMapConfig

Ƭ **BingMapConfig**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `APIKey` | `string` | Bing Map API Key |
| `provider` | [`BingMap`](../enums/cognite_reveal_tools.MapProviders.md#bingmap) | - |
| `type?` | [`BingMapType`](../enums/cognite_reveal_tools.BingMapType.md) | The type of the map used. |

#### Defined in

[packages/tools/src/Geomap/MapConfig.ts:121](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Geomap/MapConfig.ts#L121)

___

### DebugLoadedSectorsToolOptions

Ƭ **DebugLoadedSectorsToolOptions**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `colorBy?` | ``"depth"`` \| ``"lod"`` \| ``"loadedTimestamp"`` \| ``"drawcalls"`` \| ``"random"`` |
| `leafsOnly?` | `boolean` |
| `sectorPathFilterRegex?` | `string` |
| `showDetailedSectors?` | `boolean` |
| `showDiscardedSectors?` | `boolean` |
| `showSimpleSectors?` | `boolean` |

#### Defined in

[packages/tools/src/DebugLoadedSectorsTool.ts:13](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/DebugLoadedSectorsTool.ts#L13)

___

### HereMapConfig

Ƭ **HereMapConfig**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `APIKey` | `string` | Here map API Key |
| `appCode?` | `string` | Service application code token. |
| `imageFormat?` | [`HereMapImageFormat`](../enums/cognite_reveal_tools.HereMapImageFormat.md) | Map image tile format |
| `provider` | [`HereMap`](../enums/cognite_reveal_tools.MapProviders.md#heremap) | - |
| `scheme?` | `string` | Specifies the view scheme |
| `size?` | `number` | Returned tile map image size. The following sizes are supported: - 256 - 512 - 128 (deprecated, although usage is still accepted) |
| `style?` | [`HereMapType`](../enums/cognite_reveal_tools.HereMapType.md) | The type of maps to be used. |

#### Defined in

[packages/tools/src/Geomap/MapConfig.ts:133](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Geomap/MapConfig.ts#L133)

___

### HtmlOverlayCreateClusterDelegate

Ƭ **HtmlOverlayCreateClusterDelegate**: (`overlayElements`: \{ `htmlElement`: `HTMLElement` ; `userData`: `any`  }[]) => `HTMLElement`

#### Type declaration

▸ (`overlayElements`): `HTMLElement`

Callback that is triggered when a set of overlays are clustered together in
[HtmlOverlayTool](../classes/cognite_reveal_tools.HtmlOverlayTool.md).

##### Parameters

| Name | Type |
| :------ | :------ |
| `overlayElements` | \{ `htmlElement`: `HTMLElement` ; `userData`: `any`  }[] |

##### Returns

`HTMLElement`

#### Defined in

[packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:32](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L32)

___

### HtmlOverlayOptions

Ƭ **HtmlOverlayOptions**: `Object`

Options for an overlay added using [HtmlOverlayTool.add](../classes/cognite_reveal_tools.HtmlOverlayTool.md#add).

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `positionUpdatedCallback?` | [`HtmlOverlayPositionUpdatedDelegate`](cognite_reveal_tools.md#htmloverlaypositionupdateddelegate) | Callback that is triggered whenever the position of the overlay is updated. Optional. |
| `userData?` | `any` | Optional user specified data that is provided to the [HtmlOverlayCreateClusterDelegate](cognite_reveal_tools.md#htmloverlaycreateclusterdelegate) and [HtmlOverlayPositionUpdatedDelegate](cognite_reveal_tools.md#htmloverlaypositionupdateddelegate). |

#### Defined in

[packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:42](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L42)

___

### HtmlOverlayPositionUpdatedDelegate

Ƭ **HtmlOverlayPositionUpdatedDelegate**: (`element`: `HTMLElement`, `position2D`: `THREE.Vector2`, `position3D`: `THREE.Vector3`, `distanceToCamera`: `number`, `userData`: `any`) => `void`

#### Type declaration

▸ (`element`, `position2D`, `position3D`, `distanceToCamera`, `userData`): `void`

Callback that is triggered whenever the 2D position of an overlay is updated
in [HtmlOverlayTool](../classes/cognite_reveal_tools.HtmlOverlayTool.md).

##### Parameters

| Name | Type |
| :------ | :------ |
| `element` | `HTMLElement` |
| `position2D` | `THREE.Vector2` |
| `position3D` | `THREE.Vector3` |
| `distanceToCamera` | `number` |
| `userData` | `any` |

##### Returns

`void`

#### Defined in

[packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:20](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L20)

___

### MapConfig

Ƭ **MapConfig**: \{ `latlong`: `LatLongPosition`  } & [`BingMapConfig`](cognite_reveal_tools.md#bingmapconfig) \| [`HereMapConfig`](cognite_reveal_tools.md#heremapconfig) \| [`MapboxConfig`](cognite_reveal_tools.md#mapboxconfig) \| `OpenStreetMapConfig`

Maps Configuration of [GeomapTool](../classes/cognite_reveal_tools.GeomapTool.md).

#### Defined in

[packages/tools/src/Geomap/MapConfig.ts:198](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Geomap/MapConfig.ts#L198)

___

### MapboxConfig

Ƭ **MapboxConfig**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `APIKey` | `string` | Mapbox API Key |
| `id` | `string` | Map style or map ID if the mode is set to MAP_ID |
| `mode?` | [`MapboxMode`](../enums/cognite_reveal_tools.MapboxMode.md) | Map tile access mode - MapboxMode.STYLE - MapboxMode.MAP_ID |
| `provider` | [`MapboxMap`](../enums/cognite_reveal_tools.MapProviders.md#mapboxmap) | - |
| `tileFormat?` | [`MapboxImageFormat`](../enums/cognite_reveal_tools.MapboxImageFormat.md) | Map image tile format |
| `useHDPI?` | `boolean` | Flag to indicate if should use high resolution tiles |

#### Defined in

[packages/tools/src/Geomap/MapConfig.ts:169](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Geomap/MapConfig.ts#L169)

___

### Measurement

Ƭ **Measurement**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `distanceInMeters` | `number` |
| `endPoint` | `THREE.Vector3` |
| `measurementId` | `number` |
| `startPoint` | `THREE.Vector3` |

#### Defined in

[packages/tools/src/Measurement/MeasurementManager.ts:11](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Measurement/MeasurementManager.ts#L11)

___

### MeasurementAddedDelegate

Ƭ **MeasurementAddedDelegate**: (`event`: \{ `distanceInMeters`: `number` ; `endPoint`: `THREE.Vector3` ; `measurementId`: `number` ; `startPoint`: `THREE.Vector3`  }) => `void`

#### Type declaration

▸ (`event`): `void`

Delegate for measurement added events.

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `Object` |
| `event.distanceInMeters` | `number` |
| `event.endPoint` | `THREE.Vector3` |
| `event.measurementId` | `number` |
| `event.startPoint` | `THREE.Vector3` |

##### Returns

`void`

#### Defined in

[packages/tools/src/Measurement/types.ts:13](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Measurement/types.ts#L13)

___

### MeasurementEndedDelegate

Ƭ **MeasurementEndedDelegate**: () => `void`

#### Type declaration

▸ (): `void`

Delegate for measurement ended events.

##### Returns

`void`

#### Defined in

[packages/tools/src/Measurement/types.ts:28](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Measurement/types.ts#L28)

___

### MeasurementOptions

Ƭ **MeasurementOptions**: `Object`

Measurement tool option with user custom callback, line width & color.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `color?` | `THREE.Color` | Line color in 32 bit hex. |
| `distanceToLabelCallback?` | `DistanceToLabelDelegate` | - |
| `lineWidth?` | `number` | Line width in cm. Note that the minium drawn line will be ~2 pixels. |

#### Defined in

[packages/tools/src/Measurement/types.ts:33](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Measurement/types.ts#L33)

___

### MeasurementStartedDelegate

Ƭ **MeasurementStartedDelegate**: () => `void`

#### Type declaration

▸ (): `void`

Delegate for measurement started events.

##### Returns

`void`

#### Defined in

[packages/tools/src/Measurement/types.ts:23](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Measurement/types.ts#L23)

___

### RelativePosition

Ƭ **RelativePosition**: `Object`

Relative position from a corner of the viewer
and a given padding.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `corner` | [`Corner`](../enums/cognite_reveal_tools.Corner.md) |
| `padding` | `THREE.Vector2` |

#### Defined in

[packages/tools/src/AxisView/types.ts:56](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/AxisView/types.ts#L56)

___

### TimelineDateUpdateDelegate

Ƭ **TimelineDateUpdateDelegate**: (`event`: \{ `activeKeyframe`: [`Keyframe`](../classes/cognite_reveal_tools.Keyframe.md) \| `undefined` ; `date`: `Date` ; `endDate`: `Date` ; `startDate`: `Date`  }) => `void`

#### Type declaration

▸ (`event`): `void`

Delegate for Timeline Date update

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `Object` |
| `event.activeKeyframe` | [`Keyframe`](../classes/cognite_reveal_tools.Keyframe.md) \| `undefined` |
| `event.date` | `Date` |
| `event.endDate` | `Date` |
| `event.startDate` | `Date` |

##### Returns

`void`

#### Defined in

[packages/tools/src/Timeline/types.ts:8](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Timeline/types.ts#L8)
