---
id: "cognite_reveal_tools"
title: "Module: @cognite/reveal/tools"
sidebar_label: "@cognite/reveal/tools"
sidebar_position: 0
custom_edit_url: null
---

## Enumerations

- [Corner](../enums/cognite_reveal_tools.Corner.md)

## Classes

- [AxisViewTool](../classes/cognite_reveal_tools.AxisViewTool.md)
- [Cognite3DViewerToolBase](../classes/cognite_reveal_tools.Cognite3DViewerToolBase.md)
- [DebugCameraTool](../classes/cognite_reveal_tools.DebugCameraTool.md)
- [HtmlOverlayTool](../classes/cognite_reveal_tools.HtmlOverlayTool.md)
- [Keyframe](../classes/cognite_reveal_tools.Keyframe.md)
- [MeasurementTool](../classes/cognite_reveal_tools.MeasurementTool.md)
- [SmartOverlayTool](../classes/cognite_reveal_tools.SmartOverlayTool.md)
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

[packages/tools/src/AxisView/types.ts:48](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/AxisView/types.ts#L48)

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

[packages/tools/src/AxisView/types.ts:80](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/AxisView/types.ts#L80)

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

[packages/tools/src/AxisView/types.ts:11](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/AxisView/types.ts#L11)

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

[packages/tools/src/AxisView/types.ts:65](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/AxisView/types.ts#L65)

___

### DistanceToLabelDelegate

Ƭ **DistanceToLabelDelegate**: (`distanceInMeters`: `number`) => `string`

#### Type declaration

▸ (`distanceInMeters`): `string`

Custom callback for users to change measurement label content.

##### Parameters

| Name | Type |
| :------ | :------ |
| `distanceInMeters` | `number` |

##### Returns

`string`

#### Defined in

[packages/tools/src/Measurement/types.ts:8](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/Measurement/types.ts#L8)

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

[packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:32](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L32)

___

### HtmlOverlayOptions

Ƭ **HtmlOverlayOptions**: `Object`

Options for an overlay added using [add](../classes/cognite_reveal_tools.HtmlOverlayTool.md#add).

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `positionUpdatedCallback?` | [`HtmlOverlayPositionUpdatedDelegate`](cognite_reveal_tools.md#htmloverlaypositionupdateddelegate) | Callback that is triggered whenever the position of the overlay is updated. Optional. |
| `userData?` | `any` | Optional user specified data that is provided to the [HtmlOverlayCreateClusterDelegate](cognite_reveal_tools.md#htmloverlaycreateclusterdelegate) and [HtmlOverlayPositionUpdatedDelegate](cognite_reveal_tools.md#htmloverlaypositionupdateddelegate). |

#### Defined in

[packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:42](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L42)

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

[packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:20](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L20)

___

### HtmlOverlayToolClusteringOptions

Ƭ **HtmlOverlayToolClusteringOptions**: `Object`

Controls how close overlay elements are clustered together.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `createClusterElementCallback` | [`HtmlOverlayCreateClusterDelegate`](cognite_reveal_tools.md#htmloverlaycreateclusterdelegate) | Callback that is triggered when a set of overlays are clustered together to create a "composite" element as a placeholder for the clustered elements. Note that this callback will be triggered every frame for each cluster so it must be performant. |
| `mode` | ``"overlapInScreenSpace"`` | Currently only 'overlapInScreenSpace' is supported. In this mode, overlays are clustered together into a single element as defined by the [createClusterElementCallback](cognite_reveal_tools.md#createclusterelementcallback) and hidden when they overlap in screen space. The composite element is placed at the midpoint of all clustered elements. Clustered elements are faded in/out using CSS styling `transition`, `opacity` and `visibility`. |

#### Defined in

[packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:57](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L57)

___

### HtmlOverlayToolOptions

Ƭ **HtmlOverlayToolOptions**: `Object`

Options for the visualization of overlays

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `clusteringOptions?` | [`HtmlOverlayToolClusteringOptions`](cognite_reveal_tools.md#htmloverlaytoolclusteringoptions) | Options for clustering the HTML overlays |

#### Defined in

[packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:82](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L82)

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

[packages/tools/src/Measurement/MeasurementManager.ts:11](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/Measurement/MeasurementManager.ts#L11)

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

[packages/tools/src/Measurement/types.ts:13](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/Measurement/types.ts#L13)

___

### MeasurementEndedDelegate

Ƭ **MeasurementEndedDelegate**: () => `void`

#### Type declaration

▸ (): `void`

Delegate for measurement ended events.

##### Returns

`void`

#### Defined in

[packages/tools/src/Measurement/types.ts:28](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/Measurement/types.ts#L28)

___

### MeasurementOptions

Ƭ **MeasurementOptions**: `Object`

Measurement tool option with user custom callback, line width & color.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `color?` | `THREE.Color` | Line color in 32 bit hex. |
| `distanceToLabelCallback?` | [`DistanceToLabelDelegate`](cognite_reveal_tools.md#distancetolabeldelegate) | - |
| `lineWidth?` | `number` | Line width in cm. Note that the minium drawn line will be ~2 pixels. |

#### Defined in

[packages/tools/src/Measurement/types.ts:33](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/Measurement/types.ts#L33)

___

### MeasurementStartedDelegate

Ƭ **MeasurementStartedDelegate**: () => `void`

#### Type declaration

▸ (): `void`

Delegate for measurement started events.

##### Returns

`void`

#### Defined in

[packages/tools/src/Measurement/types.ts:23](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/Measurement/types.ts#L23)

___

### OverlayEventHandler

Ƭ **OverlayEventHandler**\<`MetadataType`\>: (`event`: \{ `htmlOverlay`: `HTMLElement` ; `mousePosition`: \{ `clientX`: `number` ; `clientY`: `number`  } ; `targetOverlay`: [`Overlay3D`](../interfaces/cognite_reveal.Overlay3D.md)\<`MetadataType`\>  }) => `void`

#### Type parameters

| Name |
| :------ |
| `MetadataType` |

#### Type declaration

▸ (`event`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `Object` |
| `event.htmlOverlay` | `HTMLElement` |
| `event.mousePosition` | `Object` |
| `event.mousePosition.clientX` | `number` |
| `event.mousePosition.clientY` | `number` |
| `event.targetOverlay` | [`Overlay3D`](../interfaces/cognite_reveal.Overlay3D.md)\<`MetadataType`\> |

##### Returns

`void`

#### Defined in

[packages/tools/src/SmartOverlay/SmartOverlayTool.ts:19](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/SmartOverlay/SmartOverlayTool.ts#L19)

___

### OverlayToolEvent

Ƭ **OverlayToolEvent**: ``"hover"`` \| ``"click"`` \| ``"disposed"``

#### Defined in

[packages/tools/src/SmartOverlay/SmartOverlayTool.ts:17](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/SmartOverlay/SmartOverlayTool.ts#L17)

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

[packages/tools/src/AxisView/types.ts:57](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/AxisView/types.ts#L57)

___

### SmartOverlayToolParameters

Ƭ **SmartOverlayToolParameters**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `defaultOverlayColor` | `THREE.Color` | Sets default overlay color for newly added labels. |
| `maxPointSize?` | `number` | Max point markers size in pixels. Different platforms has limitations for this value. On Android and MacOS in Chrome maximum is 64. Windows in Chrome and MacOS Safari desktops can support up to 500. Default is 64. |

#### Defined in

[packages/tools/src/SmartOverlay/SmartOverlayTool.ts:25](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/SmartOverlay/SmartOverlayTool.ts#L25)

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

[packages/tools/src/Timeline/types.ts:8](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/Timeline/types.ts#L8)
