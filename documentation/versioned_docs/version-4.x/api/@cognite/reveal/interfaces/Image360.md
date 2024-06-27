# Interface: Image360

A single 360 image "station", which may consist of several revisions
captured in approximately the same location

## Properties

### id

> `readonly` **id**: `string`

Get Id of 360 image entity.

#### Defined in

[packages/360-images/src/entity/Image360.ts:42](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/360-images/src/entity/Image360.ts#L42)

***

### image360Visualization

> `readonly` **image360Visualization**: [`Image360Visualization`](Image360Visualization.md)

The object containing the unit cube with the 360 images.

#### Defined in

[packages/360-images/src/entity/Image360.ts:36](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/360-images/src/entity/Image360.ts#L36)

***

### label

> `readonly` **label**: `undefined` \| `string`

Get label of 360 image entity.

#### Defined in

[packages/360-images/src/entity/Image360.ts:48](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/360-images/src/entity/Image360.ts#L48)

***

### transform

> `readonly` **transform**: `Matrix4`

Get a copy of the model-to-world transformation matrix
of the given 360 image.

#### Defined in

[packages/360-images/src/entity/Image360.ts:30](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/360-images/src/entity/Image360.ts#L30)

## Methods

### getActiveRevision()

> **getActiveRevision**(): [`Image360Revision`](Image360Revision.md)

Get the revision that is currently loaded for this entry.

#### Returns

[`Image360Revision`](Image360Revision.md)

The active revision.

#### Defined in

[packages/360-images/src/entity/Image360.ts:60](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/360-images/src/entity/Image360.ts#L60)

***

### getIconColor()

> **getIconColor**(): `Color` \| `"default"`

Get a copy of the color assigned to the icon of this entity

#### Returns

`Color` \| `"default"`

The currently assign color, or 'default' if none is assigned

#### Defined in

[packages/360-images/src/entity/Image360.ts:67](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/360-images/src/entity/Image360.ts#L67)

***

### getRevisions()

> **getRevisions**(): [`Image360Revision`](Image360Revision.md)[]

List all historical images for this entity.

#### Returns

[`Image360Revision`](Image360Revision.md)[]

A list of available revisions.

#### Defined in

[packages/360-images/src/entity/Image360.ts:54](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/360-images/src/entity/Image360.ts#L54)

***

### setIconColor()

> **setIconColor**(`color`): `void`

Assign a color to the icon of this entity

#### Parameters

• **color**: `Color` \| `"default"`

#### Returns

`void`

#### Defined in

[packages/360-images/src/entity/Image360.ts:72](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/360-images/src/entity/Image360.ts#L72)
