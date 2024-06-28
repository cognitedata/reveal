# Class: `abstract` PointCloudObjectCollection

Base class for collections of point cloud objects intended for styling operations

## Extended by

- [`AnnotationIdPointCloudObjectCollection`](AnnotationIdPointCloudObjectCollection.md)

## Constructors

### new PointCloudObjectCollection()

> **new PointCloudObjectCollection**(): [`PointCloudObjectCollection`](PointCloudObjectCollection.md)

#### Returns

[`PointCloudObjectCollection`](PointCloudObjectCollection.md)

## Accessors

### isLoading

> `get` `abstract` **isLoading**(): `boolean`

#### Returns

`boolean`

whether the collection is still loading data in the background i.e. not yet ready for use

#### Defined in

[packages/pointcloud-styling/src/PointCloudObjectCollection.ts:23](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/pointcloud-styling/src/PointCloudObjectCollection.ts#L23)

## Methods

### getAnnotationIds()

> `abstract` **getAnnotationIds**(): `Iterable`\<`number`\>

#### Returns

`Iterable`\<`number`\>

annotation IDs of the annotations for the objects represented by this PointCloudObjectCollection instance

#### Defined in

[packages/pointcloud-styling/src/PointCloudObjectCollection.ts:18](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/pointcloud-styling/src/PointCloudObjectCollection.ts#L18)

***

### off()

> **off**(`event`, `listener`): `void`

#### Parameters

• **event**: `"changed"`

• **listener**

#### Returns

`void`

#### Defined in

[packages/pointcloud-styling/src/PointCloudObjectCollection.ts:30](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/pointcloud-styling/src/PointCloudObjectCollection.ts#L30)

***

### on()

> **on**(`event`, `listener`): `void`

#### Parameters

• **event**: `"changed"`

• **listener**

#### Returns

`void`

#### Defined in

[packages/pointcloud-styling/src/PointCloudObjectCollection.ts:25](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/pointcloud-styling/src/PointCloudObjectCollection.ts#L25)
