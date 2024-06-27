---
id: "cognite_reveal.Image360Collection"
title: "Interface: Image360Collection"
sidebar_label: "Image360Collection"
custom_edit_url: null
---

[@cognite/reveal](../modules/cognite_reveal.md).Image360Collection

A wrapper that represents a set of 360 images.

## Properties

### image360Entities

• `Readonly` **image360Entities**: [`Image360`](cognite_reveal.Image360.md)[]

A list containing all the 360 images in this set.

#### Defined in

[packages/360-images/src/collection/Image360Collection.ts:45](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/360-images/src/collection/Image360Collection.ts#L45)

___

### targetRevisionDate

• **targetRevisionDate**: `undefined` \| `Date`

If defined, any subsequently entered 360 images will load the revision that are closest to the target date.
If undefined, the most recent revision will be loaded.

#### Defined in

[packages/360-images/src/collection/Image360Collection.ts:51](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/360-images/src/collection/Image360Collection.ts#L51)

## Methods

### findImageAnnotation

▸ **findImageAnnotation**(`filter`): `Promise`\<[`Image360AnnotationAssetQueryResult`](../modules/cognite_reveal.md#image360annotationassetqueryresult)[]\>

Find 360 images associated with a asset with the given assetRef

#### Parameters

| Name | Type |
| :------ | :------ |
| `filter` | [`Image360AnnotationAssetFilter`](../modules/cognite_reveal.md#image360annotationassetfilter) |

#### Returns

`Promise`\<[`Image360AnnotationAssetQueryResult`](../modules/cognite_reveal.md#image360annotationassetqueryresult)[]\>

#### Defined in

[packages/360-images/src/collection/Image360Collection.ts:92](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/360-images/src/collection/Image360Collection.ts#L92)

___

### off

▸ **off**(`event`, `callback`): `void`

Unsubscribes from 360 image dataset event.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"image360Entered"`` | The event type. |
| `callback` | [`Image360EnteredDelegate`](../modules/cognite_reveal.md#image360entereddelegate) | Callback function to be unsubscribed. |

#### Returns

`void`

#### Defined in

[packages/360-images/src/collection/Image360Collection.ts:81](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/360-images/src/collection/Image360Collection.ts#L81)

▸ **off**(`event`, `callback`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"image360Exited"`` |
| `callback` | [`Image360ExitedDelegate`](../modules/cognite_reveal.md#image360exiteddelegate) |

#### Returns

`void`

#### Defined in

[packages/360-images/src/collection/Image360Collection.ts:82](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/360-images/src/collection/Image360Collection.ts#L82)

___

### on

▸ **on**(`event`, `callback`): `void`

Subscribes to events on 360 Image datasets. There are several event types:
'image360Entered' - Subscribes to a event for entering 360 image mode.
'image360Exited' - Subscribes to events indicating 360 image mode has exited.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"image360Entered"`` | The event type. |
| `callback` | [`Image360EnteredDelegate`](../modules/cognite_reveal.md#image360entereddelegate) | Callback to be called when the event is fired. |

#### Returns

`void`

#### Defined in

[packages/360-images/src/collection/Image360Collection.ts:73](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/360-images/src/collection/Image360Collection.ts#L73)

▸ **on**(`event`, `callback`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"image360Exited"`` |
| `callback` | [`Image360ExitedDelegate`](../modules/cognite_reveal.md#image360exiteddelegate) |

#### Returns

`void`

#### Defined in

[packages/360-images/src/collection/Image360Collection.ts:74](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/360-images/src/collection/Image360Collection.ts#L74)

___

### set360IconCullingRestrictions

▸ **set360IconCullingRestrictions**(`radius`, `pointLimit`): `void`

Specify parameters used to determine the number of icons that are visible when entering 360 Images.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `radius` | `number` | Only icons within the given radius will be made visible. |
| `pointLimit` | `number` | Limit the number of points within the given radius. Points closer to the camera will be prioritized. |

#### Returns

`void`

#### Defined in

[packages/360-images/src/collection/Image360Collection.ts:58](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/360-images/src/collection/Image360Collection.ts#L58)

___

### setDefaultAnnotationStyle

▸ **setDefaultAnnotationStyle**(`appearance`): `void`

Assign a default style which affects all annotations

#### Parameters

| Name | Type |
| :------ | :------ |
| `appearance` | [`Image360AnnotationAppearance`](../modules/cognite_reveal.md#image360annotationappearance) |

#### Returns

`void`

#### Defined in

[packages/360-images/src/collection/Image360Collection.ts:87](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/360-images/src/collection/Image360Collection.ts#L87)

___

### setIconsVisibility

▸ **setIconsVisibility**(`visible`): `void`

Set visibility of all 360 image icons.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `visible` | `boolean` | If true all icons are made visible according to the active culling scheme. If false all icons are hidden. |

#### Returns

`void`

#### Defined in

[packages/360-images/src/collection/Image360Collection.ts:64](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/360-images/src/collection/Image360Collection.ts#L64)
