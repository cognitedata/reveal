---
id: "cognite_reveal.Cognite3DViewerOptions"
title: "Interface: Cognite3DViewerOptions"
sidebar_label: "Cognite3DViewerOptions"
custom_edit_url: null
---

[@cognite/reveal](../modules/cognite_reveal.md).Cognite3DViewerOptions

## Properties

### antiAliasingHint

• `Optional` **antiAliasingHint**: ``"disabled"`` \| ``"fxaa"`` \| ``"msaa2+fxaa"`` \| ``"msaa4+fxaa"`` \| ``"msaa8+fxaa"`` \| ``"msaa16+fxaa"`` \| ``"msaa2"`` \| ``"msaa4"`` \| ``"msaa8"`` \| ``"msaa16"``

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

[packages/api/src/public/migration/types.ts:113](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/api/src/public/migration/types.ts#L113)

___

### cameraManager

• `Optional` **cameraManager**: [`CameraManager`](cognite_reveal.CameraManager.md)

Camera manager instance that is used for controlling the camera.
It is responsible for all manipulations that are done with the camera,
including animations and modification of state. Also, gives ability
to provide custom `THREE.PerspectiveCamera` instance to [Cognite3DViewer](../classes/cognite_reveal.Cognite3DViewer.md).
Default implementation is [DefaultCameraManager](../classes/cognite_reveal.DefaultCameraManager.md).

#### Defined in

[packages/api/src/public/migration/types.ts:78](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/api/src/public/migration/types.ts#L78)

___

### continuousModelStreaming

• `Optional` **continuousModelStreaming**: `boolean`

Allows for controlling if geometry streaming should be halted when
the camera is moving. Note that this option should left to false on
low-end devices as more loading can cause frame drops.

Default value is set to true.

#### Defined in

[packages/api/src/public/migration/types.ts:173](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/api/src/public/migration/types.ts#L173)

___

### customDataSource

• `Optional` **customDataSource**: [`DataSource`](cognite_reveal_extensions_datasource.DataSource.md)

Allows providing a custom data source that Reveal will
use to load model data. Note that some features might not
work when implementing a custom data source. Please refer
to the Reveal documentation for details.

Note that the data source must support [CdfModelIdentifier](../classes/cognite_reveal_extensions_datasource.CdfModelIdentifier.md).

This cannot be used together with Cognite3DViewerOptions._localModels.

#### Defined in

[packages/api/src/public/migration/types.ts:164](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/api/src/public/migration/types.ts#L164)

___

### domElement

• `Optional` **domElement**: `HTMLElement`

An existing DOM element that we will render canvas into.

#### Defined in

[packages/api/src/public/migration/types.ts:47](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/api/src/public/migration/types.ts#L47)

___

### enableEdges

• `Optional` **enableEdges**: `boolean`

Enables / disables visualizing the edges of geometry. Defaults to true.

#### Defined in

[packages/api/src/public/migration/types.ts:149](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/api/src/public/migration/types.ts#L149)

___

### loadingIndicatorStyle

• `Optional` **loadingIndicatorStyle**: `Object`

Style the loading indicator.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `opacity` | `number` | Opacity of the spinner in fractions. Valid values are between 0.2 and 1.0. Defaults to 1.0. |
| `placement` | ``"topLeft"`` \| ``"topRight"`` \| ``"bottomLeft"`` \| ``"bottomRight"`` | What corner the spinner should be placed in. Defaults top topLeft. |

#### Defined in

[packages/api/src/public/migration/types.ts:60](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/api/src/public/migration/types.ts#L60)

___

### logMetrics

• `Optional` **logMetrics**: `boolean`

Send anonymous usage statistics.

#### Defined in

[packages/api/src/public/migration/types.ts:50](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/api/src/public/migration/types.ts#L50)

___

### onLoading

• `Optional` **onLoading**: [`OnLoadingCallback`](../modules/cognite_reveal.md#onloadingcallback)

Callback to download stream progress.

#### Defined in

[packages/api/src/public/migration/types.ts:152](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/api/src/public/migration/types.ts#L152)

___

### pointCloudEffects

• `Optional` **pointCloudEffects**: `Object`

Point cloud visualisation effects parameteres.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `edlOptions?` | ``"disabled"`` \| `Partial`\<[`EdlOptions`](../modules/cognite_reveal.md#edloptions)\> | Eye Dome Lighting (EDL) effect, considerably improves depth perception of point cloud model. |
| `pointBlending?` | `boolean` | Point blending effect, creates more "stable" texture on objects surfaces if point sizing is big enough. Can cause significant decrease in performance on some machines. |

#### Defined in

[packages/api/src/public/migration/types.ts:134](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/api/src/public/migration/types.ts#L134)

___

### renderTargetOptions

• `Optional` **renderTargetOptions**: `Object`

Render to offscreen buffer instead of canvas.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `autoSetSize?` | `boolean` |
| `target` | `WebGLRenderTarget` |

#### Defined in

[packages/api/src/public/migration/types.ts:55](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/api/src/public/migration/types.ts#L55)

___

### renderer

• `Optional` **renderer**: `WebGLRenderer`

Renderer used to visualize model (optional).
Note that when providing a custom renderer, this should be configured with
`'powerPreference': 'high-performance'` for best performance.

#### Defined in

[packages/api/src/public/migration/types.ts:84](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/api/src/public/migration/types.ts#L84)

___

### rendererResolutionThreshold

• `Optional` **rendererResolutionThreshold**: `number`

Generally Reveal will follow the resolution given by the size
of the encapsulating DOM element of the Canvas [domElement](cognite_reveal.Cognite3DViewerOptions.md#domelement).
To ensure managable performance, Reveal will by default set an upper threshold to limit
the resolution. Setting the [rendererResolutionThreshold](cognite_reveal.Cognite3DViewerOptions.md#rendererresolutionthreshold) will
set this upper limit of what resolution Reveal will allow.

**`Deprecated`**

Use [setResolutionOptions](../classes/cognite_reveal.Cognite3DViewer.md#setresolutionoptions) instead.

#### Defined in

[packages/api/src/public/migration/types.ts:95](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/api/src/public/migration/types.ts#L95)

___

### sdk

• **sdk**: `default`

Initialized connection to CDF used to load data.

#### Defined in

[packages/api/src/public/migration/types.ts:44](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/api/src/public/migration/types.ts#L44)

___

### ssaoQualityHint

• `Optional` **ssaoQualityHint**: ``"disabled"`` \| ``"medium"`` \| ``"high"`` \| ``"veryhigh"``

Hints the renderer of the quality it should aim for for screen space ambient occlusion,
an effect creating shadows and that gives the rendered image more depth.

#### Defined in

[packages/api/src/public/migration/types.ts:129](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/api/src/public/migration/types.ts#L129)
