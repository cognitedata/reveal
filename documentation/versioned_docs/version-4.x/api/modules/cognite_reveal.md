---
id: "cognite_reveal"
title: "Module: @cognite/reveal"
sidebar_label: "@cognite/reveal"
sidebar_position: 0
custom_edit_url: null
---

## Enumerations

- [NodeOutlineColor](../enums/cognite_reveal.NodeOutlineColor.md)
- [PointColorType](../enums/cognite_reveal.PointColorType.md)
- [PointShape](../enums/cognite_reveal.PointShape.md)
- [PointSizeType](../enums/cognite_reveal.PointSizeType.md)
- [WellKnownAsprsPointClassCodes](../enums/cognite_reveal.WellKnownAsprsPointClassCodes.md)

## Classes

- [AnnotationIdPointCloudObjectCollection](../classes/cognite_reveal.AnnotationIdPointCloudObjectCollection.md)
- [AssetNodeCollection](../classes/cognite_reveal.AssetNodeCollection.md)
- [BoundingBoxClipper](../classes/cognite_reveal.BoundingBoxClipper.md)
- [CameraManagerHelper](../classes/cognite_reveal.CameraManagerHelper.md)
- [CdfNodeCollectionBase](../classes/cognite_reveal.CdfNodeCollectionBase.md)
- [ClusteredAreaCollection](../classes/cognite_reveal.ClusteredAreaCollection.md)
- [Cognite3DViewer](../classes/cognite_reveal.Cognite3DViewer.md)
- [CogniteCadModel](../classes/cognite_reveal.CogniteCadModel.md)
- [CognitePointCloudModel](../classes/cognite_reveal.CognitePointCloudModel.md)
- [CombineNodeCollectionBase](../classes/cognite_reveal.CombineNodeCollectionBase.md)
- [ComboControls](../classes/cognite_reveal.ComboControls.md)
- [DebouncedCameraStopEventTrigger](../classes/cognite_reveal.DebouncedCameraStopEventTrigger.md)
- [DefaultCameraManager](../classes/cognite_reveal.DefaultCameraManager.md)
- [IndexSet](../classes/cognite_reveal.IndexSet.md)
- [IntersectionNodeCollection](../classes/cognite_reveal.IntersectionNodeCollection.md)
- [InvertedNodeCollection](../classes/cognite_reveal.InvertedNodeCollection.md)
- [NodeCollection](../classes/cognite_reveal.NodeCollection.md)
- [NodeIdNodeCollection](../classes/cognite_reveal.NodeIdNodeCollection.md)
- [NumericRange](../classes/cognite_reveal.NumericRange.md)
- [PointCloudObjectCollection](../classes/cognite_reveal.PointCloudObjectCollection.md)
- [PropertyFilterNodeCollection](../classes/cognite_reveal.PropertyFilterNodeCollection.md)
- [SinglePropertyFilterNodeCollection](../classes/cognite_reveal.SinglePropertyFilterNodeCollection.md)
- [StyledPointCloudObjectCollection](../classes/cognite_reveal.StyledPointCloudObjectCollection.md)
- [TreeIndexNodeCollection](../classes/cognite_reveal.TreeIndexNodeCollection.md)
- [UnionNodeCollection](../classes/cognite_reveal.UnionNodeCollection.md)

## Interfaces

- [AddModelOptions](../interfaces/cognite_reveal.AddModelOptions.md)
- [AreaCollection](../interfaces/cognite_reveal.AreaCollection.md)
- [CameraManager](../interfaces/cognite_reveal.CameraManager.md)
- [CdfModelNodeCollectionDataProvider](../interfaces/cognite_reveal.CdfModelNodeCollectionDataProvider.md)
- [Cognite3DViewerOptions](../interfaces/cognite_reveal.Cognite3DViewerOptions.md)
- [Image360](../interfaces/cognite_reveal.Image360.md)
- [Image360Collection](../interfaces/cognite_reveal.Image360Collection.md)
- [Image360Visualization](../interfaces/cognite_reveal.Image360Visualization.md)

## Type Aliases

### AddImage360Options

Ƭ **AddImage360Options**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `collectionTransform?` | `THREE.Matrix4` | An optional transformation which will be applied to all 360 images that are fetched. |
| `preMultipliedRotation?` | `boolean` | Set this to false if the 360 images' rotation is not pre-multiplied to fit the given model.  **`Default`**  true |

#### Defined in

[packages/api/src/public/migration/types.ts:188](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/api/src/public/migration/types.ts#L188)

___

### BeforeSceneRenderedDelegate

Ƭ **BeforeSceneRenderedDelegate**: (`event`: { `camera`: `THREE.PerspectiveCamera` ; `frameNumber`: `number` ; `renderer`: `THREE.WebGLRenderer`  }) => `void`

#### Type declaration

▸ (`event`): `void`

Delegate for event triggered when scene is about to be rendered.

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `Object` |
| `event.camera` | `THREE.PerspectiveCamera` |
| `event.frameNumber` | `number` |
| `event.renderer` | `THREE.WebGLRenderer` |

##### Returns

`void`

#### Defined in

[packages/utilities/src/events/types.ts:25](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/utilities/src/events/types.ts#L25)

___

### CadIntersection

Ƭ **CadIntersection**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `distanceToCamera` | `number` | Distance from the camera to the intersection. |
| `model` | [`CogniteCadModel`](../classes/cognite_reveal.CogniteCadModel.md) | The model that was intersected. |
| `point` | `THREE.Vector3` | Coordinate of the intersection. |
| `treeIndex` | `number` | Tree index of the intersected 3D node. |
| `type` | ``"cad"`` | The intersection type. |

#### Defined in

[packages/api/src/public/migration/types.ts:200](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/api/src/public/migration/types.ts#L200)

___

### CadModelBudget

Ƭ **CadModelBudget**: `Object`

Represents a measurement of how much geometry can be loaded.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `highDetailProximityThreshold` | `number` | Sectors within this distance from the camera will always be loaded in high details.  **`Deprecated`**  This is only used for 3D models processed prior to the Reveal 3.0 release (Q1 2022). |
| `maximumRenderCost` | `number` | Maximum render cost. This number can be thought of as triangle count, although the number doesn't match this directly. |

#### Defined in

[packages/cad-geometry-loaders/src/CadModelBudget.ts:10](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/cad-geometry-loaders/src/CadModelBudget.ts#L10)

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

[packages/camera-manager/src/types.ts:85](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/camera-manager/src/types.ts#L85)

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

[packages/utilities/src/CameraConfiguration.ts:8](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/utilities/src/CameraConfiguration.ts#L8)

___

### CameraControlsOptions

Ƭ **CameraControlsOptions**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `changeCameraTargetOnClick?` | `boolean` | Enables or disables change of camera target on mouse click. New target is then set to the point of the model under current cursor position.  Default is false. |
| `mouseWheelAction?` | ``"zoomToTarget"`` \| ``"zoomPastCursor"`` \| ``"zoomToCursor"`` | Sets mouse wheel initiated action.  Modes:  'zoomToTarget' - zooms just to the current target (center of the screen) of the camera.  'zoomPastCursor' - zooms in the direction of the ray coming from camera through cursor screen position, allows going through objects.  'zoomToCursor' - mouse wheel scroll zooms towards the point on the model where cursor is hovering over, doesn't allow going through objects.  Default is 'zoomPastCursor'. |

#### Defined in

[packages/camera-manager/src/types.ts:5](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/camera-manager/src/types.ts#L5)

___

### CameraEventDelegate

Ƭ **CameraEventDelegate**: [`CameraChangeDelegate`](cognite_reveal.md#camerachangedelegate) \| [`CameraStopDelegate`](cognite_reveal.md#camerastopdelegate)

Union type of all camera event delegates

#### Defined in

[packages/camera-manager/src/types.ts:96](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/camera-manager/src/types.ts#L96)

___

### CameraManagerEventType

Ƭ **CameraManagerEventType**: typeof [`CAMERA_MANAGER_EVENT_TYPE_LIST`](cognite_reveal.md#camera_manager_event_type_list)[`number`]

Union type of the supported camera manager event types

#### Defined in

[packages/camera-manager/src/types.ts:123](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/camera-manager/src/types.ts#L123)

___

### CameraState

Ƭ **CameraState**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `position?` | `THREE.Vector3` | Camera position in world space. |
| `rotation?` | `THREE.Quaternion` | Camera local rotation in quaternion form. |
| `target?` | `THREE.Vector3` | Camera target in world space. * |

#### Defined in

[packages/camera-manager/src/types.ts:66](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/camera-manager/src/types.ts#L66)

___

### CameraStopDelegate

Ƭ **CameraStopDelegate**: () => `void`

#### Type declaration

▸ (): `void`

##### Returns

`void`

#### Defined in

[packages/camera-manager/src/types.ts:91](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/camera-manager/src/types.ts#L91)

___

### ClippingPlanesState

Ƭ **ClippingPlanesState**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `constant` | `number` |
| `nx` | `number` |
| `ny` | `number` |
| `nz` | `number` |

#### Defined in

[packages/api/src/utilities/ViewStateHelper.ts:28](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/api/src/utilities/ViewStateHelper.ts#L28)

___

### CogniteModel

Ƭ **CogniteModel**: [`CogniteCadModel`](../classes/cognite_reveal.CogniteCadModel.md) \| [`CognitePointCloudModel`](../classes/cognite_reveal.CognitePointCloudModel.md)

Type abstraction for CogniteCadModel or CognitePointCloudModel;.

#### Defined in

[packages/api/src/public/types.ts:11](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/api/src/public/types.ts#L11)

___

### ComboControlsOptions

Ƭ **ComboControlsOptions**: `Object`

Exposed options for Combo Controls

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `EPSILON` | `number` | - |
| `dampingFactor` | `number` | - |
| `dollyFactor` | `number` | - |
| `dynamicTarget` | `boolean` | - |
| `enableDamping` | `boolean` | - |
| `enableKeyboardNavigation` | `boolean` | - |
| `firstPersonRotationFactor` | `number` | - |
| `keyboardDollySpeed` | `number` | - |
| `keyboardPanSpeed` | `number` | - |
| `keyboardRotationSpeedAzimuth` | `number` | - |
| `keyboardRotationSpeedPolar` | `number` | - |
| `keyboardSpeedFactor` | `number` | How much quicker keyboard navigation will be with 'shift' pressed |
| `lookAtViewTarget` | `boolean` | - |
| `maxAzimuthAngle` | `number` | Radians |
| `maxDeltaDownscaleCoefficient` | `number` | - |
| `maxDeltaRatio` | `number` | - |
| `maxPolarAngle` | `number` | Radians |
| `maxZoom` | `number` | - |
| `minAzimuthAngle` | `number` | Radians |
| `minDeltaDownscaleCoefficient` | `number` | - |
| `minDeltaRatio` | `number` | - |
| `minDistance` | `number` | - |
| `minPolarAngle` | `number` | Radians |
| `minZoom` | `number` | - |
| `minZoomDistance` | `number` | - |
| `mouseFirstPersonRotationSpeed` | `number` | - |
| `orthographicCameraDollyFactor` | `number` | - |
| `panDollyMinDistanceFactor` | `number` | - |
| `pinchEpsilon` | `number` | - |
| `pinchPanSpeed` | `number` | - |
| `pointerRotationSpeedAzimuth` | `number` | Radians per pixel |
| `pointerRotationSpeedPolar` | `number` | Radians per pixel |
| `useScrollTarget` | `boolean` | - |
| `zoomToCursor` | `boolean` | - |

#### Defined in

[packages/camera-manager/src/ComboControls.ts:46](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/camera-manager/src/ComboControls.ts#L46)

___

### CompletePointCloudAppearance

Ƭ **CompletePointCloudAppearance**: `Required`<[`PointCloudAppearance`](cognite_reveal.md#pointcloudappearance)\>

#### Defined in

[packages/pointcloud-styling/src/PointCloudAppearance.ts:12](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/pointcloud-styling/src/PointCloudAppearance.ts#L12)

___

### DisposedDelegate

Ƭ **DisposedDelegate**: () => `void`

#### Type declaration

▸ (): `void`

##### Returns

`void`

#### Defined in

[packages/utilities/src/events/types.ts:20](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/utilities/src/events/types.ts#L20)

___

### EdlOptions

Ƭ **EdlOptions**: `Object`

Configuration parameters for Eye Dome Lighting (EDL) point cloud post-processing effect.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `radius` | `number` | Radius of sampled points in pixels. Determines thickness of edges addet on top of points. |
| `strength` | `number` | Determines how pronounced the effect is. Lower values result in more transparent edges. |

#### Defined in

[packages/rendering/src/rendering/types.ts:22](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/rendering/src/rendering/types.ts#L22)

___

### GeometryFilter

Ƭ **GeometryFilter**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `boundingBox?` | `THREE.Box3` | The bounds to load geometry within. By default this box is in CDF coordinate space which will be transformed into coordinates relative to the model using the the model transformation which can be specified using [the CDF API](https://docs.cognite.com/api/v1/#operation/update3DRevisions), or set in [Cognite Fusion](https://fusion.cognite.com/).  **`See`**  [isBoundingBoxInModelCoordinates](cognite_reveal.md#isboundingboxinmodelcoordinates). |
| `isBoundingBoxInModelCoordinates?` | `boolean` | When set, the geometry filter `boundingBox` will be considered to be in "Reveal/ThreeJS space". Rather than CDF space which is the default. When using Reveal space, the model transformation which can be specified using [the CDF API](https://docs.cognite.com/api/v1/#operation/update3DRevisions), or set in [Cognite Fusion](https://fusion.cognite.com/). |

#### Defined in

[packages/cad-model/src/types.ts:21](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/cad-model/src/types.ts#L21)

___

### Intersection

Ƭ **Intersection**: [`CadIntersection`](cognite_reveal.md#cadintersection) \| [`PointCloudIntersection`](cognite_reveal.md#pointcloudintersection)

#### Defined in

[packages/api/src/public/migration/types.ts:227](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/api/src/public/migration/types.ts#L227)

___

### ModelState

Ƭ **ModelState**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `defaultNodeAppearance` | [`SerializableNodeAppearance`](cognite_reveal.md#serializablenodeappearance) |
| `modelId` | `number` |
| `revisionId` | `number` |
| `styledSets` | { `appearance`: [`SerializableNodeAppearance`](cognite_reveal.md#serializablenodeappearance) ; `options?`: `any` ; `state`: `any` ; `token`: `string`  }[] |

#### Defined in

[packages/api/src/utilities/ViewStateHelper.ts:35](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/api/src/utilities/ViewStateHelper.ts#L35)

___

### NodeAppearance

Ƭ **NodeAppearance**: `Object`

Type for defining node appearance profiles to style a 3D CAD model.

**`See`**

[DefaultNodeAppearance](cognite_reveal.md#defaultnodeappearance)

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `color?` | `Color` | Overrides the default color of the node in RGB. Black, or `new Color(0, 0, 0)` means no override. |
| `outlineColor?` | [`NodeOutlineColor`](../enums/cognite_reveal.NodeOutlineColor.md) | When set, an outline is drawn around the node to make it stand out. |
| `prioritizedForLoadingHint?` | `number` | When provided, this value can be used to prioritize certain areas of the 3D model to be loaded. This can be useful to prioritize key objects in the 3D model to always be loaded.  When non-zero, sectors containing geometry in the vicinity of the prioritized sectors are given an *extra* priority. Recommended values are in range 1 (somewhat higher priority to be loaded) to 10 (very likely to be loaded). Usually values around 4-5 is recommended.  Prioritized nodes are loaded at the expense of non-prioritized areas. There are no guarantees that the nodes are actually loaded, and the more prioritized areas/nodes provided, the less likely it is that the hint is obeyed.  Extra priority doesn't accumulate when sectors are prioritized because they intersect/contain several nodes.  **This is an advanced feature and not recommended for most users**  **`Version`**  Only works with 3D models converted later than Q4 2021. |
| `renderGhosted?` | `boolean` | When set to true, the node is rendered ghosted, i.e. transparent with a fixed color. This has no effect if [renderInFront](cognite_reveal.md#renderinfront) is `true`. |
| `renderInFront?` | `boolean` | When set to true, the node is rendered in front of all other nodes even if it's occluded. Note that this take precedence over [renderGhosted](cognite_reveal.md#renderghosted). |
| `visible?` | `boolean` | Overrides the visibility of the node. |

#### Defined in

[packages/cad-styling/src/NodeAppearance.ts:22](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/cad-styling/src/NodeAppearance.ts#L22)

___

### NodeCollectionSerializationContext

Ƭ **NodeCollectionSerializationContext**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `client` | `CogniteClient` |
| `model` | [`CdfModelNodeCollectionDataProvider`](../interfaces/cognite_reveal.CdfModelNodeCollectionDataProvider.md) |

#### Defined in

[packages/cad-styling/src/NodeCollectionDeserializer.ts:22](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/cad-styling/src/NodeCollectionDeserializer.ts#L22)

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

[packages/api/src/public/migration/types.ts:24](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/api/src/public/migration/types.ts#L24)

___

### PointCloudAppearance

Ƭ **PointCloudAppearance**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `color?` | `Color` |
| `visible?` | `boolean` |

#### Defined in

[packages/pointcloud-styling/src/PointCloudAppearance.ts:7](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/pointcloud-styling/src/PointCloudAppearance.ts#L7)

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

[packages/pointclouds/src/PointCloudBudget.ts:10](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/pointclouds/src/PointCloudBudget.ts#L10)

___

### PointCloudIntersection

Ƭ **PointCloudIntersection**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `annotationId` | `number` | Annotation Id of the intersected object within a pointcloud. (0 if not applicable) |
| `distanceToCamera` | `number` | Distance from the camera to the intersection. |
| `model` | [`CognitePointCloudModel`](../classes/cognite_reveal.CognitePointCloudModel.md) | The model that was intersected. |
| `point` | `THREE.Vector3` | Tree index of the intersected 3D node. |
| `pointIndex` | `number` | The index of the point that was intersected. |
| `type` | ``"pointcloud"`` | The intersection type. |

#### Defined in

[packages/pointclouds/src/PointCloudIntersection.ts:6](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/pointclouds/src/PointCloudIntersection.ts#L6)

___

### PointCloudObjectMetadata

Ƭ **PointCloudObjectMetadata**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `annotationId` | `number` |
| `assetId?` | `number` |
| `boundingBox` | `Box3` |

#### Defined in

[packages/data-providers/src/pointcloud-stylable-object-providers/types.ts:16](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/data-providers/src/pointcloud-stylable-object-providers/types.ts#L16)

___

### PointerEventData

Ƭ **PointerEventData**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `button?` | `number` |
| `offsetX` | `number` |
| `offsetY` | `number` |

#### Defined in

[packages/utilities/src/events/types.ts:15](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/utilities/src/events/types.ts#L15)

___

### PointerEventDelegate

Ƭ **PointerEventDelegate**: (`event`: [`PointerEventData`](cognite_reveal.md#pointereventdata)) => `void`

#### Type declaration

▸ (`event`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | [`PointerEventData`](cognite_reveal.md#pointereventdata) |

##### Returns

`void`

#### Defined in

[packages/utilities/src/events/types.ts:9](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/utilities/src/events/types.ts#L9)

___

### PropertyFilterNodeCollectionOptions

Ƭ **PropertyFilterNodeCollectionOptions**: `Object`

Options for [PropertyFilterNodeCollection](../classes/cognite_reveal.PropertyFilterNodeCollection.md).

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `requestPartitions?` | `number` | How many partitions to split the request into. More partitions can yield better performance for queries with very large result set (in order of magnitude 100.000 plus). Defaults to 1. |

#### Defined in

[packages/cad-styling/src/PropertyFilterNodeCollection.ts:17](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/cad-styling/src/PropertyFilterNodeCollection.ts#L17)

___

### SceneRenderedDelegate

Ƭ **SceneRenderedDelegate**: (`event`: { `camera`: `THREE.PerspectiveCamera` ; `frameNumber`: `number` ; `renderTime`: `number` ; `renderer`: `THREE.WebGLRenderer`  }) => `void`

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

[packages/utilities/src/events/types.ts:35](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/utilities/src/events/types.ts#L35)

___

### SerializableNodeAppearance

Ƭ **SerializableNodeAppearance**: `Object`

Type that represents a [NodeAppearance](cognite_reveal.md#nodeappearance) in a serializable format

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `color?` | [`number`, `number`, `number`] | Color as an RGB number tuple, with values in the range [0, 255] |
| `outlineColor?` | [`NodeOutlineColor`](../enums/cognite_reveal.NodeOutlineColor.md) | Outline color,  **`See`**  [NodeAppearance](cognite_reveal.md#nodeappearance) |
| `prioritizedForLoadingHint?` | `number` | Prioritized loading hint,  **`See`**  [NodeAppearance](cognite_reveal.md#nodeappearance) |
| `renderGhosted?` | `boolean` | Whether to render ghosted,  **`See`**  [NodeAppearance](cognite_reveal.md#nodeappearance) |
| `renderInFront?` | `boolean` | Whether to render in front,  **`See`**  [NodeAppearance](cognite_reveal.md#nodeappearance) |
| `visible?` | `boolean` | Visibility,  **`See`**  [NodeAppearance](cognite_reveal.md#nodeappearance) |

#### Defined in

[packages/cad-styling/src/NodeAppearance.ts:77](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/cad-styling/src/NodeAppearance.ts#L77)

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

[packages/cad-styling/src/SerializedNodeCollection.ts:4](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/cad-styling/src/SerializedNodeCollection.ts#L4)

___

### SupportedModelTypes

Ƭ **SupportedModelTypes**: ``"pointcloud"`` \| ``"cad"``

#### Defined in

[packages/model-base/src/SupportedModelTypes.ts:4](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/model-base/src/SupportedModelTypes.ts#L4)

___

### ViewerState

Ƭ **ViewerState**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `camera?` | { `position`: { `x`: `number` ; `y`: `number` ; `z`: `number`  } ; `target`: { `x`: `number` ; `y`: `number` ; `z`: `number`  }  } |
| `camera.position` | { `x`: `number` ; `y`: `number` ; `z`: `number`  } |
| `camera.position.x` | `number` |
| `camera.position.y` | `number` |
| `camera.position.z` | `number` |
| `camera.target` | { `x`: `number` ; `y`: `number` ; `z`: `number`  } |
| `camera.target.x` | `number` |
| `camera.target.y` | `number` |
| `camera.target.z` | `number` |
| `clippingPlanes?` | [`ClippingPlanesState`](cognite_reveal.md#clippingplanesstate)[] |
| `models?` | [`ModelState`](cognite_reveal.md#modelstate)[] |

#### Defined in

[packages/api/src/utilities/ViewStateHelper.ts:19](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/api/src/utilities/ViewStateHelper.ts#L19)

___

### WellKnownUnit

Ƭ **WellKnownUnit**: ``"Meters"`` \| ``"Centimeters"`` \| ``"Millimeters"`` \| ``"Micrometers"`` \| ``"Kilometers"`` \| ``"Feet"`` \| ``"Inches"`` \| ``"Yards"`` \| ``"Miles"`` \| ``"Mils"`` \| ``"Microinches"``

Units supported by [CogniteCadModel](../classes/cognite_reveal.CogniteCadModel.md).

#### Defined in

[packages/cad-model/src/types.ts:8](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/cad-model/src/types.ts#L8)

## Variables

### CAMERA\_MANAGER\_EVENT\_TYPE\_LIST

• `Const` **CAMERA\_MANAGER\_EVENT\_TYPE\_LIST**: readonly [``"cameraChange"``, ``"cameraStop"``]

List of supported event types (adapted from https://stackoverflow.com/questions/44480644/string-union-to-string-array)

#### Defined in

[packages/camera-manager/src/types.ts:118](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/camera-manager/src/types.ts#L118)

___

### CDF\_TO\_VIEWER\_TRANSFORMATION

• `Const` **CDF\_TO\_VIEWER\_TRANSFORMATION**: `Matrix4` = `cadFromCdfToThreeMatrix`

The transformation matrix from CDF coordinates to ThreeJS/Reveal.
Note that this is already applied to [CogniteCadModel](../classes/cognite_reveal.CogniteCadModel.md) and [CognitePointCloudModel](../classes/cognite_reveal.CognitePointCloudModel.md)
automatically, as it is factored into the matrix returned from e.g.
the [getCdfToDefaultModelTransformation](../classes/cognite_reveal.CogniteCadModel.md#getcdftodefaultmodeltransformation) method.

#### Defined in

[packages/api/src/public/constants.ts:15](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/api/src/public/constants.ts#L15)

___

### DefaultNodeAppearance

• `Const` **DefaultNodeAppearance**: `Object`

A set of default node appearances used in Reveal.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `Default` | [`NodeAppearance`](cognite_reveal.md#nodeappearance) |
| `Ghosted` | [`NodeAppearance`](cognite_reveal.md#nodeappearance) |
| `Hidden` | [`NodeAppearance`](cognite_reveal.md#nodeappearance) |
| `Highlighted` | { `color?`: `Color` ; `outlineColor?`: [`NodeOutlineColor`](../enums/cognite_reveal.NodeOutlineColor.md) ; `prioritizedForLoadingHint?`: `number` ; `renderGhosted?`: `boolean` ; `renderInFront?`: `boolean` ; `visible?`: `boolean`  } |
| `Highlighted.color?` | `Color` |
| `Highlighted.outlineColor?` | [`NodeOutlineColor`](../enums/cognite_reveal.NodeOutlineColor.md) |
| `Highlighted.prioritizedForLoadingHint?` | `number` |
| `Highlighted.renderGhosted?` | `boolean` |
| `Highlighted.renderInFront?` | `boolean` |
| `Highlighted.visible?` | `boolean` |
| `InFront` | [`NodeAppearance`](cognite_reveal.md#nodeappearance) |
| `Outlined` | [`NodeAppearance`](cognite_reveal.md#nodeappearance) |

#### Defined in

[packages/cad-styling/src/NodeAppearance.ts:142](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/cad-styling/src/NodeAppearance.ts#L142)

___

### DefaultPointCloudAppearance

• `Const` **DefaultPointCloudAppearance**: [`CompletePointCloudAppearance`](cognite_reveal.md#completepointcloudappearance)

#### Defined in

[packages/pointcloud-styling/src/PointCloudAppearance.ts:14](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/pointcloud-styling/src/PointCloudAppearance.ts#L14)

___

### REVEAL\_VERSION

• `Const` **REVEAL\_VERSION**: `string` = `process.env.VERSION`

#### Defined in

[packages/api/index.ts:12](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/api/index.ts#L12)

## Functions

### registerNodeCollectionType

▸ **registerNodeCollectionType**<`T`\>(`nodeCollectionTypeName`, `deserializer`): `void`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`NodeCollection`](../classes/cognite_reveal.NodeCollection.md)<`T`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `nodeCollectionTypeName` | `string` |
| `deserializer` | (`descriptor`: [`SerializedNodeCollection`](cognite_reveal.md#serializednodecollection), `context`: [`NodeCollectionSerializationContext`](cognite_reveal.md#nodecollectionserializationcontext)) => `Promise`<`T`\> |

#### Returns

`void`

#### Defined in

[packages/cad-styling/src/NodeCollectionDeserializer.ts:156](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/cad-styling/src/NodeCollectionDeserializer.ts#L156)
