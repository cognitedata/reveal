---
id: "cognite_reveal.AnnotationIdPointCloudObjectCollection"
title: "Class: AnnotationIdPointCloudObjectCollection"
sidebar_label: "AnnotationIdPointCloudObjectCollection"
custom_edit_url: null
---

[@cognite/reveal](../modules/cognite_reveal.md).AnnotationIdPointCloudObjectCollection

A simple PointCloudObjectCollection that consists of an explicitly provided list of annotation IDs

## Hierarchy

- [`PointCloudObjectCollection`](cognite_reveal.PointCloudObjectCollection.md)

  ↳ **`AnnotationIdPointCloudObjectCollection`**

## Constructors

### constructor

• **new AnnotationIdPointCloudObjectCollection**(`ids`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `ids` | `Iterable`\<`number`\> |

#### Overrides

[PointCloudObjectCollection](cognite_reveal.PointCloudObjectCollection.md).[constructor](cognite_reveal.PointCloudObjectCollection.md#constructor)

#### Defined in

[packages/pointcloud-styling/src/AnnotationIdPointCloudObjectCollection.ts:13](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/pointcloud-styling/src/AnnotationIdPointCloudObjectCollection.ts#L13)

## Accessors

### isLoading

• `get` **isLoading**(): ``false``

#### Returns

``false``

whether the collection is still loading data in the background i.e. not yet ready for use

#### Overrides

PointCloudObjectCollection.isLoading

#### Defined in

[packages/pointcloud-styling/src/AnnotationIdPointCloudObjectCollection.ts:22](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/pointcloud-styling/src/AnnotationIdPointCloudObjectCollection.ts#L22)

## Methods

### getAnnotationIds

▸ **getAnnotationIds**(): `Iterable`\<`number`\>

#### Returns

`Iterable`\<`number`\>

annotation IDs of the annotations for the objects represented by this PointCloudObjectCollection instance

#### Overrides

[PointCloudObjectCollection](cognite_reveal.PointCloudObjectCollection.md).[getAnnotationIds](cognite_reveal.PointCloudObjectCollection.md#getannotationids)

#### Defined in

[packages/pointcloud-styling/src/AnnotationIdPointCloudObjectCollection.ts:18](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/pointcloud-styling/src/AnnotationIdPointCloudObjectCollection.ts#L18)

___

### off

▸ **off**(`event`, `listener`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

#### Returns

`void`

#### Inherited from

[PointCloudObjectCollection](cognite_reveal.PointCloudObjectCollection.md).[off](cognite_reveal.PointCloudObjectCollection.md#off)

#### Defined in

[packages/pointcloud-styling/src/PointCloudObjectCollection.ts:30](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/pointcloud-styling/src/PointCloudObjectCollection.ts#L30)

___

### on

▸ **on**(`event`, `listener`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

#### Returns

`void`

#### Inherited from

[PointCloudObjectCollection](cognite_reveal.PointCloudObjectCollection.md).[on](cognite_reveal.PointCloudObjectCollection.md#on)

#### Defined in

[packages/pointcloud-styling/src/PointCloudObjectCollection.ts:25](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/pointcloud-styling/src/PointCloudObjectCollection.ts#L25)
