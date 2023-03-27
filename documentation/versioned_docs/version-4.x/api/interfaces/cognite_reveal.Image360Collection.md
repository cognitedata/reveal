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

[packages/360-images/src/collection/Image360Collection.ts:15](https://github.com/cognitedata/reveal/blob/917d1d190/viewer/packages/360-images/src/collection/Image360Collection.ts#L15)

## Methods

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

[packages/360-images/src/collection/Image360Collection.ts:45](https://github.com/cognitedata/reveal/blob/917d1d190/viewer/packages/360-images/src/collection/Image360Collection.ts#L45)

▸ **off**(`event`, `callback`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"image360Exited"`` |
| `callback` | [`Image360ExitedDelegate`](../modules/cognite_reveal.md#image360exiteddelegate) |

#### Returns

`void`

#### Defined in

[packages/360-images/src/collection/Image360Collection.ts:46](https://github.com/cognitedata/reveal/blob/917d1d190/viewer/packages/360-images/src/collection/Image360Collection.ts#L46)

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

[packages/360-images/src/collection/Image360Collection.ts:37](https://github.com/cognitedata/reveal/blob/917d1d190/viewer/packages/360-images/src/collection/Image360Collection.ts#L37)

▸ **on**(`event`, `callback`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"image360Exited"`` |
| `callback` | [`Image360ExitedDelegate`](../modules/cognite_reveal.md#image360exiteddelegate) |

#### Returns

`void`

#### Defined in

[packages/360-images/src/collection/Image360Collection.ts:38](https://github.com/cognitedata/reveal/blob/917d1d190/viewer/packages/360-images/src/collection/Image360Collection.ts#L38)

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

[packages/360-images/src/collection/Image360Collection.ts:22](https://github.com/cognitedata/reveal/blob/917d1d190/viewer/packages/360-images/src/collection/Image360Collection.ts#L22)

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

[packages/360-images/src/collection/Image360Collection.ts:28](https://github.com/cognitedata/reveal/blob/917d1d190/viewer/packages/360-images/src/collection/Image360Collection.ts#L28)
