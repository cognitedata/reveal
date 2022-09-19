---
id: "cognite_reveal_tools.DebugLoadedSectorsTool"
title: "Class: DebugLoadedSectorsTool"
sidebar_label: "DebugLoadedSectorsTool"
custom_edit_url: null
---

[@cognite/reveal/tools](../modules/cognite_reveal_tools.md).DebugLoadedSectorsTool

## Hierarchy

- [`Cognite3DViewerToolBase`](cognite_reveal_tools.Cognite3DViewerToolBase.md)

  ↳ **`DebugLoadedSectorsTool`**

## Constructors

### constructor

• **new DebugLoadedSectorsTool**(`viewer`, `options?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `viewer` | [`Cognite3DViewer`](cognite_reveal.Cognite3DViewer.md) |
| `options` | [`DebugLoadedSectorsToolOptions`](../modules/cognite_reveal_tools.md#debugloadedsectorstooloptions) |

#### Overrides

[Cognite3DViewerToolBase](cognite_reveal_tools.Cognite3DViewerToolBase.md).[constructor](cognite_reveal_tools.Cognite3DViewerToolBase.md#constructor)

#### Defined in

[packages/tools/src/DebugLoadedSectorsTool.ts:28](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/tools/src/DebugLoadedSectorsTool.ts#L28)

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

[packages/tools/src/DebugLoadedSectorsTool.ts:48](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/tools/src/DebugLoadedSectorsTool.ts#L48)

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

[packages/tools/src/Cognite3DViewerToolBase.ts:37](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/tools/src/Cognite3DViewerToolBase.ts#L37)

___

### setOptions

▸ **setOptions**(`options`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`DebugLoadedSectorsToolOptions`](../modules/cognite_reveal_tools.md#debugloadedsectorstooloptions) |

#### Returns

`void`

#### Defined in

[packages/tools/src/DebugLoadedSectorsTool.ts:36](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/tools/src/DebugLoadedSectorsTool.ts#L36)

___

### showSectorBoundingBoxes

▸ **showSectorBoundingBoxes**(`model`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `model` | [`Cognite3DModel`](cognite_reveal.Cognite3DModel.md) |

#### Returns

`void`

#### Defined in

[packages/tools/src/DebugLoadedSectorsTool.ts:52](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/tools/src/DebugLoadedSectorsTool.ts#L52)
