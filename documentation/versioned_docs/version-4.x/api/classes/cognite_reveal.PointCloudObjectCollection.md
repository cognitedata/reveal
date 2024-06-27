---
id: "cognite_reveal.PointCloudObjectCollection"
title: "Class: PointCloudObjectCollection"
sidebar_label: "PointCloudObjectCollection"
custom_edit_url: null
---

[@cognite/reveal](../modules/cognite_reveal.md).PointCloudObjectCollection

Base class for collections of point cloud objects intended for styling operations

## Hierarchy

- **`PointCloudObjectCollection`**

  ↳ [`AnnotationIdPointCloudObjectCollection`](cognite_reveal.AnnotationIdPointCloudObjectCollection.md)

## Constructors

### constructor

• **new PointCloudObjectCollection**()

## Accessors

### isLoading

• `Abstract` `get` **isLoading**(): `boolean`

#### Returns

`boolean`

whether the collection is still loading data in the background i.e. not yet ready for use

#### Defined in

[packages/pointcloud-styling/src/PointCloudObjectCollection.ts:23](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/pointcloud-styling/src/PointCloudObjectCollection.ts#L23)

## Methods

### getAnnotationIds

▸ `Abstract` **getAnnotationIds**(): `Iterable`\<`number`\>

#### Returns

`Iterable`\<`number`\>

annotation IDs of the annotations for the objects represented by this PointCloudObjectCollection instance

#### Defined in

[packages/pointcloud-styling/src/PointCloudObjectCollection.ts:18](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/pointcloud-styling/src/PointCloudObjectCollection.ts#L18)

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

#### Defined in

[packages/pointcloud-styling/src/PointCloudObjectCollection.ts:25](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/pointcloud-styling/src/PointCloudObjectCollection.ts#L25)
