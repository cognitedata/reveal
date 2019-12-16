/*!
 * Copyright 2019 Cognite AS
 */

import { setUnion, setDifference } from '../../utils/setUtils';
import { loadSector } from './loadSector';
import {
  DiscardSectorDelegate,
  ConsumeSectorDelegate,
  FetchSectorDelegate,
  ParseSectorDelegate,
  GetSectorDelegate
} from './delegates';
import { LoadSectorRequest } from './types';

interface SectorActivator {
  update: (wantedSectorIds: Set<number>) => boolean;
  refresh: () => boolean;
}

interface QueuedSector<T> {
  sectorId: number;
  sector: T;
}

export function initializeSectorLoader<T>(
  getSector: GetSectorDelegate<T>,
  discardSector: DiscardSectorDelegate,
  consumeSector: ConsumeSectorDelegate<T>,
  requestRedraw: () => void
): SectorActivator {
  const activeSectorIds = new Set<number>();
  const activeSectorRequests = new Map<number, Promise<void>>();
  let consumeQueue: QueuedSector<T>[] = [];

  const update = (wantedSectorIds: Set<number>) => {
    const start = performance.now();

    const activeOrInFlight = setUnion(activeSectorIds, new Set<number>(activeSectorRequests.keys()));
    const newSectorIds = setDifference(wantedSectorIds, activeOrInFlight);
    const discardedSectorIds = setDifference(activeOrInFlight, wantedSectorIds);

    for (const id of discardedSectorIds) {
      if (activeSectorRequests.has(id)) {
        // Request is in flight
        const request = activeSectorRequests.get(id);
        discardSector(id);
        requestRedraw();
        activeSectorRequests.delete(id);
      } else {
        // Sector processed
        discardSector(id);
        activeSectorIds.delete(id);
        consumeQueue = consumeQueue.filter(({ sectorId, sector }) => {
          return sectorId !== id;
        });
        requestRedraw();
      }
    }

    const getConsumeAndDeleteRequest = async (sectorId: number) => {
      const sector = await getSector(sectorId);
      activeSectorRequests.delete(sectorId);
      consumeQueue.push({ sectorId, sector });
      activeSectorIds.add(sectorId);
      requestRedraw();
    };

    for (const id of newSectorIds) {
      const request = getConsumeAndDeleteRequest(id);
      activeSectorRequests.set(id, request);
    }

    const needsRedraw = newSectorIds.size > 0 || discardedSectorIds.size > 0;
    if (needsRedraw) {
      console.log(
        `activateSectors() [wanted: ${wantedSectorIds.size} ` +
          `new: ${newSectorIds.size}` +
          ` discarded: ${discardedSectorIds.size}` +
          ` active: ${activeSectorIds.size}` +
          ` in-flight: ${activeSectorRequests.size}] time=${(performance.now() - start).toPrecision(2)} ms`
      );
    }

    return needsRedraw;
  };

  const refresh = () => {
    if (consumeQueue.length < 1) {
      return false;
    }
    const { sectorId, sector } = consumeQueue.shift()!;
    consumeSector(sectorId, sector);
    return true;
  };

  return {
    update,
    refresh
  };
}
