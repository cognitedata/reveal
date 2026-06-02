/*!
 * Copyright 2022 Cognite AS
 */

/**
 * @module @cognite/reveal
 */

export * from '../packages/api/';

export type {
  CameraControlsOptions,
  CameraManagerEventType,
  CameraManager,
  CameraState,
  ComboControlsOptions,
  ComboControlsEventType,
  CameraEventDelegate,
  CameraChangeDelegate,
  CameraStopDelegate,
  IFlexibleCameraManager,
  FlexibleControlsTypeChangeDelegate
} from '../packages/camera-manager';
export {
  CAMERA_MANAGER_EVENT_TYPE_LIST,
  DebouncedCameraStopEventTrigger,
  DefaultCameraManager,
  isDefaultCameraManager,
  CameraManagerHelper,
  ComboControls,
  FlexibleControlsOptions,
  FlexibleWheelZoomType,
  FlexibleControlsType,
  FlexibleMouseActionType,
  isFlexibleCameraManager
} from '../packages/camera-manager';

export type {
  AreaCollection,
  NodeAppearance,
  SerializableNodeAppearance,
  SerializedNodeCollection,
  PropertyFilterNodeCollectionOptions,
  NodeCollectionSerializationContext,
  CdfModelNodeCollectionDataProvider
} from '../packages/cad-styling';
export {
  ClusteredAreaCollection,
  NodeOutlineColor,
  DefaultNodeAppearance,
  NodeCollection,
  CdfNodeCollectionBase,
  CombineNodeCollectionBase,
  TreeIndexNodeCollection,
  NodeIdNodeCollection,
  IntersectionNodeCollection,
  UnionNodeCollection,
  PropertyFilterNodeCollection,
  SinglePropertyFilterNodeCollection,
  AssetNodeCollection,
  InvertedNodeCollection,
  registerNodeCollectionType
} from '../packages/cad-styling';

export type { SupportedModelTypes } from '../packages/model-base';

export type {
  BeforeSceneRenderedDelegate,
  SceneRenderedDelegate,
  PointerEventDelegate,
  PointerEventData,
  DisposedDelegate,
  DMInstanceRef,
  ICustomObject,
  CustomObjectIntersection
} from '../packages/utilities';
export {
  IndexSet,
  NumericRange,
  CustomObject,
  CustomObjectIntersectInput,
  PointerEventsTarget,
  PointerEvents,
  Vector3Pool,
  getWheelEventDelta,
  getNormalizedPixelCoordinatesBySize,
  getNormalizedPixelCoordinates,
  isPointVisibleByPlanes,
  ClosestGeometryFinder,
  CDF_TO_VIEWER_TRANSFORMATION
} from '../packages/utilities';

export type {
  PointCloudObjectMetadata,
  CoreDmImage360Annotation,
  ImageAssetLinkAnnotationInfo,
  ImageInstanceLinkAnnotationInfo,
  Image360DataModelIdentifier,
  Image360BaseIdentifier,
  Image360CoreDataModelIdentifier,
  Image360LegacyDataModelIdentifier,
  Image360Id,
  Image360RevisionId,
  DataSourceType,
  ClassicDataSourceType,
  DMDataSourceType,
  ClassicModelIdentifierType,
  DMModelIdentifierType,
  CommonModelOptions,
  InstanceReference
} from '../packages/data-providers';
export { isDMPointCloudVolume, isClassicPointCloudVolume, File3dFormat } from '../packages/data-providers';

export type { GeometryFilter, WellKnownUnit } from '../packages/cad-model';
export { CogniteCadModel, BoundingBoxClipper } from '../packages/cad-model';

export { CognitePointCloudModel, isDMPointCloudModel, isClassicPointCloudModel } from '../packages/pointclouds';

export type { CompletePointCloudAppearance, PointCloudAppearance } from '../packages/pointcloud-styling';
export {
  PointCloudObjectCollection,
  PointCloudAnnotationVolumeCollection,
  AnnotationIdPointCloudObjectCollection,
  PointCloudDMVolumeCollection,
  DefaultPointCloudAppearance,
  StyledPointCloudObjectCollection,
  StyledPointCloudVolumeCollection
} from '../packages/pointcloud-styling';

export type {
  AssetAnnotationImage360Info,
  Image360,
  Image360Revision,
  Image360Visualization,
  Image360Collection,
  Image360EnteredDelegate,
  Image360ExitedDelegate,
  Image360IconStyle,
  Image360AnnotationIntersection,
  Image360AnnotationAppearance,
  Image360Annotation,
  Image360AnnotationAssetFilter,
  Image360AnnotationAssetQueryResult,
  Image360AnnotationFilterOptions,
  InstanceLinkable360ImageAnnotationType,
  Image360AnnotationInstanceReference,
  AssetHybridAnnotationImage360Info
} from '../packages/360-images';
export { Image360Action } from '../packages/360-images';

export type {
  OverlayCollection,
  Overlay3DCollectionOptions,
  OverlayInfo,
  Overlay3D,
  DefaultOverlay3DContentType
} from '../packages/3d-overlays';
export { Overlay3DCollection } from '../packages/3d-overlays';
