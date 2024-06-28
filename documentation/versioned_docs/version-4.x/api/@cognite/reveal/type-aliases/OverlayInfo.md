# Type Alias: OverlayInfo\<ContentType\>

> **OverlayInfo**\<`ContentType`\>: `object`

Data used in creating an overlay.

## Type Parameters

• **ContentType** = [`DefaultOverlay3DContentType`](DefaultOverlay3DContentType.md)

## Type declaration

### color?

> `optional` **color**: `Color`

The color of this overlay. Will be set by collection if undefined

### content

> **content**: `ContentType`

The data contained in this overlay

### position

> **position**: `Vector3`

Position of the overlay

## Defined in

[packages/3d-overlays/src/OverlayCollection.ts:18](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/3d-overlays/src/OverlayCollection.ts#L18)
