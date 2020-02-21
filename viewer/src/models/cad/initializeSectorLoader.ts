/*!
 * Copyright 2020 Cognite AS
 */

import { setUnion, setDifference } from '../../utils/setUtils';
import { DiscardSectorDelegate, ConsumeSectorDelegate, GetSectorDelegate } from './delegates';

export interface SectorActivator {
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
  consumeSector: ConsumeSectorDelegate<T>
): SectorActivator {
  const activeSectorIds = new Set<number>();
  const activeSectorRequests = new Map<number, Promise<void>>();
  let consumeQueue: QueuedSector<T>[] = [];

  const getConsumeAndDeleteRequest = async (sectorId: number) => {
    const sector = await getSector(sectorId);
    activeSectorRequests.delete(sectorId);
    consumeQueue.push({ sectorId, sector });
    activeSectorIds.add(sectorId);
  };

  // TODO 2019-12-17 larsmoa: This function is async but does not return Promise. Consider if
  // this really needs to returnd boolean needsRedraw or if it could return a promise
  const update = (wantedSectorIds: Set<number>) => {
    // const start = performance.now();

    const activeOrInFlight = setUnion(activeSectorIds, new Set<number>(activeSectorRequests.keys()));
    const newSectorIds = setDifference(wantedSectorIds, activeOrInFlight);
    const discardedSectorIds = setDifference(activeOrInFlight, wantedSectorIds);

    for (const id of discardedSectorIds) {
      if (activeSectorRequests.has(id)) {
        // Request is in flight
        discardSector(id);
        activeSectorRequests.delete(id);
      } else {
        // Sector processed
        discardSector(id);
        activeSectorIds.delete(id);
        consumeQueue = consumeQueue.filter(({ sectorId }) => {
          return sectorId !== id;
        });
      }
    }

    for (const id of newSectorIds) {
      const request = getConsumeAndDeleteRequest(id);
      activeSectorRequests.set(id, request);
    }

    const needsRedraw = newSectorIds.size > 0 || discardedSectorIds.size > 0;
    // if (needsRedraw) {
    //   console.log(
    //     `activateSectors() [wanted: ${wantedSectorIds.size} ` +
    //       `new: ${newSectorIds.size}` +
    //       ` discarded: ${discardedSectorIds.size}` +
    //       ` active: ${activeSectorIds.size}` +
    //       ` in-flight: ${activeSectorRequests.size}] time=${(performance.now() - start).toPrecision(2)} ms`
    //   );
    // }

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
