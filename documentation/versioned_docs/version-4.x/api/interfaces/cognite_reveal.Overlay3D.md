---
id: "cognite_reveal.Overlay3D"
title: "Interface: Overlay3D<MetadataType>"
sidebar_label: "Overlay3D"
custom_edit_url: null
---

[@cognite/reveal](../modules/cognite_reveal.md).Overlay3D

## Type parameters

| Name |
| :------ |
| `MetadataType` |

## Accessors

### color

• `get` **color**(): `Color`

Get the display color of this overlay.

#### Returns

`Color`

#### Defined in

[packages/3d-overlays/src/Overlay3D.ts:24](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/3d-overlays/src/Overlay3D.ts#L24)

___

### position

• `get` **position**(): `Vector3`

Get the position of this overlay.

#### Returns

`Vector3`

#### Defined in

[packages/3d-overlays/src/Overlay3D.ts:16](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/3d-overlays/src/Overlay3D.ts#L16)

___

### visible

• `get` **visible**(): `boolean`

Get whether this overlay is visible.

#### Returns

`boolean`

#### Defined in

[packages/3d-overlays/src/Overlay3D.ts:12](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/3d-overlays/src/Overlay3D.ts#L12)

• `set` **visible**(`visible`): `void`

Set whether this overlay should be visible.

#### Parameters

| Name | Type |
| :------ | :------ |
| `visible` | `boolean` |

#### Returns

`void`

#### Defined in

[packages/3d-overlays/src/Overlay3D.ts:8](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/3d-overlays/src/Overlay3D.ts#L8)

## Methods

### getMetadata

▸ **getMetadata**(): `undefined` \| `MetadataType`

Get the metadata associated with this overlay.

#### Returns

`undefined` \| `MetadataType`

#### Defined in

[packages/3d-overlays/src/Overlay3D.ts:28](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/3d-overlays/src/Overlay3D.ts#L28)

___

### setColor

▸ **setColor**(`color`): `void`

Set the display color of this overlay.

#### Parameters

| Name | Type |
| :------ | :------ |
| `color` | `Color` |

#### Returns

`void`

#### Defined in

[packages/3d-overlays/src/Overlay3D.ts:20](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/3d-overlays/src/Overlay3D.ts#L20)
