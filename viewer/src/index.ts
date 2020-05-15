/*!
 * Copyright 2020 Cognite AS
 */

// Everything that is exposed to the user should be defined here

// CAD
export { CadModelMetadata } from './dataModels/cad/internal';
export { SectorMetadata, SectorModelTransformation } from './dataModels/cad/internal/sector/types';
export { CadRenderHints } from './dataModels/cad/public/CadRenderHints';
export { CadLoadingHints } from './dataModels/cad/public/CadLoadingHints';

// Point cloud
export { PointCloudModel, createPointCloudModel, createLocalPointCloudModel } from './dataModels/pointCloud';

// ThreeJS migration layer
import * as migration from './migration';
export { migration };

// Internals
import * as internal from './internal';
export { internal };

// Note! ThreeJS is in a separate folder to ensure it's imported as '@cognite/reveal/threejs'.
