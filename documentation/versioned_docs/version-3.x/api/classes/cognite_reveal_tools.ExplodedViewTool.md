---
id: "cognite_reveal_tools.ExplodedViewTool"
title: "Class: ExplodedViewTool"
sidebar_label: "ExplodedViewTool"
custom_edit_url: null
---

[@cognite/reveal/tools](../modules/cognite_reveal_tools.md).ExplodedViewTool

## Hierarchy

- [`Cognite3DViewerToolBase`](cognite_reveal_tools.Cognite3DViewerToolBase.md)

  ↳ **`ExplodedViewTool`**

## Constructors

### constructor

• **new ExplodedViewTool**(`treeIndex`, `cadModel`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `treeIndex` | `number` |
| `cadModel` | [`Cognite3DModel`](cognite_reveal.Cognite3DModel.md) |

#### Overrides

[Cognite3DViewerToolBase](cognite_reveal_tools.Cognite3DViewerToolBase.md).[constructor](cognite_reveal_tools.Cognite3DViewerToolBase.md#constructor)

#### Defined in

[packages/tools/src/ExplodedViewTool.ts:18](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/ExplodedViewTool.ts#L18)

## Accessors

### readyPromise

• `get` **readyPromise**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/tools/src/ExplodedViewTool.ts:14](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/ExplodedViewTool.ts#L14)

## Methods

### dispose

▸ **dispose**(): `void`

Disposes the element and triggeres the 'disposed' event before clearing the list
of dipose-listeners.

#### Returns

`void`

#### Inherited from

[Cognite3DViewerToolBase](cognite_reveal_tools.Cognite3DViewerToolBase.md).[dispose](cognite_reveal_tools.Cognite3DViewerToolBase.md#dispose)

#### Defined in

[packages/tools/src/Cognite3DViewerToolBase.ts:52](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Cognite3DViewerToolBase.ts#L52)

___

### expand

▸ **expand**(`expandRadius`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `expandRadius` | `number` |

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/tools/src/ExplodedViewTool.ts:29](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/ExplodedViewTool.ts#L29)

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

[packages/tools/src/Cognite3DViewerToolBase.ts:37](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Cognite3DViewerToolBase.ts#L37)

___

### reset

▸ **reset**(): `void`

#### Returns

`void`

#### Defined in

[packages/tools/src/ExplodedViewTool.ts:46](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/ExplodedViewTool.ts#L46)
