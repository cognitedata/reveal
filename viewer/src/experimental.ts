/*!
 * Copyright 2020 Cognite AS
 */

// Everything that is exposed to the user should be defined here

export { RevealManager } from './public/RevealManager';
export { LocalHostRevealManager } from './public/LocalHostRevealManager';
export { RenderManager } from './public/RenderManager';
// TODO 2020-05-15 larsmoa: reveal.CadNode is _internal_ and should not be exported
export { CadNode } from './datamodels/cad';
export { ModelNodeAppearance } from './datamodels/cad/';

// CAD
export { CadModelMetadata, SsaoEffect, SsaoPassType } from './datamodels/cad/';
export { SectorMetadata, SectorModelTransformation } from './datamodels/cad/sector/types';
export { CadRenderHints } from './datamodels/cad/rendering/CadRenderHints';
export { CadLoadingHints } from './datamodels/cad/CadLoadingHints';
export { intersectCadNodes } from './datamodels/cad/picking';

// Point cloud
export { PointCloudModel, createPointCloudModel, createLocalPointCloudModel } from './datamodels/pointCloud';

// Internals
import * as internal from './internal';
export { internal };

// Utilities
import * as utilities from './utilities';
export { utilities };
