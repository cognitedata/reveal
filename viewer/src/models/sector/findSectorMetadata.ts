/*!
 * Copyright 2019 Cognite AS
 */

import { SectorMetadata } from './types';
import { traverseDepthFirst } from '../../utils/traversal';

export function findSectorMetadata(root: SectorMetadata, sectorId: number): SectorMetadata {
  let foundSector: SectorMetadata | null = null;
  traverseDepthFirst(root, sector => {
    if (sector.id === sectorId) {
      foundSector = sector;
    }
    return !foundSector;
  });
  if (!foundSector) {
    throw new Error(`Could not find metadata for sector ${sectorId} - invalid id?`);
  }
  return foundSector;
}
