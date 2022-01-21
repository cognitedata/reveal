/*!
 * Copyright 2022 Cognite AS
 */

import { ConsumedSector, LevelOfDetail, WantedSector } from '@reveal/cad-parsers';
import log from '@reveal/logger';
import { DeferredPromise } from '@reveal/utilities/src/DeferredPromise';
import assert from 'assert';

export type SectorDownloadData = {
  sector: WantedSector;
  downloadSector: (sector: WantedSector) => Promise<ConsumedSector>;
};

export class SectorDownloadScheduler {
  private readonly _maxConcurrentSectorDownloads: number;

  private readonly _pendingSectorDownloads: Map<string, Promise<ConsumedSector>>;
  private readonly _queuedSectorDownloads: Map<
    string,
    [WantedSector, (sector: WantedSector) => Promise<ConsumedSector>, DeferredPromise<ConsumedSector>]
  >;
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

  public queueSectorBatchForDownload(downloadData: SectorDownloadData[]): Promise<ConsumedSector>[] {
    return downloadData.map(sectorDownloadData => {
      const { sector, downloadSector } = sectorDownloadData;
      const sectorIdentifier = `${sector.metadata.id}-${sector.modelIdentifier}`;
      const pendingSector = this._pendingSectorDownloads.get(sectorIdentifier);

      if (pendingSector !== undefined) {
        return pendingSector;
      }

      if (this._pendingSectorDownloads.size < this._maxConcurrentSectorDownloads) {
        return this.addSectorToPendingDownloads(downloadSector, sector, sectorIdentifier);
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

  private addSectorToPendingDownloads(
    downloadSector: (sector: WantedSector) => Promise<ConsumedSector>,
    sector: WantedSector,
    sectorIdentifier: string
  ) {
    const sectorDownload = downloadSector(sector).catch(error => {
      log.error('Failed to load sector', sector, 'error:', error);
      return {
        modelIdentifier: sector.modelIdentifier,
        metadata: sector.metadata,
        levelOfDetail: LevelOfDetail.Discarded,
        group: undefined,
        instancedMeshes: undefined
      } as ConsumedSector;
    });
    this._pendingSectorDownloads.set(sectorIdentifier, sectorDownload);
    this.getNextQueuedSectorDownload(sectorDownload, sectorIdentifier);
    return sectorDownload;
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
