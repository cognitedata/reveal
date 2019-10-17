import { setUnion, setDifference } from '../utils/setUtils';
import { loadSector, LoadSectorRequest } from './loadSector';
import { fetchRequest } from './fetchSector';
import { parseSectorData } from './parseSectorData';
import { Sector } from "./types";

// TODO 20191017 larsmoa: Cleanup in the callbacks here and align with definitions in loadSector.ts
export function initializeSectorLoader(discardSector: (sectorId: number, request: LoadSectorRequest) => void, consumeSector: (sectorId: number, sector: Sector) => void) {
  const activeSectorIds = new Set<number>();
  const activeSectorRequests = new Map<number, LoadSectorRequest>();

  function activateSectors(wantedSectorIds: Set<number>) {
    const activeOrInFlight = setUnion(activeSectorIds, new Set<number>(activeSectorRequests.keys()));
    const newSectorIds = setDifference(wantedSectorIds, activeOrInFlight);
    const discardedSectorIds = setDifference(activeOrInFlight, wantedSectorIds);
    console.log("Wanted", wantedSectorIds);
    console.log("Discarded", discardedSectorIds);
    console.log("New", newSectorIds);
    for (const id of discardedSectorIds) {
      const request = activeSectorRequests.get(id);
      activeSectorRequests.delete(id);
      discardSector(id, request);
    }
    for (const id of newSectorIds) {
      const consumeSectorAndDeleteRequest = (sector) => {
        activeSectorRequests.delete(id);
        consumeSector(id, sector);
      };
      const request = loadSector(id, fetchRequest, parseSectorData, consumeSectorAndDeleteRequest);
      activeSectorRequests.set(id, request);
    }
  }
  return activateSectors;
}
