# Interface: Image360Annotation

An annotation associated with a 360 image revision

## Properties

### annotation

> `readonly` **annotation**: `AnnotationModel`

The underlying CDF annotation

#### Defined in

[packages/360-images/src/annotation/Image360Annotation.ts:15](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/360-images/src/annotation/Image360Annotation.ts#L15)

## Methods

### getCenter()

> **getCenter**(`out`?): `Vector3`

Get center of annotation, to e.g. point the camera toward it

#### Parameters

• **out?**: `Vector3`

#### Returns

`Vector3`

#### Defined in

[packages/360-images/src/annotation/Image360Annotation.ts:40](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/360-images/src/annotation/Image360Annotation.ts#L40)

***

### getColor()

> **getColor**(): `Color`

Get the individual display color of this annotation.

#### Returns

`Color`

#### Defined in

[packages/360-images/src/annotation/Image360Annotation.ts:20](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/360-images/src/annotation/Image360Annotation.ts#L20)

***

### getVisible()

> **getVisible**(): `boolean`

Get whether this annotation is visible

#### Returns

`boolean`

#### Defined in

[packages/360-images/src/annotation/Image360Annotation.ts:30](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/360-images/src/annotation/Image360Annotation.ts#L30)

***

### setColor()

> **setColor**(`color`?): `void`

Set the display color of this annotation. Default: Random, based on annotation label

#### Parameters

• **color?**: `Color`

#### Returns

`void`

#### Defined in

[packages/360-images/src/annotation/Image360Annotation.ts:25](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/360-images/src/annotation/Image360Annotation.ts#L25)

***

### setVisible()

> **setVisible**(`visible`?): `void`

Set whether this annotation should be visible. Default: true

#### Parameters

• **visible?**: `boolean`

#### Returns

`void`

#### Defined in

[packages/360-images/src/annotation/Image360Annotation.ts:35](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/360-images/src/annotation/Image360Annotation.ts#L35)
