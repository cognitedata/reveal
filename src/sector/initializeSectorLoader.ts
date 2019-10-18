/*!
 * Copyright 2019 Cognite AS
 */

import { setUnion, setDifference } from '../utils/setUtils';
import { loadSector, LoadSectorRequest } from './loadSector';
import { parseSectorData } from './parseSectorData';
import { DiscardSectorDelegate, ConsumeSectorDelegate, FetchSectorDelegate, ParseSectorDelegate } from './delegates';

export function initializeSectorLoader(
  fetchSector: FetchSectorDelegate,
  parseSector: ParseSectorDelegate,
  discardSector: DiscardSectorDelegate,
  consumeSector: ConsumeSectorDelegate
) {
  const activeSectorIds = new Set<number>();
  const activeSectorRequests = new Map<number, LoadSectorRequest>();

  function activateSectors(wantedSectorIds: Set<number>) {
    const activeOrInFlight = setUnion(activeSectorIds, new Set<number>(activeSectorRequests.keys()));
    const newSectorIds = setDifference(wantedSectorIds, activeOrInFlight);
    const discardedSectorIds = setDifference(activeOrInFlight, wantedSectorIds);

    for (const id of discardedSectorIds) {
      const request = activeSectorRequests.get(id);
      activeSectorRequests.delete(id);
      discardSector(id, request);
    }
    for (const id of newSectorIds) {
      const consumeSectorAndDeleteRequest = sector => {
        activeSectorRequests.delete(id);
        consumeSector(id, sector);
        activeSectorIds.add(id);
      };
      const request = loadSector(id, fetchSector, parseSectorData, consumeSectorAndDeleteRequest);
      activeSectorRequests.set(id, request);
    }
  }
  return activateSectors;
}
