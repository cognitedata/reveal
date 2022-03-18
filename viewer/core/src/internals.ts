/*!
 * Copyright 2021 Cognite AS
 */

export { CdfModelIdentifier, LocalModelIdentifier, ModelIdentifier, File3dFormat } from '@reveal/modeldata-api';
export { RevealManager } from './public/RevealManager';
export { createLocalRevealManager, createCdfRevealManager } from './public/createRevealManager';

// CAD
export { CadModelSectorLoadStatistics, intersectCadNodes } from '@reveal/cad-model';

// Point cloud
// TODO move these types into potree-core as TypeScript definitions and remove them from here
export {
  PotreePointShape,
  PotreePointColorType,
  PotreePointSizeType,
  WellKnownAsprsPointClassCodes,
  PotreeNodeWrapper,
  PotreeGroupWrapper,
  PointCloudNode,
  PointCloudMetadata,
  Potree,
  PointCloudOctree,
} from '@reveal/pointclouds';

// Utilities
import * as utilities from './utilities';
export { utilities };
