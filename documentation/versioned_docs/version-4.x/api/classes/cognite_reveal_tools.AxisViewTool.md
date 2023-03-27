---
id: "cognite_reveal_tools.AxisViewTool"
title: "Class: AxisViewTool"
sidebar_label: "AxisViewTool"
custom_edit_url: null
---

[@cognite/reveal/tools](../modules/cognite_reveal_tools.md).AxisViewTool

Base class for tools attaching to a Cognite3DViewer.

## Hierarchy

- [`Cognite3DViewerToolBase`](cognite_reveal_tools.Cognite3DViewerToolBase.md)

  ↳ **`AxisViewTool`**

## Constructors

### constructor

• **new AxisViewTool**(`viewer`, `config?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `viewer` | [`Cognite3DViewer`](cognite_reveal.Cognite3DViewer.md) |
| `config?` | [`AxisBoxConfig`](../modules/cognite_reveal_tools.md#axisboxconfig) |

#### Overrides

[Cognite3DViewerToolBase](cognite_reveal_tools.Cognite3DViewerToolBase.md).[constructor](cognite_reveal_tools.Cognite3DViewerToolBase.md#constructor)

#### Defined in

[packages/tools/src/AxisView/AxisViewTool.ts:45](https://github.com/cognitedata/reveal/blob/917d1d190/viewer/packages/tools/src/AxisView/AxisViewTool.ts#L45)

## Methods

### dispose

▸ **dispose**(): `void`

Disposes the element and triggeres the 'disposed' event before clearing the list
of dipose-listeners.

#### Returns

`void`

#### Overrides

[Cognite3DViewerToolBase](cognite_reveal_tools.Cognite3DViewerToolBase.md).[dispose](cognite_reveal_tools.Cognite3DViewerToolBase.md#dispose)

#### Defined in

[packages/tools/src/AxisView/AxisViewTool.ts:69](https://github.com/cognitedata/reveal/blob/917d1d190/viewer/packages/tools/src/AxisView/AxisViewTool.ts#L69)

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

#### Inherited from

[Cognite3DViewerToolBase](cognite_reveal_tools.Cognite3DViewerToolBase.md).[off](cognite_reveal_tools.Cognite3DViewerToolBase.md#off)

#### Defined in

[packages/tools/src/Cognite3DViewerToolBase.ts:37](https://github.com/cognitedata/reveal/blob/917d1d190/viewer/packages/tools/src/Cognite3DViewerToolBase.ts#L37)
