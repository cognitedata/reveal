---
id: "cognite_reveal_tools.GeomapTool"
title: "Class: GeomapTool"
sidebar_label: "GeomapTool"
custom_edit_url: null
---

[@cognite/reveal/tools](../modules/cognite_reveal_tools.md).GeomapTool

The `GeomapTool` is a geolocation for the models and allow the user to place them on the maps.

## Hierarchy

- [`Cognite3DViewerToolBase`](cognite_reveal_tools.Cognite3DViewerToolBase.md)

  ↳ **`GeomapTool`**

## Constructors

### constructor

• **new GeomapTool**(`viewer`, `config`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `viewer` | [`Cognite3DViewer`](cognite_reveal.Cognite3DViewer.md) |
| `config` | [`MapConfig`](../modules/cognite_reveal_tools.md#mapconfig) |

#### Overrides

[Cognite3DViewerToolBase](cognite_reveal_tools.Cognite3DViewerToolBase.md).[constructor](cognite_reveal_tools.Cognite3DViewerToolBase.md#constructor)

#### Defined in

[packages/tools/src/Geomap/GeomapTool.ts:19](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Geomap/GeomapTool.ts#L19)

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

[packages/tools/src/Geomap/GeomapTool.ts:36](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Geomap/GeomapTool.ts#L36)

___

### latLongToWorldCoordinates

▸ **latLongToWorldCoordinates**(`latLong`): `Object`

Converts Latitude & Longitude into Vector2 World coordinates on the Map

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `latLong` | `LatLongPosition` | Latitude & Longitude |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `x` | `number` |
| `y` | `number` |

#### Defined in

[packages/tools/src/Geomap/GeomapTool.ts:32](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Geomap/GeomapTool.ts#L32)

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
