/*!
 * Copyright 2020 Cognite AS
 */

// Everything that is exposed to the user should be defined here

// CAD
export { CadModel, loadCadModelFromCdf, loadCadModelByUrl } from './dataModels/cad/';
export { SectorMetadata } from './models/cad/types';
export { CadRenderHints } from './views/CadRenderHints';
export { CadLoadingHints } from './models/cad/CadLoadingHints';

// Point cloud
export { PointCloudModel, createPointCloudModel, createLocalPointCloudModel } from './dataModels/pointCloud';

// ThreeJS migration layer
import * as migration from './migration';
export { migration };

// Internals
import * as internal from './internal';
export { internal };

// Note! ThreeJS is in a separate folder to ensure it's imported as '@cognite/reveal/threejs'.
