/*!
 * Copyright 2020 Cognite AS
 */

import { traverseDepthFirst } from '@/utilities/traversal';
import { SectorMetadata } from '@/dataModels/cad/sector/types';
import { SectorScene, SectorSceneImpl } from '@/dataModels/cad/sector/SectorScene';

export function createSceneFromRoot(root: SectorMetadata): SectorScene {
  const sectors = new Map<number, SectorMetadata>();
  traverseDepthFirst(root, sector => {
    sectors.set(sector.id, sector);
    return true;
  });
  return new SectorSceneImpl(8, 1024, root, sectors);
}
