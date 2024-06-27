---
id: "cognite_reveal.OverlayCollection"
title: "Interface: OverlayCollection<MetadataType>"
sidebar_label: "OverlayCollection"
custom_edit_url: null
---

[@cognite/reveal](../modules/cognite_reveal.md).OverlayCollection

## Type parameters

| Name |
| :------ |
| `MetadataType` |

## Methods

### addOverlays

▸ **addOverlays**(`overlays`): [`Overlay3D`](cognite_reveal.Overlay3D.md)\<`MetadataType`\>[]

Add overlays to the collection.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `overlays` | [`OverlayInfo`](../modules/cognite_reveal.md#overlayinfo)\<`MetadataType`\>[] | Overlays to add to the collection. |

#### Returns

[`Overlay3D`](cognite_reveal.Overlay3D.md)\<`MetadataType`\>[]

The added overlays.

#### Defined in

[packages/3d-overlays/src/OverlayCollection.ts:28](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/3d-overlays/src/OverlayCollection.ts#L28)

___

### getOverlays

▸ **getOverlays**(): [`Overlay3D`](cognite_reveal.Overlay3D.md)\<`MetadataType`\>[]

Get all overlays in the collection.

#### Returns

[`Overlay3D`](cognite_reveal.Overlay3D.md)\<`MetadataType`\>[]

#### Defined in

[packages/3d-overlays/src/OverlayCollection.ts:21](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/3d-overlays/src/OverlayCollection.ts#L21)

___

### removeAllOverlays

▸ **removeAllOverlays**(): `void`

Remove all overlays from the collection.

#### Returns

`void`

#### Defined in

[packages/3d-overlays/src/OverlayCollection.ts:39](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/3d-overlays/src/OverlayCollection.ts#L39)

___

### removeOverlays

▸ **removeOverlays**(`overlays`): `void`

Remove overlays from the collection.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `overlays` | [`Overlay3D`](cognite_reveal.Overlay3D.md)\<`MetadataType`\>[] | Overlays to remove from the collection. |

#### Returns

`void`

#### Defined in

[packages/3d-overlays/src/OverlayCollection.ts:34](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/3d-overlays/src/OverlayCollection.ts#L34)

___

### setVisibility

▸ **setVisibility**(`visibility`): `void`

Sets whether overlays in the collection should be visible.

#### Parameters

| Name | Type |
| :------ | :------ |
| `visibility` | `boolean` |

#### Returns

`void`

#### Defined in

[packages/3d-overlays/src/OverlayCollection.ts:44](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/3d-overlays/src/OverlayCollection.ts#L44)
