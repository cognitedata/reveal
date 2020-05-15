/*!
 * Copyright 2020 Cognite AS
 */

// Everything that is exposed to the user should be defined here

export { RevealManager } from './public/RevealManager';
// TODO 2020-05-15 larsmoa: CadNode is _internal_ and should not be exported
export { CadNode } from './dataModels/cad/internal/CadNode';
export { ModelNodeAppearance } from './dataModels/cad/internal/ModelNodeAppearance';

// CAD
export { CadModel, loadCadModelFromCdf, loadCadModelByUrl } from './dataModels/cad/internal';
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

// Utilities
import * as utilities from './utilities';
export { utilities };
