/*!
 * Copyright 2022 Cognite AS
 */

import { ConsumedSector, WantedSector } from '@reveal/cad-parsers';
import { DeferredPromise } from '@reveal/utilities';
import assert from 'assert';
import { Result } from 'neverthrow';

export type SectorDownloadData = {
  sector: WantedSector;
  downloadSector: (sector: WantedSector) => Promise<Result<ConsumedSector, Error>>;
};

type QueuedSectorData = {
  sector: WantedSector;
  downloadSector: (sector: WantedSector) => Promise<Result<ConsumedSector, Error>>;
  queuedDeferredPromise: DeferredPromise<Result<ConsumedSector, Error>>;
};

export class SectorDownloadScheduler {
  private readonly _maxConcurrentSectorDownloads: number;

  private readonly _pendingSectorDownloads: Map<string, Promise<Result<ConsumedSector, Error>>>;
  private readonly _queuedSectorDownloads: Map<string, QueuedSectorData>;
  private readonly _sectorDownloadQueue: string[];

  get numberOfPendingDownloads(): number {
    return this._pendingSectorDownloads.size;
  }

  get numberOfQueuedDownloads(): number {
    return this._queuedSectorDownloads.size;
  }

  constructor(maxConcurrentSectorDownloads = 20) {
    this._maxConcurrentSectorDownloads = maxConcurrentSectorDownloads;
    this._pendingSectorDownloads = new Map();
    this._queuedSectorDownloads = new Map();
    this._sectorDownloadQueue = [];
  }

  public queueSectorBatchForDownload(downloadData: SectorDownloadData[]): Promise<Result<ConsumedSector, Error>>[] {
    return downloadData.map(sectorDownloadData => {
      const { sector, downloadSector } = sectorDownloadData;
      const sectorIdentifier = this.getSectorIdentifier(sector.modelIdentifier, sector.metadata.id);
      const pendingSector = this._pendingSectorDownloads.get(sectorIdentifier);

      if (pendingSector !== undefined) {
        return pendingSector;
      }

      if (this._pendingSectorDownloads.size < this._maxConcurrentSectorDownloads) {
        return this.addSectorToPendingDownloads(downloadSector, sector, sectorIdentifier);
      }

      return this.getOrAddToQueuedDownloads(sector, sectorIdentifier, downloadSector);
    });
  }

  private getOrAddToQueuedDownloads(
    sector: WantedSector,
    sectorIdentifier: string,
    downloadSector: (sector: WantedSector) => Promise<Result<ConsumedSector, Error>>
  ): Promise<Result<ConsumedSector, Error>> {
    const queuedSector = this._queuedSectorDownloads.get(sectorIdentifier);

    if (queuedSector !== undefined) {
      const { queuedDeferredPromise } = queuedSector;
      return queuedDeferredPromise;
    }

    const queuedDeferredPromise = new DeferredPromise<Result<ConsumedSector, Error>>();
    this._sectorDownloadQueue.push(sectorIdentifier);
    this._queuedSectorDownloads.set(sectorIdentifier, {
      sector,
      downloadSector,
      queuedDeferredPromise
    });

    return queuedDeferredPromise;
  }

  private addSectorToPendingDownloads(
    downloadSector: (sector: WantedSector) => Promise<Result<ConsumedSector, Error>>,
    sector: WantedSector,
    sectorIdentifier: string
  ) {
    const sectorDownload = downloadSector(sector);
    this._pendingSectorDownloads.set(sectorIdentifier, sectorDownload);
    this.processNextQueuedSectorDownload(sectorDownload, sectorIdentifier);
    return sectorDownload;
  }

  private processNextQueuedSectorDownload(
    sectorDownload: Promise<Result<ConsumedSector, Error>>,
    sectorIdentifier: string
  ) {
    sectorDownload.then(_ => {
      this._pendingSectorDownloads.delete(sectorIdentifier);
      const nextSectorIdentifier = this._sectorDownloadQueue.shift();

      if (nextSectorIdentifier === undefined) {
        // No more sectors in queue
        return;
      }

      const queuedSector = this._queuedSectorDownloads.get(nextSectorIdentifier);
      this._queuedSectorDownloads.delete(nextSectorIdentifier);

      assert(queuedSector !== undefined);

      const { sector, downloadSector, queuedDeferredPromise } = queuedSector;

      const sectorDownload = downloadSector(sector);
      this._pendingSectorDownloads.set(nextSectorIdentifier, sectorDownload);
      sectorDownload.then(consumedSector => {
        queuedDeferredPromise.resolve(consumedSector);
      });

      this.processNextQueuedSectorDownload(sectorDownload, nextSectorIdentifier);
    });
  }

  private getSectorIdentifier(modelIdentifer: string, sectorId: number): string {
    return `${sectorId}-${modelIdentifer}`;
  }
}
