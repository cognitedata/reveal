# Interface: Image360Revision

Interface used to manage historical revisions of [Image360](Image360.md).
One instance represents one specific image revision.

## Properties

### date

> `readonly` **date**: `undefined` \| `Date`

The date of this revision. Undefined if the revision is undated.

#### Defined in

[packages/360-images/src/entity/Image360Revision.ts:17](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/360-images/src/entity/Image360Revision.ts#L17)

## Methods

### getAnnotations()

> **getAnnotations**(): `Promise` \<[`Image360Annotation`](Image360Annotation.md)[]\>

The annotations associated with this revision.

#### Returns

`Promise` \<[`Image360Annotation`](Image360Annotation.md)[]\>

#### Defined in

[packages/360-images/src/entity/Image360Revision.ts:22](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/360-images/src/entity/Image360Revision.ts#L22)

***

### getPreviewThumbnailUrl()

> **getPreviewThumbnailUrl**(): `Promise`\<`undefined` \| `string`\>

Get the thumbnail url for this revision.

#### Returns

`Promise`\<`undefined` \| `string`\>

#### Defined in

[packages/360-images/src/entity/Image360Revision.ts:27](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/360-images/src/entity/Image360Revision.ts#L27)
