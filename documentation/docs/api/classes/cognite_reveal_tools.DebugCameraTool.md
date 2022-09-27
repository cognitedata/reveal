---
id: "cognite_reveal_tools.DebugCameraTool"
title: "Class: DebugCameraTool"
sidebar_label: "DebugCameraTool"
custom_edit_url: null
---

[@cognite/reveal/tools](../modules/cognite_reveal_tools.md).DebugCameraTool

Base class for tools attaching to a {@see Cognite3DViewer}.

## Hierarchy

- [`Cognite3DViewerToolBase`](cognite_reveal_tools.Cognite3DViewerToolBase.md)

  ↳ **`DebugCameraTool`**

## Constructors

### constructor

• **new DebugCameraTool**(`viewer`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `viewer` | [`Cognite3DViewer`](cognite_reveal.Cognite3DViewer.md) |

#### Overrides

[Cognite3DViewerToolBase](cognite_reveal_tools.Cognite3DViewerToolBase.md).[constructor](cognite_reveal_tools.Cognite3DViewerToolBase.md#constructor)

#### Defined in

[packages/tools/src/DebugCameraTool.ts:20](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/tools/src/DebugCameraTool.ts#L20)

## Methods

### dispose

▸ **dispose**(): `void`

Removes all elements and detaches from the viewer.

#### Returns

`void`

#### Overrides

[Cognite3DViewerToolBase](cognite_reveal_tools.Cognite3DViewerToolBase.md).[dispose](cognite_reveal_tools.Cognite3DViewerToolBase.md#dispose)

#### Defined in

[packages/tools/src/DebugCameraTool.ts:32](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/tools/src/DebugCameraTool.ts#L32)

___

### hideCameraHelper

▸ **hideCameraHelper**(): `void`

#### Returns

`void`

#### Defined in

[packages/tools/src/DebugCameraTool.ts:43](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/tools/src/DebugCameraTool.ts#L43)

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

[packages/tools/src/Cognite3DViewerToolBase.ts:37](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/tools/src/Cognite3DViewerToolBase.ts#L37)

___

### showCameraHelper

▸ **showCameraHelper**(): `void`

#### Returns

`void`

#### Defined in

[packages/tools/src/DebugCameraTool.ts:37](https://github.com/cognitedata/reveal/blob/e3cde2deb/viewer/packages/tools/src/DebugCameraTool.ts#L37)
