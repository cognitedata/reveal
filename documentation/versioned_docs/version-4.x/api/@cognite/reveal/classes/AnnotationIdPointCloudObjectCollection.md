# Class: AnnotationIdPointCloudObjectCollection

A simple PointCloudObjectCollection that consists of an explicitly provided list of annotation IDs

## Extends

- [`PointCloudObjectCollection`](PointCloudObjectCollection.md)

## Constructors

### new AnnotationIdPointCloudObjectCollection()

> **new AnnotationIdPointCloudObjectCollection**(`ids`): [`AnnotationIdPointCloudObjectCollection`](AnnotationIdPointCloudObjectCollection.md)

#### Parameters

• **ids**: `Iterable`\<`number`\>

#### Returns

[`AnnotationIdPointCloudObjectCollection`](AnnotationIdPointCloudObjectCollection.md)

#### Overrides

[`PointCloudObjectCollection`](PointCloudObjectCollection.md) . [`constructor`](PointCloudObjectCollection.md#constructors)

#### Defined in

[packages/pointcloud-styling/src/AnnotationIdPointCloudObjectCollection.ts:13](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/pointcloud-styling/src/AnnotationIdPointCloudObjectCollection.ts#L13)

## Accessors

### isLoading

> `get` **isLoading**(): `false`

#### Returns

`false`

whether the collection is still loading data in the background i.e. not yet ready for use

#### Overrides

[`PointCloudObjectCollection`](PointCloudObjectCollection.md) . [`isLoading`](PointCloudObjectCollection.md#isloading)

#### Defined in

[packages/pointcloud-styling/src/AnnotationIdPointCloudObjectCollection.ts:22](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/pointcloud-styling/src/AnnotationIdPointCloudObjectCollection.ts#L22)

## Methods

### getAnnotationIds()

> **getAnnotationIds**(): `Iterable`\<`number`\>

#### Returns

`Iterable`\<`number`\>

annotation IDs of the annotations for the objects represented by this PointCloudObjectCollection instance

#### Overrides

[`PointCloudObjectCollection`](PointCloudObjectCollection.md) . [`getAnnotationIds`](PointCloudObjectCollection.md#getannotationids)

#### Defined in

[packages/pointcloud-styling/src/AnnotationIdPointCloudObjectCollection.ts:18](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/pointcloud-styling/src/AnnotationIdPointCloudObjectCollection.ts#L18)

***

### off()

> **off**(`event`, `listener`): `void`

#### Parameters

• **event**: `"changed"`

• **listener**

#### Returns

`void`

#### Inherited from

[`PointCloudObjectCollection`](PointCloudObjectCollection.md) . [`off`](PointCloudObjectCollection.md#off)

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

#### Inherited from

[`PointCloudObjectCollection`](PointCloudObjectCollection.md) . [`on`](PointCloudObjectCollection.md#on)

#### Defined in

[packages/pointcloud-styling/src/PointCloudObjectCollection.ts:25](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/pointcloud-styling/src/PointCloudObjectCollection.ts#L25)
