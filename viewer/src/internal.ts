/*!
 * Copyright 2020 Cognite AS
 */

// TODO potentially private types
export { FetchSectorDelegate, FetchCtmDelegate } from './dataModels/cad/internal/sector/delegates';

// TODO move these types into potree-core as TypeScript definitions and remove them from here
export { PotreePointColorType, PotreePointShape } from './dataModels/pointCloud/internal/enums';
export { PotreeNodeWrapper } from './dataModels/pointCloud/internal/PotreeNodeWrapper';
export { PotreeGroupWrapper } from './dataModels/pointCloud/internal/PotreeGroupWrapper';

export { suggestCameraConfig } from './utilities/cameraUtils';
export { traverseDepthFirst, traverseUpwards } from './utilities/traversal';
export {
    determineSectorsByProximity,
    DetermineSectorsByProximityInput
} from './dataModels/cad/internal/sector/culling/determineSectors';
export { WantedSector } from './dataModels/cad/internal/sector/WantedSector';
export { LevelOfDetail } from './dataModels/cad/internal/sector/LevelOfDetail';

export { SectorCuller } from './dataModels/cad/internal/sector/culling/SectorCuller';
export { ProximitySectorCuller } from './dataModels/cad/internal/sector/culling/ProximitySectorCuller';
export { ByVisibilityGpuSectorCuller } from './dataModels/cad/internal/sector/culling/ByVisibilityGpuSectorCuller';
