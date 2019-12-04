/*!
 * Copyright 2019 Cognite AS
 */

import { SectorMetadata } from '../../models/sector/types';
import Cesium from 'cesium';
import { traverseDepthFirst } from '../../utils/traversal';

// TODO 2019-11-06 larsmoa: Remove this file (unused)
export function buildScene(
  rootSector: SectorMetadata,
  primitivesCollection: Cesium.PrimitiveCollection,
  sectorPrimtivesMap: Map<number, Cesium.Primitive>
) {
  traverseDepthFirst(rootSector, sector => {
    const primitive = new Cesium.Primitive({
      id: `Sector ${sector.path}`
    } as any);
    sectorPrimtivesMap.set(sector.id, primitive);
    primitivesCollection.add(primitive);
    return true;
  });
}
