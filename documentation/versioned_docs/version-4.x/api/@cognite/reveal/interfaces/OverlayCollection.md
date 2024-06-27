# Interface: OverlayCollection\<ContentType\>

A set of overlays managed.

## Type Parameters

• **ContentType**

## Methods

### addOverlays()

> **addOverlays**(`overlays`): [`Overlay3D`](Overlay3D.md)\<`ContentType`\>[]

Add overlays to the collection.

#### Parameters

• **overlays**: [`OverlayInfo`](../type-aliases/OverlayInfo.md)\<`ContentType`\>[]

Overlays to add to the collection.

#### Returns

[`Overlay3D`](Overlay3D.md)\<`ContentType`\>[]

The added overlays.

#### Defined in

[packages/3d-overlays/src/OverlayCollection.ts:47](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/3d-overlays/src/OverlayCollection.ts#L47)

***

### getOverlays()

> **getOverlays**(): [`Overlay3D`](Overlay3D.md)\<`ContentType`\>[]

Get all overlays in the collection.

#### Returns

[`Overlay3D`](Overlay3D.md)\<`ContentType`\>[]

#### Defined in

[packages/3d-overlays/src/OverlayCollection.ts:40](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/3d-overlays/src/OverlayCollection.ts#L40)

***

### removeAllOverlays()

> **removeAllOverlays**(): `void`

Remove all overlays from the collection.

#### Returns

`void`

#### Defined in

[packages/3d-overlays/src/OverlayCollection.ts:58](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/3d-overlays/src/OverlayCollection.ts#L58)

***

### removeOverlays()

> **removeOverlays**(`overlays`): `void`

Remove overlays from the collection.

#### Parameters

• **overlays**: [`Overlay3D`](Overlay3D.md)\<`ContentType`\>[]

Overlays to remove from the collection.

#### Returns

`void`

#### Defined in

[packages/3d-overlays/src/OverlayCollection.ts:53](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/3d-overlays/src/OverlayCollection.ts#L53)

***

### setVisibility()

> **setVisibility**(`visibility`): `void`

Sets whether overlays in the collection should be visible.

#### Parameters

• **visibility**: `boolean`

#### Returns

`void`

#### Defined in

[packages/3d-overlays/src/OverlayCollection.ts:63](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/3d-overlays/src/OverlayCollection.ts#L63)
