# Type Alias: Overlay3DToolParameters

> **Overlay3DToolParameters**: `object`

Parameters for instantiating the Overlay3DTool

## Type declaration

### defaultOverlayColor

> **defaultOverlayColor**: `THREE.Color`

Sets default overlay color for newly added labels.

### maxPointSize?

> `optional` **maxPointSize**: `number`

Max point markers size in pixels. Different platforms has limitations for this value.
On Android and MacOS in Chrome maximum is 64. Windows in Chrome and MacOS Safari desktops can support up to 500.
Default is 64.

## Defined in

[packages/tools/src/Overlay3D/Overlay3DTool.ts:41](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/tools/src/Overlay3D/Overlay3DTool.ts#L41)
