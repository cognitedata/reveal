/*!
 * Copyright 2019 Cognite AS
 */

import { setUnion, setDifference } from '../utils/setUtils';
import { loadSector } from './loadSector';
import { DiscardSectorDelegate, ConsumeSectorDelegate, FetchSectorDelegate, ParseSectorDelegate } from './delegates';
import { LoadSectorRequest } from './types';

export function initializeSectorLoader(
  fetchSector: FetchSectorDelegate,
  parseSector: ParseSectorDelegate,
  discardSector: DiscardSectorDelegate,
  consumeSector: ConsumeSectorDelegate
) {
  const activeSectorIds = new Set<number>();
  const activeSectorRequests = new Map<number, LoadSectorRequest>();

  function activateSectors(wantedSectorIds: Set<number>) {
    const start = performance.now();

    const activeOrInFlight = setUnion(activeSectorIds, new Set<number>(activeSectorRequests.keys()));
    const newSectorIds = setDifference(wantedSectorIds, activeOrInFlight);
    const discardedSectorIds = setDifference(activeOrInFlight, wantedSectorIds);

    for (const id of discardedSectorIds) {
      if (activeSectorRequests.has(id)) {
        // Request is in flight
        const request = activeSectorRequests.get(id);
        discardSector(id, request);
        activeSectorRequests.delete(id);
      } else {
        // Sector processed
        discardSector(id, undefined);
        activeSectorIds.delete(id);
      }
    }

    const consumeSectorAndDeleteRequest: ConsumeSectorDelegate = (sectorId, sector) => {
      activeSectorRequests.delete(sectorId);
      consumeSector(sectorId, sector);
      activeSectorIds.add(sectorId);
    };
    for (const id of newSectorIds) {
      const request = loadSector(id, fetchSector, parseSector, consumeSectorAndDeleteRequest);
      activeSectorRequests.set(id, request);
    }

    if (newSectorIds.size > 0 || discardedSectorIds.size > 0) {
      console.log(
        `[${Date.now() / 1000}] activateSectors() [wanted: ${wantedSectorIds.size} ` +
          `new: ${newSectorIds.size}` +
          ` discarded: ${discardedSectorIds.size}` +
          ` active: ${activeSectorIds.size}` +
          ` in-flight: ${activeSectorRequests.size}] time=${(performance.now() - start).toPrecision(2)} ms`
      );
    }
  }
  return activateSectors;
}
