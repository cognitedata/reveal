---
id: "cognite_reveal_tools.Cognite3DViewerToolBase"
title: "Class: Cognite3DViewerToolBase"
sidebar_label: "Cognite3DViewerToolBase"
custom_edit_url: null
---

[@cognite/reveal/tools](../modules/cognite_reveal_tools.md).Cognite3DViewerToolBase

Base class for tools attaching to a \{@see Cognite3DViewer}.

## Hierarchy

- **`Cognite3DViewerToolBase`**

  ↳ [`HtmlOverlayTool`](cognite_reveal_tools.HtmlOverlayTool.md)

  ↳ [`ExplodedViewTool`](cognite_reveal_tools.ExplodedViewTool.md)

  ↳ [`DebugCameraTool`](cognite_reveal_tools.DebugCameraTool.md)

  ↳ [`AxisViewTool`](cognite_reveal_tools.AxisViewTool.md)

  ↳ [`GeomapTool`](cognite_reveal_tools.GeomapTool.md)

  ↳ [`TimelineTool`](cognite_reveal_tools.TimelineTool.md)

  ↳ [`DebugLoadedSectorsTool`](cognite_reveal_tools.DebugLoadedSectorsTool.md)

  ↳ [`MeasurementTool`](cognite_reveal_tools.MeasurementTool.md)

## Constructors

### constructor

• **new Cognite3DViewerToolBase**()

## Methods

### dispose

▸ **dispose**(): `void`

Disposes the element and triggeres the 'disposed' event before clearing the list
of dipose-listeners.

#### Returns

`void`

#### Defined in

[packages/tools/src/Cognite3DViewerToolBase.ts:52](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Cognite3DViewerToolBase.ts#L52)

___

### off

▸ **off**(`event`, `handler`): `void`

Unregisters an event handler for the 'disposed'-event.

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"disposed"`` |
| `handler` | () => `void` |

#### Returns

`void`

#### Defined in

[packages/tools/src/Cognite3DViewerToolBase.ts:37](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Cognite3DViewerToolBase.ts#L37)
