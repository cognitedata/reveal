---
id: "cognite_reveal.Image360Annotation"
title: "Interface: Image360Annotation"
sidebar_label: "Image360Annotation"
custom_edit_url: null
---

[@cognite/reveal](../modules/cognite_reveal.md).Image360Annotation

An annotation associated with a 360 image revision

## Properties

### annotation

• `Readonly` **annotation**: `AnnotationModel`

The underlying CDF annotation

#### Defined in

[packages/360-images/src/annotation/Image360Annotation.ts:15](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/360-images/src/annotation/Image360Annotation.ts#L15)

## Methods

### getCenter

▸ **getCenter**(`out?`): `Vector3`

Get center of annotation, to e.g. point the camera toward it

#### Parameters

| Name | Type |
| :------ | :------ |
| `out?` | `Vector3` |

#### Returns

`Vector3`

#### Defined in

[packages/360-images/src/annotation/Image360Annotation.ts:30](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/360-images/src/annotation/Image360Annotation.ts#L30)

___

### setColor

▸ **setColor**(`color?`): `void`

Set the display color of this annotation. Default: Random, based on annotation label

#### Parameters

| Name | Type |
| :------ | :------ |
| `color?` | `Color` |

#### Returns

`void`

#### Defined in

[packages/360-images/src/annotation/Image360Annotation.ts:20](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/360-images/src/annotation/Image360Annotation.ts#L20)

___

### setVisible

▸ **setVisible**(`visible?`): `void`

Set whether this annotation should be visible. Default: true

#### Parameters

| Name | Type |
| :------ | :------ |
| `visible?` | `boolean` |

#### Returns

`void`

#### Defined in

[packages/360-images/src/annotation/Image360Annotation.ts:25](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/360-images/src/annotation/Image360Annotation.ts#L25)
