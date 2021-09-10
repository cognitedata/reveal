/*!
 * Copyright 2021 Cognite AS
 */

export { RevealManager } from './public/RevealManager';
export { createLocalRevealManager, createCdfRevealManager } from './public/createRevealManager';

// CAD
export { CadLoadingHints } from './datamodels/cad/CadLoadingHints';
export { intersectCadNodes } from './datamodels/cad/picking';
export { DetermineSectorsInput } from './datamodels/cad/sector/culling/types';
export { SectorCuller } from './datamodels/cad/sector/culling/SectorCuller';
export { ByVisibilityGpuSectorCuller } from './datamodels/cad/sector/culling/ByVisibilityGpuSectorCuller';
export { GpuOrderSectorsByVisibilityCoverage } from './datamodels/cad/sector/culling/OrderSectorsByVisibilityCoverage';
export { CadModelSectorLoadStatistics } from './datamodels/cad/CadModelSectorLoadStatistics';
export { NodeAppearance, DefaultNodeAppearance } from './datamodels/cad/NodeAppearance';
export { NodeAppearanceProvider } from './datamodels/cad/styling/NodeAppearanceProvider';

export { CadModelMetadata, SectorMetadata } from '@reveal/cad-parsers';
export { CadNode, SuggestedCameraConfig } from './datamodels/cad/CadNode';

export { WantedSector } from './datamodels/cad/sector/types';

export { LevelOfDetail } from './datamodels/cad/sector/LevelOfDetail';

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

export { revealEnv } from '@reveal/utilities';
