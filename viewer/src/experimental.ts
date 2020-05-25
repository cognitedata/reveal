/*!
 * Copyright 2020 Cognite AS
 */

// Everything that is exposed to the user should be defined here

export { RevealManager } from './public/RevealManager';
export { LocalHostRevealManager } from './public/LocalHostRevealManager';
export { RenderManager } from './public/RenderManager';
// TODO 2020-05-15 larsmoa: reveal.CadNode is _internal_ and should not be exported
export { CadNode } from './dataModels/cad/';
export { ModelNodeAppearance } from './dataModels/cad/';

// CAD
export { CadModelMetadata } from './dataModels/cad/';
export { SectorMetadata, SectorModelTransformation } from './dataModels/cad/sector/types';
export { CadRenderHints } from './dataModels/cad/rendering/CadRenderHints';
export { CadLoadingHints } from './dataModels/cad/CadLoadingHints';
export { intersectCadNodes } from './dataModels/cad/picking';
// Point cloud
export { PointCloudModel, createPointCloudModel, createLocalPointCloudModel } from './dataModels/point-cloud';

// Internals
import * as internal from './internal';
export { internal };

// Utilities
import * as utilities from './utilities';
export { utilities };
