---
id: "cognite_reveal.Image360Revision"
title: "Interface: Image360Revision"
sidebar_label: "Image360Revision"
custom_edit_url: null
---

[@cognite/reveal](../modules/cognite_reveal.md).Image360Revision

Interface used to manage historical revisions of [Image360](cognite_reveal.Image360.md).
One instance represents one specific image revision.

## Properties

### date

• `Readonly` **date**: `undefined` \| `Date`

The date of this revision. Undefined if the revison is undated.

#### Defined in

[packages/360-images/src/entity/Image360Revision.ts:17](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/360-images/src/entity/Image360Revision.ts#L17)

## Methods

### getAnnotations

▸ **getAnnotations**(): `Promise`\<[`Image360Annotation`](cognite_reveal.Image360Annotation.md)[]\>

The annotations associated with this revision

#### Returns

`Promise`\<[`Image360Annotation`](cognite_reveal.Image360Annotation.md)[]\>

#### Defined in

[packages/360-images/src/entity/Image360Revision.ts:22](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/360-images/src/entity/Image360Revision.ts#L22)
