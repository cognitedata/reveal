/*!
 * Copyright 2021 Cognite AS
 */

// entry point for everything that is available (@cognite/reveal)

/**
 * @module @cognite/reveal
 */

export * from './packages/api/';

export {
  CameraControlsOptions,
  DefaultCameraManager,
  CameraManagerHelper,
  CameraManager,
  CameraState,
  ComboControls,
  CameraChangeDelegate
} from './packages/camera-manager';

export {
  AreaCollection,
  ClusteredAreaCollection,
  NodeAppearanceProvider,
  NodeAppearance,
  NodeOutlineColor,
  DefaultNodeAppearance,
  NodeCollection,
  TreeIndexNodeCollection,
  IntersectionNodeCollection,
  UnionNodeCollection,
  SerializedNodeCollection,
  PropertyFilterNodeCollection,
  SinglePropertyFilterNodeCollection,
  AssetNodeCollection,
  InvertedNodeCollection,
  registerCustomNodeCollectionType,
  TypeName,
  NodeCollectionDescriptor,
  NodeCollectionSerializationContext,
  CdfModelNodeCollectionDataProvider
} from './packages/cad-styling';

export { CogniteModelBase, SupportedModelTypes } from './packages/model-base';

export {
  revealEnv,
  IndexSet,
  NumericRange,
  SceneRenderedDelegate,
  PointerEventDelegate,
  DisposedDelegate
} from './packages/utilities';

export { Cognite3DModel, BoundingBoxClipper, GeometryFilter, WellKnownUnit } from './packages/cad-model';
export { CognitePointCloudModel } from './packages/pointclouds';

//INTERNAL
export { LoadingState } from './packages/model-base';

export { CadModelMetadata, SectorMetadata, LevelOfDetail, WantedSector } from './packages/cad-parsers';

export { SectorCuller } from './packages/cad-geometry-loaders';

export { PotreeGroupWrapper, PotreeNodeWrapper, PointCloudNode, Potree } from './packages/pointclouds';

export { CadNode } from './packages/cad-model';

export { RevealManager } from './packages/api/src/public/RevealManager';
export { createLocalRevealManager, createCdfRevealManager } from './packages/api/src/public/createRevealManager';

export { LocalModelIdentifier, CdfModelIdentifier } from './packages/modeldata-api';

export { RenderOptions, defaultRenderOptions } from './packages/rendering';

export { SceneHandler } from './packages/utilities';

//TOOLS
export * from './packages/tools';

//EXTENSIONS
export { DataSource } from './packages/data-source';
export { NodesApiClient } from './packages/nodes-api';
export {
  ModelIdentifier,
  ModelMetadataProvider,
  ModelDataProvider,
  BlobOutputMetadata,
  File3dFormat
} from './packages/modeldata-api';
