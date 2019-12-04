/*!
 * Copyright 2019 Cognite AS
 */

import { ConsumeSectorDelegate, DiscardSectorDelegate } from '../models/sector/delegates';
import { Sector, SectorQuads } from '../models/sector/types';

// TODO 20191030 larsmoa: Unit test `createLazyConsumeAndDiscard`

/**
 * Create functions for consuming and discarding high- and low-detail sectors. This function is used to
 * cooridnate between low- and high-detail loading to ensure smooth transistions between high and low detail
 * views.
 *
 * @param discardSector       Delegate for discarding a loaded "high detail (detailed) or low detail (simple) sector" .
 * @param consumeSector       Delegate for consuming (e.g. creating a renderable) for a "high detail (detailed) sector".
 * @param consumeSectorQuads  Delegate for consuming (e.g. creating a renderable) for a "low detail (simple) sector".
 * @see consumeSectorDetailed
 * @see consumeSectorSimple
 * @see discardSector
 */
export function createSyncedConsumeAndDiscard(
  discardSector: DiscardSectorDelegate,
  consumeSector: ConsumeSectorDelegate<Sector>,
  consumeSectorQuads: ConsumeSectorDelegate<SectorQuads>
): [DiscardSectorDelegate, ConsumeSectorDelegate<Sector>, ConsumeSectorDelegate<SectorQuads>] {
  const activeDetailed = new Set<number>();
  const activeSimple = new Set<number>();
  const discardSectorFinal: DiscardSectorDelegate = (sectorId, request) => {
    activeSimple.delete(sectorId);
    activeDetailed.delete(sectorId);
  };
  const consumeSectorFinal: ConsumeSectorDelegate<Sector> = (sectorId, sector) => {
    activeDetailed.add(sectorId);
    if (!activeSimple.has(sectorId)) {
      // TODO get rid of undefined
      discardSector(sectorId, undefined);
    }
    consumeSector(sectorId, sector);
  };
  const consumeSectorQuadsFinal: ConsumeSectorDelegate<SectorQuads> = (sectorId, sector) => {
    activeSimple.add(sectorId);
    if (!activeDetailed.has(sectorId)) {
      // TODO get rid of undefined
      discardSector(sectorId, undefined);
    }
    consumeSectorQuads(sectorId, sector);
  };
  return [discardSectorFinal, consumeSectorFinal, consumeSectorQuadsFinal];
}
