# Interface: Image360Collection

A wrapper that represents a set of 360 images.

## Properties

### id

> `readonly` **id**: `string`

The id of the collection.

#### Defined in

[packages/360-images/src/collection/Image360Collection.ts:69](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/360-images/src/collection/Image360Collection.ts#L69)

***

### image360Entities

> `readonly` **image360Entities**: [`Image360`](Image360.md)[]

A list containing all the 360 images in this set.

#### Defined in

[packages/360-images/src/collection/Image360Collection.ts:80](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/360-images/src/collection/Image360Collection.ts#L80)

***

### label

> `readonly` **label**: `undefined` \| `string`

The label of the collection.

#### Defined in

[packages/360-images/src/collection/Image360Collection.ts:75](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/360-images/src/collection/Image360Collection.ts#L75)

***

### targetRevisionDate

> **targetRevisionDate**: `undefined` \| `Date`

If defined, any subsequently entered 360 images will load the revision that are closest to the target date.
If undefined, the most recent revision will be loaded.

#### Defined in

[packages/360-images/src/collection/Image360Collection.ts:86](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/360-images/src/collection/Image360Collection.ts#L86)

## Methods

### findImageAnnotations()

> **findImageAnnotations**(`filter`): `Promise` \<[`Image360AnnotationAssetQueryResult`](../type-aliases/Image360AnnotationAssetQueryResult.md)[]\>

Find 360 images associated with an asset through CDF annotations

#### Parameters

• **filter**: [`Image360AnnotationAssetFilter`](../type-aliases/Image360AnnotationAssetFilter.md)

#### Returns

`Promise` \<[`Image360AnnotationAssetQueryResult`](../type-aliases/Image360AnnotationAssetQueryResult.md)[]\>

#### Defined in

[packages/360-images/src/collection/Image360Collection.ts:149](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/360-images/src/collection/Image360Collection.ts#L149)

***

### getAnnotationsInfo()

> **getAnnotationsInfo**(`source`): `Promise` \<[`AssetAnnotationImage360Info`](../type-aliases/AssetAnnotationImage360Info.md)[]\>

Get IDs of all CDF assets and related image/revision associated with this
360 image collection through CDF annotations

#### Parameters

• **source**: `"assets"`

#### Returns

`Promise` \<[`AssetAnnotationImage360Info`](../type-aliases/AssetAnnotationImage360Info.md)[]\>

#### Defined in

[packages/360-images/src/collection/Image360Collection.ts:164](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/360-images/src/collection/Image360Collection.ts#L164)

***

### ~~getAssetIds()~~

> **getAssetIds**(): `Promise`\<`IdEither`[]\>

Get IDs of all CDF assets associated with this 360 image collection through CDF annotations

#### Returns

`Promise`\<`IdEither`[]\>

#### Deprecated

Use [Image360Collection.getAnnotationsInfo](Image360Collection.md#getannotationsinfo)

#### Defined in

[packages/360-images/src/collection/Image360Collection.ts:156](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/360-images/src/collection/Image360Collection.ts#L156)

***

### getDefaultAnnotationStyle()

> **getDefaultAnnotationStyle**(): [`Image360AnnotationAppearance`](../type-aliases/Image360AnnotationAppearance.md)

Get the assigned default style affecting all annotations

#### Returns

[`Image360AnnotationAppearance`](../type-aliases/Image360AnnotationAppearance.md)

#### Defined in

[packages/360-images/src/collection/Image360Collection.ts:139](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/360-images/src/collection/Image360Collection.ts#L139)

***

### getIconsVisibility()

> **getIconsVisibility**(): `boolean`

Gets visibility of all 360 image icons.

#### Returns

`boolean`

true if all icons are visible, false if all icons are invisible

#### Defined in

[packages/360-images/src/collection/Image360Collection.ts:110](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/360-images/src/collection/Image360Collection.ts#L110)

***

### getModelTransformation()

> **getModelTransformation**(`out`?): `Matrix4`

Gets the transformation matrix of the collection

#### Parameters

• **out?**: `Matrix4`

#### Returns

`Matrix4`

#### Defined in

[packages/360-images/src/collection/Image360Collection.ts:97](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/360-images/src/collection/Image360Collection.ts#L97)

***

### off()

#### off(event, callback)

> **off**(`event`, `callback`): `void`

Unsubscribes from 360 image dataset event.

##### Parameters

• **event**: `"image360Entered"`

The event type.

• **callback**: [`Image360EnteredDelegate`](../type-aliases/Image360EnteredDelegate.md)

Callback function to be unsubscribed.

##### Returns

`void`

##### Defined in

[packages/360-images/src/collection/Image360Collection.ts:133](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/360-images/src/collection/Image360Collection.ts#L133)

#### off(event, callback)

> **off**(`event`, `callback`): `void`

##### Parameters

• **event**: `"image360Exited"`

• **callback**: [`Image360ExitedDelegate`](../type-aliases/Image360ExitedDelegate.md)

##### Returns

`void`

##### Defined in

[packages/360-images/src/collection/Image360Collection.ts:134](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/360-images/src/collection/Image360Collection.ts#L134)

***

### on()

#### on(event, callback)

> **on**(`event`, `callback`): `void`

Subscribes to events on 360 Image datasets. There are several event types:
'image360Entered' - Subscribes to a event for entering 360 image mode.
'image360Exited' - Subscribes to events indicating 360 image mode has exited.

##### Parameters

• **event**: `"image360Entered"`

The event type.

• **callback**: [`Image360EnteredDelegate`](../type-aliases/Image360EnteredDelegate.md)

Callback to be called when the event is fired.

##### Returns

`void`

##### Defined in

[packages/360-images/src/collection/Image360Collection.ts:125](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/360-images/src/collection/Image360Collection.ts#L125)

#### on(event, callback)

> **on**(`event`, `callback`): `void`

##### Parameters

• **event**: `"image360Exited"`

• **callback**: [`Image360ExitedDelegate`](../type-aliases/Image360ExitedDelegate.md)

##### Returns

`void`

##### Defined in

[packages/360-images/src/collection/Image360Collection.ts:126](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/360-images/src/collection/Image360Collection.ts#L126)

***

### set360IconCullingRestrictions()

> **set360IconCullingRestrictions**(`radius`, `pointLimit`): `void`

Specify parameters used to determine the number of icons that are visible when entering 360 Images.

#### Parameters

• **radius**: `number`

Only icons within the given radius will be made visible.

• **pointLimit**: `number`

Limit the number of points within the given radius. Points closer to the camera will be prioritized.

#### Returns

`void`

#### Defined in

[packages/360-images/src/collection/Image360Collection.ts:104](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/360-images/src/collection/Image360Collection.ts#L104)

***

### setDefaultAnnotationStyle()

> **setDefaultAnnotationStyle**(`appearance`): `void`

Assign a default style which affects all annotations

#### Parameters

• **appearance**: [`Image360AnnotationAppearance`](../type-aliases/Image360AnnotationAppearance.md)

#### Returns

`void`

#### Defined in

[packages/360-images/src/collection/Image360Collection.ts:144](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/360-images/src/collection/Image360Collection.ts#L144)

***

### setIconsVisibility()

> **setIconsVisibility**(`visible`): `void`

Set visibility of all 360 image icons.

#### Parameters

• **visible**: `boolean`

If true all icons are made visible according to the active culling scheme. If false all icons are hidden.

#### Returns

`void`

#### Defined in

[packages/360-images/src/collection/Image360Collection.ts:116](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/360-images/src/collection/Image360Collection.ts#L116)

***

### setModelTransformation()

> **setModelTransformation**(`matrix`): `void`

Sets the transformation matrix to be applied to the collection.

#### Parameters

• **matrix**: `Matrix4`

The transformation matrix to be applied to the collection.

#### Returns

`void`

#### Defined in

[packages/360-images/src/collection/Image360Collection.ts:92](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/360-images/src/collection/Image360Collection.ts#L92)
