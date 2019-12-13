/*!
 * Copyright 2019 Cognite AS
 */

import { SectorNode } from './SectorNode';
import { SectorMetadata } from '../../../models/sector/types';

export function buildScene(sector: SectorMetadata, parent: SectorNode, sectorNodeMap: Map<number, SectorNode>) {
  const sectorGroup = new SectorNode({ modelTransformation: parent.modelTransformation });
  sectorGroup.name = `Sector ${sector.id}`;
  parent.add(sectorGroup);
  sectorNodeMap.set(sector.id, sectorGroup);
  for (const child of sector.children) {
    buildScene(child, sectorGroup, sectorNodeMap);
  }
}
