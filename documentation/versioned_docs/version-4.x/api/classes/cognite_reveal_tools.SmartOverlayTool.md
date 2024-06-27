---
id: "cognite_reveal_tools.SmartOverlayTool"
title: "Class: SmartOverlayTool<MetadataType>"
sidebar_label: "SmartOverlayTool"
custom_edit_url: null
---

[@cognite/reveal/tools](../modules/cognite_reveal_tools.md).SmartOverlayTool

Base class for tools attaching to a [Cognite3DViewer](cognite_reveal.Cognite3DViewer.md).

## Type parameters

| Name | Type |
| :------ | :------ |
| `MetadataType` | [`DefaultMetadataType`](../modules/cognite_reveal.md#defaultmetadatatype) |

## Hierarchy

- [`Cognite3DViewerToolBase`](cognite_reveal_tools.Cognite3DViewerToolBase.md)

  ↳ **`SmartOverlayTool`**

## Constructors

### constructor

• **new SmartOverlayTool**\<`MetadataType`\>(`viewer`, `toolParameters?`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `MetadataType` | [`DefaultMetadataType`](../modules/cognite_reveal.md#defaultmetadatatype) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `viewer` | [`Cognite3DViewer`](cognite_reveal.Cognite3DViewer.md) |
| `toolParameters?` | [`SmartOverlayToolParameters`](../modules/cognite_reveal_tools.md#smartoverlaytoolparameters) |

#### Overrides

[Cognite3DViewerToolBase](cognite_reveal_tools.Cognite3DViewerToolBase.md).[constructor](cognite_reveal_tools.Cognite3DViewerToolBase.md#constructor)

#### Defined in

[packages/tools/src/SmartOverlay/SmartOverlayTool.ts:57](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/SmartOverlay/SmartOverlayTool.ts#L57)

## Accessors

### collections

• `get` **collections**(): [`OverlayCollection`](../interfaces/cognite_reveal.OverlayCollection.md)\<`MetadataType`\>[]

Gets all added overlay collections.

#### Returns

[`OverlayCollection`](../interfaces/cognite_reveal.OverlayCollection.md)\<`MetadataType`\>[]

#### Defined in

[packages/tools/src/SmartOverlay/SmartOverlayTool.ts:113](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/SmartOverlay/SmartOverlayTool.ts#L113)

___

### textOverlayVisible

• `get` **textOverlayVisible**(): `boolean`

#### Returns

`boolean`

#### Defined in

[packages/tools/src/SmartOverlay/SmartOverlayTool.ts:138](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/SmartOverlay/SmartOverlayTool.ts#L138)

• `set` **textOverlayVisible**(`visible`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `visible` | `boolean` |

#### Returns

`void`

#### Defined in

[packages/tools/src/SmartOverlay/SmartOverlayTool.ts:133](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/SmartOverlay/SmartOverlayTool.ts#L133)

___

### visible

• `get` **visible**(): `boolean`

#### Returns

`boolean`

#### Defined in

[packages/tools/src/SmartOverlay/SmartOverlayTool.ts:129](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/SmartOverlay/SmartOverlayTool.ts#L129)

• `set` **visible**(`visible`): `void`

Sets whether overlays are visible.

#### Parameters

| Name | Type |
| :------ | :------ |
| `visible` | `boolean` |

#### Returns

`void`

#### Defined in

[packages/tools/src/SmartOverlay/SmartOverlayTool.ts:120](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/SmartOverlay/SmartOverlayTool.ts#L120)

## Methods

### clear

▸ **clear**(): `void`

Removes all overlays.

#### Returns

`void`

#### Defined in

[packages/tools/src/SmartOverlay/SmartOverlayTool.ts:145](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/SmartOverlay/SmartOverlayTool.ts#L145)

___

### createOverlayCollection

▸ **createOverlayCollection**(`overlays?`): [`OverlayCollection`](../interfaces/cognite_reveal.OverlayCollection.md)\<`MetadataType`\>

Creates new OverlayCollection.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `overlays?` | [`OverlayInfo`](../modules/cognite_reveal.md#overlayinfo)\<`MetadataType`\>[] | Array of overlays to add. |

#### Returns

[`OverlayCollection`](../interfaces/cognite_reveal.OverlayCollection.md)\<`MetadataType`\>

Overlay group containing it's id.

#### Defined in

[packages/tools/src/SmartOverlay/SmartOverlayTool.ts:76](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/SmartOverlay/SmartOverlayTool.ts#L76)

___

### dispose

▸ **dispose**(): `void`

Disposes the element and triggeres the 'disposed' event before clearing the list
of dipose-listeners.

#### Returns

`void`

#### Overrides

[Cognite3DViewerToolBase](cognite_reveal_tools.Cognite3DViewerToolBase.md).[dispose](cognite_reveal_tools.Cognite3DViewerToolBase.md#dispose)

#### Defined in

[packages/tools/src/SmartOverlay/SmartOverlayTool.ts:198](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/SmartOverlay/SmartOverlayTool.ts#L198)

___

### off

▸ **off**(`event`, `eventHandler`): `void`

Unregisters an event handler for the 'disposed'-event.

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"hover"`` |
| `eventHandler` | [`OverlayEventHandler`](../modules/cognite_reveal_tools.md#overlayeventhandler)\<`MetadataType`\> |

#### Returns

`void`

#### Overrides

[Cognite3DViewerToolBase](cognite_reveal_tools.Cognite3DViewerToolBase.md).[off](cognite_reveal_tools.Cognite3DViewerToolBase.md#off)

#### Defined in

[packages/tools/src/SmartOverlay/SmartOverlayTool.ts:178](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/SmartOverlay/SmartOverlayTool.ts#L178)

▸ **off**(`event`, `eventHandler`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"click"`` |
| `eventHandler` | [`OverlayEventHandler`](../modules/cognite_reveal_tools.md#overlayeventhandler)\<`MetadataType`\> |

#### Returns

`void`

#### Overrides

Cognite3DViewerToolBase.off

#### Defined in

[packages/tools/src/SmartOverlay/SmartOverlayTool.ts:179](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/SmartOverlay/SmartOverlayTool.ts#L179)

▸ **off**(`event`, `eventHandler`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"disposed"`` |
| `eventHandler` | [`DisposedDelegate`](../modules/cognite_reveal.md#disposeddelegate) |

#### Returns

`void`

#### Overrides

Cognite3DViewerToolBase.off

#### Defined in

[packages/tools/src/SmartOverlay/SmartOverlayTool.ts:180](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/SmartOverlay/SmartOverlayTool.ts#L180)

___

### on

▸ **on**(`event`, `eventHandler`): `void`

Subscribes to overlay events.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"hover"`` | event to subscribe to. |
| `eventHandler` | [`OverlayEventHandler`](../modules/cognite_reveal_tools.md#overlayeventhandler)\<`MetadataType`\> |  |

#### Returns

`void`

#### Overrides

Cognite3DViewerToolBase.on

#### Defined in

[packages/tools/src/SmartOverlay/SmartOverlayTool.ts:158](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/SmartOverlay/SmartOverlayTool.ts#L158)

▸ **on**(`event`, `eventHandler`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"click"`` |
| `eventHandler` | [`OverlayEventHandler`](../modules/cognite_reveal_tools.md#overlayeventhandler)\<`MetadataType`\> |

#### Returns

`void`

#### Overrides

Cognite3DViewerToolBase.on

#### Defined in

[packages/tools/src/SmartOverlay/SmartOverlayTool.ts:159](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/SmartOverlay/SmartOverlayTool.ts#L159)

▸ **on**(`event`, `eventHandler`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"disposed"`` |
| `eventHandler` | [`DisposedDelegate`](../modules/cognite_reveal.md#disposeddelegate) |

#### Returns

`void`

#### Overrides

Cognite3DViewerToolBase.on

#### Defined in

[packages/tools/src/SmartOverlay/SmartOverlayTool.ts:160](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/SmartOverlay/SmartOverlayTool.ts#L160)

___

### removeOverlayCollection

▸ **removeOverlayCollection**(`overlayCollection`): `void`

Removes overlays that were added with addOverlays method.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `overlayCollection` | [`OverlayCollection`](../interfaces/cognite_reveal.OverlayCollection.md)\<`MetadataType`\> | Id of the overlay group to remove. |

#### Returns

`void`

#### Defined in

[packages/tools/src/SmartOverlay/SmartOverlayTool.ts:98](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/SmartOverlay/SmartOverlayTool.ts#L98)
