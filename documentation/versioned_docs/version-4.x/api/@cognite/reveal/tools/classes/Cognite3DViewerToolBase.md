# Class: `abstract` Cognite3DViewerToolBase

Base class for tools attaching to a [Cognite3DViewer](../../classes/Cognite3DViewer.md).

## Extended by

- [`HtmlOverlayTool`](HtmlOverlayTool.md)
- [`DebugCameraTool`](DebugCameraTool.md)
- [`AxisViewTool`](AxisViewTool.md)
- [`AxisGizmoTool`](AxisGizmoTool.md)
- [`Overlay3DTool`](Overlay3DTool.md)
- [`TimelineTool`](TimelineTool.md)
- [`MeasurementTool`](MeasurementTool.md)

## Constructors

### new Cognite3DViewerToolBase()

> **new Cognite3DViewerToolBase**(): [`Cognite3DViewerToolBase`](Cognite3DViewerToolBase.md)

#### Returns

[`Cognite3DViewerToolBase`](Cognite3DViewerToolBase.md)

## Methods

### dispose()

> **dispose**(): `void`

Disposes the element and triggeres the 'disposed' event before clearing the list
of dipose-listeners.

#### Returns

`void`

#### Defined in

[packages/tools/src/Cognite3DViewerToolBase.ts:53](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/tools/src/Cognite3DViewerToolBase.ts#L53)

***

### off()

> **off**(`event`, `handler`): `void`

Unregisters an event handler for the 'disposed'-event.

#### Parameters

• **event**: `"disposed"`

• **handler**

#### Returns

`void`

#### Defined in

[packages/tools/src/Cognite3DViewerToolBase.ts:38](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/tools/src/Cognite3DViewerToolBase.ts#L38)
