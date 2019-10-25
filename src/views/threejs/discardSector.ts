/*!
 * Copyright 2019 Cognite AS
 */

import { LoadSectorRequest } from '../../sector/types';
import { SectorNode } from './SectorNode';

export function discardSector(sectorId: number, request: LoadSectorRequest | undefined, sectorNode: SectorNode) {
  if (request) {
    request.cancel();
  }
  sectorNode.remove(...sectorNode.children.filter(x => !(x instanceof SectorNode)));
}
