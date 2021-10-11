/*!
 * Copyright 2021 Cognite AS
 */

export { RevealManager } from './public/RevealManager';
export { createLocalRevealManager, createCdfRevealManager } from './public/createRevealManager';

export { CadModelMetadata, SectorMetadata, LevelOfDetail, WantedSector } from '@reveal/cad-parsers';
export {
  CadLoadingHints,
  CadNode,
  SuggestedCameraConfig,
  SectorCuller,
  DetermineSectorsInput,
  ByVisibilityGpuSectorCuller,
  GpuOrderSectorsByVisibilityCoverage
} from '@reveal/cad-geometry-loaders';
export { NodeAppearance, DefaultNodeAppearance, NodeAppearanceProvider } from '@reveal/cad-styling';
export { revealEnv } from '@reveal/utilities';

// CAD
export { intersectCadNodes } from './datamodels/cad/picking';
export { CadModelSectorLoadStatistics } from './datamodels/cad/CadModelSectorLoadStatistics';

// Point cloud
export { PointCloudMetadata } from './datamodels/pointcloud';
// TODO move these types into potree-core as TypeScript definitions and remove them from here
export * from './datamodels/pointcloud/types';
export { PotreeNodeWrapper } from './datamodels/pointcloud/PotreeNodeWrapper';
export { PotreeGroupWrapper } from './datamodels/pointcloud/PotreeGroupWrapper';
export { PointCloudNode } from './datamodels/pointcloud/PointCloudNode';

// Utilities
import * as utilities from './utilities';
export { utilities };
