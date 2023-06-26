---
id: "cognite_reveal.ThickLine"
title: "Class: ThickLine"
sidebar_label: "ThickLine"
custom_edit_url: null
---

[@cognite/reveal](../modules/cognite_reveal.md).ThickLine

## Constructors

### constructor

• **new ThickLine**(`lineWidth`, `lineColor`, `startPoint`, `endPoint`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `lineWidth` | `number` |
| `lineColor` | `Color` |
| `startPoint` | `Vector3` |
| `endPoint` | `Vector3` |

#### Defined in

[packages/utilities/src/three/ThickLine.ts:16](https://github.com/cognitedata/reveal/blob/29826bff/viewer/packages/utilities/src/three/ThickLine.ts#L16)

## Accessors

### meshes

• `get` **meshes**(): `Group`

#### Returns

`Group`

#### Defined in

[packages/utilities/src/three/ThickLine.ts:67](https://github.com/cognitedata/reveal/blob/29826bff/viewer/packages/utilities/src/three/ThickLine.ts#L67)

___

### visibility

• `set` **visibility**(`visible`): `void`

Set visibility

#### Parameters

| Name | Type |
| :------ | :------ |
| `visible` | `boolean` |

#### Returns

`void`

#### Defined in

[packages/utilities/src/three/ThickLine.ts:128](https://github.com/cognitedata/reveal/blob/29826bff/viewer/packages/utilities/src/three/ThickLine.ts#L128)

## Methods

### dispose

▸ **dispose**(): `void`

#### Returns

`void`

#### Defined in

[packages/utilities/src/three/ThickLine.ts:57](https://github.com/cognitedata/reveal/blob/29826bff/viewer/packages/utilities/src/three/ThickLine.ts#L57)

___

### getLineLength

▸ **getLineLength**(): `number`

Get the distance between the line start point & end point.

#### Returns

`number`

Return distance between start & end point of the line.

#### Defined in

[packages/utilities/src/three/ThickLine.ts:97](https://github.com/cognitedata/reveal/blob/29826bff/viewer/packages/utilities/src/three/ThickLine.ts#L97)

___

### getMidPointOnLine

▸ **getMidPointOnLine**(): `Vector3`

Calculate mid point on the Line.

#### Returns

`Vector3`

Returns mid point between start and end points.

#### Defined in

[packages/utilities/src/three/ThickLine.ts:105](https://github.com/cognitedata/reveal/blob/29826bff/viewer/packages/utilities/src/three/ThickLine.ts#L105)

___

### updateLineClippingPlanes

▸ **updateLineClippingPlanes**(`clippingPlanes`): `void`

Updates the line clipping planes

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `clippingPlanes` | `Plane`[] | current active global clipping planes. |

#### Returns

`void`

#### Defined in

[packages/utilities/src/three/ThickLine.ts:86](https://github.com/cognitedata/reveal/blob/29826bff/viewer/packages/utilities/src/three/ThickLine.ts#L86)

___

### updateLineColor

▸ **updateLineColor**(`color`): `void`

Update current line color.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `color` | `Color` | Color of the line mesh. |

#### Returns

`void`

#### Defined in

[packages/utilities/src/three/ThickLine.ts:121](https://github.com/cognitedata/reveal/blob/29826bff/viewer/packages/utilities/src/three/ThickLine.ts#L121)

___

### updateLineEndPoint

▸ **updateLineEndPoint**(`endPoint`): `void`

Update the line end point.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `endPoint` | `Vector3` | Second point of the line |

#### Returns

`void`

#### Defined in

[packages/utilities/src/three/ThickLine.ts:75](https://github.com/cognitedata/reveal/blob/29826bff/viewer/packages/utilities/src/three/ThickLine.ts#L75)

___

### updateLineWidth

▸ **updateLineWidth**(`lineWidth`): `void`

Update current line width.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `lineWidth` | `number` | Width of the line mesh. |

#### Returns

`void`

#### Defined in

[packages/utilities/src/three/ThickLine.ts:113](https://github.com/cognitedata/reveal/blob/29826bff/viewer/packages/utilities/src/three/ThickLine.ts#L113)
