# Type Alias: ResolutionOptions

> **ResolutionOptions**: `object`

## Type declaration

### maxRenderResolution?

> `optional` **maxRenderResolution**: `number`

Generally Reveal will follow the resolution given by the size
of the encapsulating DOM element of the Canvas [Cognite3DViewerOptions.domElement](../interfaces/Cognite3DViewerOptions.md#domelement).
To ensure managable performance, Reveal will by default set an upper threshold to limit
the resolution. The `maxRenderResolution` option will
directly control this upper limit. It corresponds to the number of pixels in the render target.

### movingCameraResolutionFactor?

> `optional` **movingCameraResolutionFactor**: `number`

A factor that will scale down the resolution when moving the camera. This can
be used to achieve a better user experience on devices with limited hardware.
Values must be greater than 0 and at most 1.
This factor is applied to the number of physical pixels of the canvas.
A value of e.g. 0.25 will approximately divide the number of pixels rendered on the screen by four.

## Defined in

[packages/api/src/public/migration/types.ts:263](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/types.ts#L263)
