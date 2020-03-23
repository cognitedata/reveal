/*!
 * Copyright 2020 Cognite AS
 */

import { traverseDepthFirst } from '../../utils/traversal';
import { SectorSceneImpl, SectorMetadata, SectorScene } from '../../models/cad/types';

export function createSceneFromRoot(root: SectorMetadata): SectorScene {
  const sectors = new Map<number, SectorMetadata>();
  traverseDepthFirst(root, sector => {
    sectors.set(sector.id, sector);
    return true;
  });
  return new SectorSceneImpl(8, 1024, root, sectors);
}
