/*!
 * Copyright 2019 Cognite AS
 */

import { SectorNode } from './SectorNode';

export function discardSector(sectorId: number, sectorNode: SectorNode) {
  sectorNode.remove(...sectorNode.children.filter(x => !(x instanceof SectorNode)));
}
