# Type Alias: OverlayCollectionOptions

> **OverlayCollectionOptions**: `object`

Parameters for instantiating the OverlayCollection.

## Type declaration

### defaultOverlayColor?

> `optional` **defaultOverlayColor**: `THREE.Color`

Sets default overlay color for newly added overlays.
Default is yellow.

### overlayTexture?

> `optional` **overlayTexture**: `THREE.Texture`

Sets default texture for all overlays of this OverlayCollection.
Must be a square texture, recommended size is at least `maxPointSize` for
not pixelated overlays.

### overlayTextureMask?

> `optional` **overlayTextureMask**: `THREE.Texture`

Sets default mask for all overlays of this OverlayCollection,
denoting where overlay color should be placed compared to texture color.
Must be a square texture with the same size as `overlayTexture`.
Texture should be monochrome. Internally, R channel is used for
denoting pixels that should be colored by texture and not by overlay color.

## Defined in

[packages/tools/src/Overlay3D/Overlay3DTool.ts:57](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/Overlay3D/Overlay3DTool.ts#L57)
