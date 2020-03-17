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

export class BasicSectorActivator<T> {
  private readonly getSector: GetSectorDelegate<T>;
  private readonly discardSector: DiscardSectorDelegate;
  private readonly consumeSector: ConsumeSectorDelegate<T>;
  private readonly activeSectorIds: Set<number>;
  private readonly activeSectorRequests: Map<number, Promise<void>>;
  private consumeQueue: QueuedSector<T>[];

  constructor(
    getSector: GetSectorDelegate<T>,
    discardSector: DiscardSectorDelegate,
    consumeSector: ConsumeSectorDelegate<T>
  ) {
    this.getSector = getSector;
    this.discardSector = discardSector;
    this.consumeSector = consumeSector;

    this.activeSectorIds = new Set<number>();
    this.activeSectorRequests = new Map<number, Promise<void>>();
    this.consumeQueue = [];
  }

  async getConsumeAndDeleteRequest(sectorId: number) {
    const sector = await this.getSector(sectorId);
    this.activeSectorRequests.delete(sectorId);
    this.consumeQueue.push({ sectorId, sector });
    this.activeSectorIds.add(sectorId);
  }

  update(wantedSectorIds: Set<number>) {
    const start = performance.now();

    const activeOrInFlight = setUnion(this.activeSectorIds, new Set<number>(this.activeSectorRequests.keys()));
    const newSectorIds = setDifference(wantedSectorIds, activeOrInFlight);
    const discardedSectorIds = setDifference(activeOrInFlight, wantedSectorIds);

    for (const id of discardedSectorIds) {
      if (this.activeSectorRequests.has(id)) {
        // Request is in flight
        this.discardSector(id);
        this.activeSectorRequests.delete(id);
      } else {
        // Sector processed
        this.discardSector(id);
        this.activeSectorIds.delete(id);
        this.consumeQueue = this.consumeQueue.filter(({ sectorId }) => {
          return sectorId !== id;
        });
      }
    }

    for (const id of newSectorIds) {
      const request = this.getConsumeAndDeleteRequest(id);
      this.activeSectorRequests.set(id, request);
    }

    const needsRedraw = newSectorIds.size > 0 || discardedSectorIds.size > 0;
    if (needsRedraw) {
      // tslint:disable-next-line: no-console
      console.log(
        `activateSectors() [wanted: ${wantedSectorIds.size} ` +
          `new: ${newSectorIds.size}` +
          ` discarded: ${discardedSectorIds.size}` +
          ` active: ${this.activeSectorIds.size}` +
          ` in-flight: ${this.activeSectorRequests.size}] time=${(performance.now() - start).toPrecision(2)} ms`
      );
    }

    return needsRedraw;
  }

  refresh() {
    if (this.consumeQueue.length < 1) {
      return false;
    }
    const { sectorId, sector } = this.consumeQueue.shift()!;
    this.consumeSector(sectorId, sector);
    return true;
  }
}
