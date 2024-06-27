---
id: "cognite_reveal"
title: "Module: @cognite/reveal"
sidebar_label: "@cognite/reveal"
sidebar_position: 0
custom_edit_url: null
---

## Enumerations

- [NodeOutlineColor](../enums/cognite_reveal.NodeOutlineColor.md)
- [PotreePointColorType](../enums/cognite_reveal.PotreePointColorType.md)
- [PotreePointShape](../enums/cognite_reveal.PotreePointShape.md)
- [PotreePointSizeType](../enums/cognite_reveal.PotreePointSizeType.md)
- [WellKnownAsprsPointClassCodes](../enums/cognite_reveal.WellKnownAsprsPointClassCodes.md)

## Classes

- [AssetNodeCollection](../classes/cognite_reveal.AssetNodeCollection.md)
- [BoundingBoxClipper](../classes/cognite_reveal.BoundingBoxClipper.md)
- [CameraManagerHelper](../classes/cognite_reveal.CameraManagerHelper.md)
- [ClusteredAreaCollection](../classes/cognite_reveal.ClusteredAreaCollection.md)
- [Cognite3DModel](../classes/cognite_reveal.Cognite3DModel.md)
- [Cognite3DViewer](../classes/cognite_reveal.Cognite3DViewer.md)
- [CognitePointCloudModel](../classes/cognite_reveal.CognitePointCloudModel.md)
- [ComboControls](../classes/cognite_reveal.ComboControls.md)
- [DefaultCameraManager](../classes/cognite_reveal.DefaultCameraManager.md)
- [IndexSet](../classes/cognite_reveal.IndexSet.md)
- [IntersectionNodeCollection](../classes/cognite_reveal.IntersectionNodeCollection.md)
- [InvertedNodeCollection](../classes/cognite_reveal.InvertedNodeCollection.md)
- [NodeAppearanceProvider](../classes/cognite_reveal.NodeAppearanceProvider.md)
- [NodeCollection](../classes/cognite_reveal.NodeCollection.md)
- [NumericRange](../classes/cognite_reveal.NumericRange.md)
- [PropertyFilterNodeCollection](../classes/cognite_reveal.PropertyFilterNodeCollection.md)
- [SinglePropertyFilterNodeCollection](../classes/cognite_reveal.SinglePropertyFilterNodeCollection.md)
- [TreeIndexNodeCollection](../classes/cognite_reveal.TreeIndexNodeCollection.md)
- [UnionNodeCollection](../classes/cognite_reveal.UnionNodeCollection.md)

## Interfaces

- [AddModelOptions](../interfaces/cognite_reveal.AddModelOptions.md)
- [AreaCollection](../interfaces/cognite_reveal.AreaCollection.md)
- [CameraManager](../interfaces/cognite_reveal.CameraManager.md)
- [CdfModelNodeCollectionDataProvider](../interfaces/cognite_reveal.CdfModelNodeCollectionDataProvider.md)
- [Cognite3DViewerOptions](../interfaces/cognite_reveal.Cognite3DViewerOptions.md)
- [CogniteModelBase](../interfaces/cognite_reveal.CogniteModelBase.md)
- [IntersectionFromPixelOptions](../interfaces/cognite_reveal.IntersectionFromPixelOptions.md)

## Type Aliases

### CadIntersection

Ƭ **CadIntersection**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `distanceToCamera` | `number` | Distance from the camera to the intersection. |
| `model` | [`Cognite3DModel`](../classes/cognite_reveal.Cognite3DModel.md) | The model that was intersected. |
| `point` | `THREE.Vector3` | Coordinate of the intersection. |
| `treeIndex` | `number` | Tree index of the intersected 3D node. |
| `type` | ``"cad"`` | The intersection type. |

#### Defined in

[packages/api/src/public/migration/types.ts:179](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/types.ts#L179)

___

### CadModelBudget

Ƭ **CadModelBudget**: `Object`

Represents a measurement of how much geometry can be loaded.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `highDetailProximityThreshold` | `number` | Sectors within this distance from the camera will always be loaded in high details.  **`deprecated`** This is only used for 3D models processed prior to the Reveal 3.0 release (Q1 2022). |
| `maximumRenderCost` | `number` | Maximum render cost. This number can be thought of as triangle count, although the number doesn't match this directly. |

#### Defined in

[packages/cad-geometry-loaders/src/CadModelBudget.ts:10](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-geometry-loaders/src/CadModelBudget.ts#L10)

___

### CameraChangeDelegate

Ƭ **CameraChangeDelegate**: (`position`: `THREE.Vector3`, `target`: `THREE.Vector3`) => `void`

#### Type declaration

▸ (`position`, `target`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `position` | `THREE.Vector3` |
| `target` | `THREE.Vector3` |

##### Returns

`void`

#### Defined in

[packages/camera-manager/src/types.ts:85](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/camera-manager/src/types.ts#L85)

___

### CameraConfiguration

Ƭ **CameraConfiguration**: `Object`

Represents a camera configuration, consisting of a camera position and target.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `position` | `THREE.Vector3` |
| `target` | `THREE.Vector3` |

#### Defined in

[packages/utilities/src/CameraConfiguration.ts:8](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/utilities/src/CameraConfiguration.ts#L8)

___

### CameraControlsOptions

Ƭ **CameraControlsOptions**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `changeCameraTargetOnClick?` | `boolean` | Enables or disables change of camera target on mouse click. New target is then set to the point of the model under current cursor position.  Default is false. |
| `mouseWheelAction?` | ``"zoomToTarget"`` \| ``"zoomPastCursor"`` \| ``"zoomToCursor"`` | Sets mouse wheel initiated action.  Modes:  'zoomToTarget' - zooms just to the current target (center of the screen) of the camera.  'zoomPastCursor' - zooms in the direction of the ray coming from camera through cursor screen position, allows going through objects.  'zoomToCursor' - mouse wheel scroll zooms towards the point on the model where cursor is hovering over, doesn't allow going through objects.  Default is 'zoomPastCursor'. |

#### Defined in

[packages/camera-manager/src/types.ts:5](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/camera-manager/src/types.ts#L5)

___

### CameraState

Ƭ **CameraState**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `position?` | `THREE.Vector3` | Camera position in world space. |
| `rotation?` | `THREE.Quaternion` | Camera local rotation in quaternion form. |
| `target?` | `THREE.Vector3` | Camera target in world space. |

#### Defined in

[packages/camera-manager/src/types.ts:66](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/camera-manager/src/types.ts#L66)

___

### DisposedDelegate

Ƭ **DisposedDelegate**: () => `void`

#### Type declaration

▸ (): `void`

##### Returns

`void`

#### Defined in

[packages/utilities/src/events/types.ts:20](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/utilities/src/events/types.ts#L20)

___

### GeometryFilter

Ƭ **GeometryFilter**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `boundingBox?` | `THREE.Box3` | The bounds to load geometry within. By default this box is in CDF coordinate space which will be transformed into coordinates relative to the model using the the model transformation which can be specified using [the CDF API](https://docs.cognite.com/api/v1/#operation/update3DRevisions), or set in [Cognite Fusion](https://fusion.cognite.com/).  **`see`** [isBoundingBoxInModelCoordinates](cognite_reveal.md#isboundingboxinmodelcoordinates). |
| `isBoundingBoxInModelCoordinates?` | `boolean` | When set, the geometry filter \{@link boundingBox} will be considered to be in "Reveal/ThreeJS space". Rather than CDF space which is the default. When using Reveal space, the model transformation which can be specified using [the CDF API](https://docs.cognite.com/api/v1/#operation/update3DRevisions), or set in [Cognite Fusion](https://fusion.cognite.com/). |

#### Defined in

[packages/cad-model/src/types.ts:21](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-model/src/types.ts#L21)

___

### Intersection

Ƭ **Intersection**: [`CadIntersection`](cognite_reveal.md#cadintersection) \| `PointCloudIntersection`

#### Defined in

[packages/api/src/public/migration/types.ts:206](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/types.ts#L206)

___

### LoadingStateChangeListener

Ƭ **LoadingStateChangeListener**: (`loadingState`: `LoadingState`) => `any`

#### Type declaration

▸ (`loadingState`): `any`

Handler for events about data being loaded.

##### Parameters

| Name | Type |
| :------ | :------ |
| `loadingState` | `LoadingState` |

##### Returns

`any`

#### Defined in

[packages/api/src/public/types.ts:30](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/types.ts#L30)

___

### ModelState

Ƭ **ModelState**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `defaultNodeAppearance` | [`NodeAppearance`](cognite_reveal.md#nodeappearance) |
| `modelId` | `number` |
| `revisionId` | `number` |
| `styledSets` | \{ `appearance`: [`NodeAppearance`](cognite_reveal.md#nodeappearance) ; `options?`: `any` ; `state`: `any` ; `token`: `string`  }[] |

#### Defined in

[packages/api/src/utilities/ViewStateHelper.ts:31](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/utilities/ViewStateHelper.ts#L31)

___

### NodeAppearance

Ƭ **NodeAppearance**: `Object`

Type for defining node appearance profiles to style a 3D CAD model.

**`see`** [DefaultNodeAppearance](cognite_reveal.md#defaultnodeappearance)

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `color?` | [`number`, `number`, `number`] | Overrides the default color of the node in RGB. Each component is in range [0, 255]. `[0, 0, 0]` means no override. |
| `outlineColor?` | [`NodeOutlineColor`](../enums/cognite_reveal.NodeOutlineColor.md) | When set, an outline is drawn around the node to make it stand out. |
| `prioritizedForLoadingHint?` | `number` | When provided, this value can be used to prioritize certain areas of the 3D model to be loaded. This can be useful to prioritize key objects in the 3D model to always be loaded.  When non-zero, sectors containing geometry in the vicinity of the prioritized sectors are given an *extra* priority. Recommended values are in range 1 (somewhat higher priority to be loaded) to 10 (very likely to be loaded). Usually values around 4-5 is recommended.  Prioritized nodes are loaded at the expense of non-prioritized areas. There are no guarantees that the nodes are actually loaded, and the more prioritized areas/nodes provided, the less likely it is that the hint is obeyed.  Extra priority doesn't accumulate when sectors are prioritized because they intersect/contain several nodes.  **This is an advanced feature and not recommended for most users**   **`version`** Only works with 3D models converted later than Q4 2021. |
| `renderGhosted?` | `boolean` | When set to true, the node is rendered ghosted, i.e. transparent with a fixed color. This has no effect if [renderInFront](cognite_reveal.md#renderinfront) is `true`. |
| `renderInFront?` | `boolean` | When set to true, the node is rendered in front of all other nodes even if it's occluded. Note that this take precedence over [renderGhosted](cognite_reveal.md#renderghosted). |
| `visible?` | `boolean` | Overrides the visibility of the node. |

#### Defined in

[packages/cad-styling/src/NodeAppearance.ts:20](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-styling/src/NodeAppearance.ts#L20)

___

### NodeCollectionDescriptor

Ƭ **NodeCollectionDescriptor**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `options?` | `any` |
| `state` | `any` |
| `token` | [`TypeName`](cognite_reveal.md#typename) |

#### Defined in

[packages/cad-styling/src/NodeCollectionDeserializer.ts:22](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-styling/src/NodeCollectionDeserializer.ts#L22)

___

### NodeCollectionSerializationContext

Ƭ **NodeCollectionSerializationContext**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `client` | `CogniteClient` |
| `model` | [`CdfModelNodeCollectionDataProvider`](../interfaces/cognite_reveal.CdfModelNodeCollectionDataProvider.md) |

#### Defined in

[packages/cad-styling/src/NodeCollectionDeserializer.ts:21](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-styling/src/NodeCollectionDeserializer.ts#L21)

___

### OnLoadingCallback

Ƭ **OnLoadingCallback**: (`itemsLoaded`: `number`, `itemsRequested`: `number`, `itemsCulled`: `number`) => `void`

#### Type declaration

▸ (`itemsLoaded`, `itemsRequested`, `itemsCulled`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `itemsLoaded` | `number` |
| `itemsRequested` | `number` |
| `itemsCulled` | `number` |

##### Returns

`void`

#### Defined in

[packages/api/src/public/migration/types.ts:23](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/migration/types.ts#L23)

___

### PointCloudBudget

Ƭ **PointCloudBudget**: `Object`

Represents a budget of how many point from point clouds can be
loaded at the same time.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `numberOfPoints` | `number` | Total number of points that can be loaded for all point clouds models accumulated. |

#### Defined in

[packages/pointclouds/src/PointCloudBudget.ts:10](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/pointclouds/src/PointCloudBudget.ts#L10)

___

### PointerEventDelegate

Ƭ **PointerEventDelegate**: (`event`: `PointerEventData`) => `void`

#### Type declaration

▸ (`event`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `PointerEventData` |

##### Returns

`void`

#### Defined in

[packages/utilities/src/events/types.ts:9](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/utilities/src/events/types.ts#L9)

___

### RevealOptions

Ƭ **RevealOptions**: `Object`

**`property`** logMetrics Might be used to disable usage statistics.

**`property`** nodeAppearanceProvider Style node by tree-index.

**`property`** internal Internals are for internal usage only (like unit-testing).

#### Type declaration

| Name | Type |
| :------ | :------ |
| `continuousModelStreaming?` | `boolean` |
| `internal?` | \{ `cad?`: `InternalRevealCadOptions`  } |
| `internal.cad?` | `InternalRevealCadOptions` |
| `logMetrics?` | `boolean` |
| `outputRenderTarget?` | \{ `autoSize?`: `boolean` ; `target`: `THREE.WebGLRenderTarget`  } |
| `outputRenderTarget.autoSize?` | `boolean` |
| `outputRenderTarget.target` | `THREE.WebGLRenderTarget` |
| `renderOptions?` | `RenderOptions` |
| `rendererResolutionThreshold?` | `number` |

#### Defined in

[packages/api/src/public/types.ts:16](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/public/types.ts#L16)

___

### SceneRenderedDelegate

Ƭ **SceneRenderedDelegate**: (`event`: \{ `camera`: `THREE.PerspectiveCamera` ; `frameNumber`: `number` ; `renderTime`: `number` ; `renderer`: `THREE.WebGLRenderer`  }) => `void`

#### Type declaration

▸ (`event`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `Object` |
| `event.camera` | `THREE.PerspectiveCamera` |
| `event.frameNumber` | `number` |
| `event.renderTime` | `number` |
| `event.renderer` | `THREE.WebGLRenderer` |

##### Returns

`void`

#### Defined in

[packages/utilities/src/events/types.ts:26](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/utilities/src/events/types.ts#L26)

___

### SerializedNodeCollection

Ƭ **SerializedNodeCollection**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `options?` | `any` |
| `state` | `any` |
| `token` | `string` |

#### Defined in

[packages/cad-styling/src/SerializedNodeCollection.ts:4](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-styling/src/SerializedNodeCollection.ts#L4)

___

### SupportedModelTypes

Ƭ **SupportedModelTypes**: ``"pointcloud"`` \| ``"cad"``

#### Defined in

[packages/model-base/src/SupportedModelTypes.ts:4](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/model-base/src/SupportedModelTypes.ts#L4)

___

### TypeName

Ƭ **TypeName**: `string`

#### Defined in

[packages/cad-styling/src/NodeCollectionDeserializer.ts:20](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-styling/src/NodeCollectionDeserializer.ts#L20)

___

### ViewerState

Ƭ **ViewerState**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `camera?` | \{ `position`: \{ `x`: `number` ; `y`: `number` ; `z`: `number`  } ; `target`: \{ `x`: `number` ; `y`: `number` ; `z`: `number`  }  } |
| `camera.position` | \{ `x`: `number` ; `y`: `number` ; `z`: `number`  } |
| `camera.position.x` | `number` |
| `camera.position.y` | `number` |
| `camera.position.z` | `number` |
| `camera.target` | \{ `x`: `number` ; `y`: `number` ; `z`: `number`  } |
| `camera.target.x` | `number` |
| `camera.target.y` | `number` |
| `camera.target.z` | `number` |
| `clippingPlanes?` | `ClippingPlanesState`[] |
| `models?` | [`ModelState`](cognite_reveal.md#modelstate)[] |

#### Defined in

[packages/api/src/utilities/ViewStateHelper.ts:15](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/src/utilities/ViewStateHelper.ts#L15)

___

### WellKnownUnit

Ƭ **WellKnownUnit**: ``"Meters"`` \| ``"Centimeters"`` \| ``"Millimeters"`` \| ``"Micrometers"`` \| ``"Kilometers"`` \| ``"Feet"`` \| ``"Inches"`` \| ``"Yards"`` \| ``"Miles"`` \| ``"Mils"`` \| ``"Microinches"``

Units supported by [Cognite3DModel](../classes/cognite_reveal.Cognite3DModel.md).

#### Defined in

[packages/cad-model/src/types.ts:8](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-model/src/types.ts#L8)

## Variables

### DefaultNodeAppearance

• `Const` **DefaultNodeAppearance**: `Object`

A set of default node appearances used in Reveal.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `Default` | [`NodeAppearance`](cognite_reveal.md#nodeappearance) |
| `Ghosted` | [`NodeAppearance`](cognite_reveal.md#nodeappearance) |
| `Hidden` | [`NodeAppearance`](cognite_reveal.md#nodeappearance) |
| `Highlighted` | \{ `color?`: [`number`, `number`, `number`] ; `outlineColor?`: [`NodeOutlineColor`](../enums/cognite_reveal.NodeOutlineColor.md) ; `prioritizedForLoadingHint?`: `number` ; `renderGhosted?`: `boolean` ; `renderInFront?`: `boolean` ; `visible?`: `boolean`  } |
| `Highlighted.color?` | [`number`, `number`, `number`] |
| `Highlighted.outlineColor?` | [`NodeOutlineColor`](../enums/cognite_reveal.NodeOutlineColor.md) |
| `Highlighted.prioritizedForLoadingHint?` | `number` |
| `Highlighted.renderGhosted?` | `boolean` |
| `Highlighted.renderInFront?` | `boolean` |
| `Highlighted.visible?` | `boolean` |
| `InFront` | [`NodeAppearance`](cognite_reveal.md#nodeappearance) |
| `Outlined` | [`NodeAppearance`](cognite_reveal.md#nodeappearance) |

#### Defined in

[packages/cad-styling/src/NodeAppearance.ts:109](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-styling/src/NodeAppearance.ts#L109)

___

### REVEAL\_VERSION

• `Const` **REVEAL\_VERSION**: `string` = `process.env.VERSION`

#### Defined in

[packages/api/index.ts:15](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/api/index.ts#L15)

___

### revealEnv

• `Const` **revealEnv**: `Object`

Used to specify custom url for worker/wasm files
in cases when you need the latest local files or CDN is blocked by CSP.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `publicPath` | `string` |

#### Defined in

[packages/utilities/src/revealEnv.ts:9](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/utilities/src/revealEnv.ts#L9)

## Functions

### registerCustomNodeCollectionType

▸ **registerCustomNodeCollectionType**\<`T`\>(`nodeCollectionType`, `deserializer`): `void`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`NodeCollection`](../classes/cognite_reveal.NodeCollection.md)\<`T`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `nodeCollectionType` | `string` |
| `deserializer` | (`descriptor`: [`NodeCollectionDescriptor`](cognite_reveal.md#nodecollectiondescriptor), `context`: [`NodeCollectionSerializationContext`](cognite_reveal.md#nodecollectionserializationcontext)) => `Promise`\<`T`\> |

#### Returns

`void`

#### Defined in

[packages/cad-styling/src/NodeCollectionDeserializer.ts:147](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/cad-styling/src/NodeCollectionDeserializer.ts#L147)
