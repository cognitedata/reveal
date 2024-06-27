# Interface: Cognite3DViewerOptions

## Properties

### antiAliasingHint?

> `optional` **antiAliasingHint**: `"disabled"` \| `"fxaa"` \| `"msaa2+fxaa"` \| `"msaa4+fxaa"` \| `"msaa8+fxaa"` \| `"msaa16+fxaa"` \| `"msaa2"` \| `"msaa4"` \| `"msaa8"` \| `"msaa16"`

Hints Reveal to use a given anti-aliasing technique.

Fast approximate anti-aliasing (FXAA) is a fast technique that will remove some, but not all aliasing effects. See
https://en.wikipedia.org/wiki/Fast_approximate_anti-aliasing.

Multi-sampling anti-aliasinbg (MSAA) is a technique for taking multiple samples per pixel to avoid aliasing effects.
This mode requires WebGL 2. See https://www.khronos.org/opengl/wiki/Multisampling.

The combined modes will apply both MSAA and FXAA anti-aliasing and yields the best visual result.

When using the MSAA modes combined with FXAA Reveal will fall back to FXAA on WebGL 1. There is no fallback for the
"plain" MSAA modes on WebGL 1.

Currently the default mode is FXAA, but this is subject to change.

#### Defined in

[packages/api/src/public/migration/types.ts:116](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/types.ts#L116)

***

### cameraManager?

> `optional` **cameraManager**: [`CameraManager`](CameraManager.md)

Camera manager instance that is used for controlling the camera.
It is responsible for all manipulations that are done with the camera,
including animations and modification of state. Also, gives ability
to provide custom `PerspectiveCamera` instance to [Cognite3DViewer](../classes/Cognite3DViewer.md).
Default implementation is [DefaultCameraManager](../classes/DefaultCameraManager.md).

#### Defined in

[packages/api/src/public/migration/types.ts:81](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/types.ts#L81)

***

### continuousModelStreaming?

> `optional` **continuousModelStreaming**: `boolean`

Allows for controlling if geometry streaming should be halted when
the camera is moving. Note that this option should left to false on
low-end devices as more loading can cause frame drops.

Default value is set to true.

#### Defined in

[packages/api/src/public/migration/types.ts:176](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/types.ts#L176)

***

### customDataSource?

> `optional` **customDataSource**: [`DataSource`](../extensions/datasource/interfaces/DataSource.md)

Allows providing a custom data source that Reveal will
use to load model data. Note that some features might not
work when implementing a custom data source. Please refer
to the Reveal documentation for details.

Note that the data source must support [CdfModelIdentifier](../extensions/datasource/classes/CdfModelIdentifier.md).

This cannot be used together with Cognite3DViewerOptions._localModels.

#### Defined in

[packages/api/src/public/migration/types.ts:167](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/types.ts#L167)

***

### domElement?

> `optional` **domElement**: `HTMLElement`

An existing DOM element that we will render canvas into.

#### Defined in

[packages/api/src/public/migration/types.ts:50](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/types.ts#L50)

***

### enableEdges?

> `optional` **enableEdges**: `boolean`

Enables / disables visualizing the edges of geometry. Defaults to true.

#### Defined in

[packages/api/src/public/migration/types.ts:152](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/types.ts#L152)

***

### hasEventListeners?

> `optional` **hasEventListeners**: `boolean`

**`Beta`**

Add event listerers around, default is having event listeners.

#### Defined in

[packages/api/src/public/migration/types.ts:204](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/types.ts#L204)

***

### loadingIndicatorStyle?

> `optional` **loadingIndicatorStyle**: `object`

Style the loading indicator.

#### opacity

> **opacity**: `number`

Opacity of the spinner in fractions. Valid values are between
0.2 and 1.0. Defaults to 1.0.

#### placement

> **placement**: `"topLeft"` \| `"topRight"` \| `"bottomLeft"` \| `"bottomRight"`

What corner the spinner should be placed in. Defaults top topLeft.

#### Defined in

[packages/api/src/public/migration/types.ts:63](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/types.ts#L63)

***

### logMetrics?

> `optional` **logMetrics**: `boolean`

Send anonymous usage statistics.

#### Defined in

[packages/api/src/public/migration/types.ts:53](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/types.ts#L53)

***

### onLoading?

> `optional` **onLoading**: [`OnLoadingCallback`](../type-aliases/OnLoadingCallback.md)

Callback to download stream progress.

#### Defined in

[packages/api/src/public/migration/types.ts:155](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/types.ts#L155)

***

### pointCloudEffects?

> `optional` **pointCloudEffects**: `object`

Point cloud visualisation effects parameteres.

#### edlOptions?

> `optional` **edlOptions**: `"disabled"` \| `Partial` \<[`EdlOptions`](../type-aliases/EdlOptions.md)\>

Eye Dome Lighting (EDL) effect, considerably improves depth perception of point cloud model.

#### pointBlending?

> `optional` **pointBlending**: `boolean`

Point blending effect, creates more "stable" texture on objects surfaces if point sizing is
big enough. Can cause significant decrease in performance on some machines.

#### Defined in

[packages/api/src/public/migration/types.ts:137](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/types.ts#L137)

***

### renderTargetOptions?

> `optional` **renderTargetOptions**: `object`

Render to offscreen buffer instead of canvas.

#### autoSetSize?

> `optional` **autoSetSize**: `boolean`

#### target

> **target**: `WebGLRenderTarget`\<`Texture`\>

#### Defined in

[packages/api/src/public/migration/types.ts:58](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/types.ts#L58)

***

### renderer?

> `optional` **renderer**: `WebGLRenderer`

Renderer used to visualize model (optional).
Note that when providing a custom renderer, this should be configured with
`'powerPreference': 'high-performance'` for best performance.

#### Defined in

[packages/api/src/public/migration/types.ts:87](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/types.ts#L87)

***

### ~~rendererResolutionThreshold?~~

> `optional` **rendererResolutionThreshold**: `number`

Generally Reveal will follow the resolution given by the size
of the encapsulating DOM element of the Canvas [Cognite3DViewerOptions.domElement](Cognite3DViewerOptions.md#domelement).
To ensure managable performance, Reveal will by default set an upper threshold to limit
the resolution. Setting the [Cognite3DViewerOptions.rendererResolutionThreshold](Cognite3DViewerOptions.md#rendererresolutionthreshold) will
set this upper limit of what resolution Reveal will allow.

#### Deprecated

Use [Cognite3DViewer.setResolutionOptions](../classes/Cognite3DViewer.md#setresolutionoptions) instead.

#### Defined in

[packages/api/src/public/migration/types.ts:98](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/types.ts#L98)

***

### sdk

> **sdk**: `CogniteClient`

Initialized connection to CDF used to load data.

#### Defined in

[packages/api/src/public/migration/types.ts:47](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/types.ts#L47)

***

### ssaoQualityHint?

> `optional` **ssaoQualityHint**: `"disabled"` \| `"medium"` \| `"high"` \| `"veryhigh"`

Hints the renderer of the quality it should aim for for screen space ambient occlusion,
an effect creating shadows and that gives the rendered image more depth.

#### Defined in

[packages/api/src/public/migration/types.ts:132](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/types.ts#L132)

***

### useFlexibleCameraManager?

> `optional` **useFlexibleCameraManager**: `boolean`

**`Beta`**

Use the new flexible camera manager or not, default not to be used.

#### Defined in

[packages/api/src/public/migration/types.ts:198](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/api/src/public/migration/types.ts#L198)
