/*!
 * Copyright 2022 Cognite AS
 */

import { ConsumedSector, WantedSector } from '@reveal/cad-parsers';
import { DeferredPromise } from '@reveal/utilities/src/DeferredPromise';
import assert from 'assert';

export class SectorDownloadScheduler {
  private readonly _maxConcurrentSectorDownloads: number;

  private readonly _pendingSectorDownloads: Map<string, Promise<ConsumedSector>>;
  private readonly _queuedSectorDownloads: Map<
    string,
    [WantedSector, (sector: WantedSector) => Promise<ConsumedSector>, DeferredPromise<ConsumedSector>]
  >;
  private readonly _sectorDownloadQueue: string[];

  constructor(maxConcurrentSectorDownloads = 20) {
    this._maxConcurrentSectorDownloads = maxConcurrentSectorDownloads;
    this._pendingSectorDownloads = new Map();
    this._queuedSectorDownloads = new Map();
    this._sectorDownloadQueue = [];
  }

  public queueSectorBatchForDownload(
    sectors: WantedSector[],
    downloadSector: (sector: WantedSector) => Promise<ConsumedSector>
  ): Promise<ConsumedSector>[] {
    return sectors.map(sector => {
      const sectorIdentifier = `${sector.metadata.id}-${sector.modelIdentifier}`;
      const pendingSector = this._pendingSectorDownloads.get(sectorIdentifier);

      if (pendingSector !== undefined) {
        return pendingSector;
      }

      if (this._pendingSectorDownloads.size < this._maxConcurrentSectorDownloads) {
        const sectorDownload = downloadSector(sector);
        this._pendingSectorDownloads.set(sectorIdentifier, sectorDownload);
        this.getNextQueuedSectorDownload(sectorDownload, sectorIdentifier);
        return sectorDownload;
      }

      const queuedSector = this._queuedSectorDownloads.get(sectorIdentifier);

      if (queuedSector !== undefined) {
        const [_0, _1, downloadPromise] = queuedSector;
        return downloadPromise;
      }

      const deferredSectorDownloadPromise = new DeferredPromise<ConsumedSector>();
      this._sectorDownloadQueue.push(sectorIdentifier);
      this._queuedSectorDownloads.set(sectorIdentifier, [sector, downloadSector, deferredSectorDownloadPromise]);

      return deferredSectorDownloadPromise;
    });
  }

  private getNextQueuedSectorDownload(sectorDownload: Promise<ConsumedSector>, sectorIdentifier: string) {
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

      const [sectorData, downloadCallback, downloadPromise] = queuedSector;

      const sectorDownload = downloadCallback(sectorData);
      this._pendingSectorDownloads.set(nextSectorIdentifier, sectorDownload);
      sectorDownload.then(consumedSector => {
        downloadPromise.resolve(consumedSector);
      });

      this.getNextQueuedSectorDownload(sectorDownload, nextSectorIdentifier);
    });
  }
}
