# Class: Overlay3DCollection\<MetadataType\>

A collection of overlay icons with associated data

## Extends

- `Object3D`

## Type Parameters

• **MetadataType** = [`DefaultOverlay3DContentType`](../type-aliases/DefaultOverlay3DContentType.md)

## Implements

- [`OverlayCollection`](../interfaces/OverlayCollection.md)\<`MetadataType`\>

## Constructors

### new Overlay3DCollection()

> **new Overlay3DCollection**\<`MetadataType`\>(`overlayInfos`, `options`?): [`Overlay3DCollection`](Overlay3DCollection.md)\<`MetadataType`\>

Construct a collection of 3D overlay icons

#### Parameters

• **overlayInfos**: [`OverlayInfo`](../type-aliases/OverlayInfo.md)\<`MetadataType`\>[]

Initializes the collection with the list of overlays. The length
of the list will be the maximum allowed number of icons in this collection, unless it's empty,
in which case a default maximum limit will be used instead

• **options?**: [`Overlay3DCollectionOptions`](../type-aliases/Overlay3DCollectionOptions.md)

Additional options for this overlay collection

#### Returns

[`Overlay3DCollection`](Overlay3DCollection.md)\<`MetadataType`\>

#### Overrides

`Object3D.constructor`

#### Defined in

[packages/3d-overlays/src/Overlay3DCollection.ts:68](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/3d-overlays/src/Overlay3DCollection.ts#L68)

## Methods

### addOverlays()

> **addOverlays**(`overlayInfos`): [`Overlay3D`](../interfaces/Overlay3D.md)\<`MetadataType`\>[]

Add more overlays into this collection

#### Parameters

• **overlayInfos**: [`OverlayInfo`](../type-aliases/OverlayInfo.md)\<`MetadataType`\>[]

#### Returns

[`Overlay3D`](../interfaces/Overlay3D.md)\<`MetadataType`\>[]

#### Implementation of

[`OverlayCollection`](../interfaces/OverlayCollection.md) . [`addOverlays`](../interfaces/OverlayCollection.md#addoverlays)

#### Defined in

[packages/3d-overlays/src/Overlay3DCollection.ts:115](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/3d-overlays/src/Overlay3DCollection.ts#L115)

***

### dispose()

> **dispose**(): `void`

Dispose this collection and icons with all associated resources

#### Returns

`void`

#### Defined in

[packages/3d-overlays/src/Overlay3DCollection.ts:216](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/3d-overlays/src/Overlay3DCollection.ts#L216)

***

### getOverlays()

> **getOverlays**(): [`Overlay3D`](../interfaces/Overlay3D.md)\<`MetadataType`\>[]

Get the overlay icons contained in this collection

#### Returns

[`Overlay3D`](../interfaces/Overlay3D.md)\<`MetadataType`\>[]

#### Implementation of

[`OverlayCollection`](../interfaces/OverlayCollection.md) . [`getOverlays`](../interfaces/OverlayCollection.md#getoverlays)

#### Defined in

[packages/3d-overlays/src/Overlay3DCollection.ts:108](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/3d-overlays/src/Overlay3DCollection.ts#L108)

***

### intersectOverlays()

> **intersectOverlays**(`normalizedCoordinates`, `camera`): `undefined` \| [`Overlay3D`](../interfaces/Overlay3D.md)\<`MetadataType`\>

Run intersection on icons in this collection. Returns the closest hit

#### Parameters

• **normalizedCoordinates**: `Vector2`

• **camera**: `Camera`

#### Returns

`undefined` \| [`Overlay3D`](../interfaces/Overlay3D.md)\<`MetadataType`\>

#### Defined in

[packages/3d-overlays/src/Overlay3DCollection.ts:166](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/3d-overlays/src/Overlay3DCollection.ts#L166)

***

### removeAllOverlays()

> **removeAllOverlays**(): `void`

Clean up all icons in this collection

#### Returns

`void`

#### Implementation of

[`OverlayCollection`](../interfaces/OverlayCollection.md) . [`removeAllOverlays`](../interfaces/OverlayCollection.md#removealloverlays)

#### Defined in

[packages/3d-overlays/src/Overlay3DCollection.ts:156](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/3d-overlays/src/Overlay3DCollection.ts#L156)

***

### removeOverlays()

> **removeOverlays**(`overlays`): `void`

Remove the listed overlays from this collection

#### Parameters

• **overlays**: [`Overlay3D`](../interfaces/Overlay3D.md)\<`MetadataType`\>[]

#### Returns

`void`

#### Implementation of

[`OverlayCollection`](../interfaces/OverlayCollection.md) . [`removeOverlays`](../interfaces/OverlayCollection.md#removeoverlays)

#### Defined in

[packages/3d-overlays/src/Overlay3DCollection.ts:146](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/3d-overlays/src/Overlay3DCollection.ts#L146)

***

### setVisibility()

> **setVisibility**(`visibility`): `void`

Set whether this collection is visible or not

#### Parameters

• **visibility**: `boolean`

#### Returns

`void`

#### Implementation of

[`OverlayCollection`](../interfaces/OverlayCollection.md) . [`setVisibility`](../interfaces/OverlayCollection.md#setvisibility)

#### Defined in

[packages/3d-overlays/src/Overlay3DCollection.ts:101](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/3d-overlays/src/Overlay3DCollection.ts#L101)
