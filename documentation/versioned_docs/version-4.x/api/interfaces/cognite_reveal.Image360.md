---
id: "cognite_reveal.Image360"
title: "Interface: Image360"
sidebar_label: "Image360"
custom_edit_url: null
---

[@cognite/reveal](../modules/cognite_reveal.md).Image360

## Properties

### image360Visualization

• `Readonly` **image360Visualization**: [`Image360Visualization`](cognite_reveal.Image360Visualization.md)

The object containing the unit cube with the 360 images.

#### Defined in

[packages/360-images/src/entity/Image360.ts:26](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/360-images/src/entity/Image360.ts#L26)

___

### transform

• `Readonly` **transform**: `Matrix4`

Get a copy of the model-to-world transformation matrix
of the given 360 image.

#### Defined in

[packages/360-images/src/entity/Image360.ts:20](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/360-images/src/entity/Image360.ts#L20)

## Methods

### getActiveRevision

▸ **getActiveRevision**(): [`Image360Revision`](cognite_reveal.Image360Revision.md)

Get the revision that is currently loaded for this entry.

#### Returns

[`Image360Revision`](cognite_reveal.Image360Revision.md)

The active revision.

#### Defined in

[packages/360-images/src/entity/Image360.ts:43](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/360-images/src/entity/Image360.ts#L43)

___

### getImageMetadata

▸ **getImageMetadata**(): [`Image360Metadata`](../modules/cognite_reveal.md#image360metadata)

Get additional information about this image and its active revision.

#### Returns

[`Image360Metadata`](../modules/cognite_reveal.md#image360metadata)

#### Defined in

[packages/360-images/src/entity/Image360.ts:31](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/360-images/src/entity/Image360.ts#L31)

___

### getRevisions

▸ **getRevisions**(): [`Image360Revision`](cognite_reveal.Image360Revision.md)[]

List all historical images for this entity.

#### Returns

[`Image360Revision`](cognite_reveal.Image360Revision.md)[]

A list of available revisions.

#### Defined in

[packages/360-images/src/entity/Image360.ts:37](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/360-images/src/entity/Image360.ts#L37)
