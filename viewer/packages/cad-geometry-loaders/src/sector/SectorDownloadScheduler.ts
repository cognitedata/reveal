/*!
 * Copyright 2022 Cognite AS
 */

import { ConsumedSector, LevelOfDetail, WantedSector } from '@reveal/cad-parsers';
import { Log } from '@reveal/logger';
import { DeferredPromise } from '@reveal/utilities';
import assert from 'assert';
import remove from 'lodash/remove';

type DownloadRequest = {
  consumedSector: Promise<ConsumedSector>;
  abort: () => void;
};

export type SectorDownloadData = {
  sector: WantedSector;
  downloadSector: (sector: WantedSector, abortSignal: AbortSignal) => Promise<ConsumedSector>;
};

type QueuedSectorData = {
  sector: WantedSector;
  downloadSector: (sector: WantedSector, abortSignal: AbortSignal) => Promise<ConsumedSector>;
  queuedDeferredPromise: DeferredPromise<ConsumedSector>;
};

export class SectorDownloadScheduler {
  private readonly _maxConcurrentSectorDownloads: number;

  private readonly _pendingSectorDownloads: Map<string, DownloadRequest>;
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

  public queueSectorBatchForDownload(downloadData: SectorDownloadData[]): Promise<ConsumedSector>[] {
    return downloadData.map(sectorDownloadData => {
      const { sector, downloadSector } = sectorDownloadData;
      const sectorIdentifier = this.getSectorIdentifier(
        sector.modelIdentifier.sourceModelIdentifier(),
        sector.metadata.id
      );

      if (sector.levelOfDetail === LevelOfDetail.Discarded) {
        const abortedSector = this.abortPendingDownload(sectorIdentifier);
        if (abortedSector) {
          return abortedSector;
        }
        const deletedSector = this.removeDownloadFromQueue(sector, sectorIdentifier);
        if (deletedSector) {
          return deletedSector;
        }
      }

      const pendingSector = this._pendingSectorDownloads.get(sectorIdentifier);
      if (pendingSector !== undefined) {
        return pendingSector.consumedSector;
      }

      if (this._pendingSectorDownloads.size < this._maxConcurrentSectorDownloads) {
        return this.addSectorToPendingDownloads(downloadSector, sector, sectorIdentifier);
      }

      return this.getOrAddToQueuedDownloads(sector, sectorIdentifier, downloadSector);
    });
  }

  private createDiscardedConsumedSector(sector: WantedSector): ConsumedSector {
    return {
      modelIdentifier: sector.modelIdentifier,
      metadata: sector.metadata,
      levelOfDetail: LevelOfDetail.Discarded,
      group: undefined,
      instancedMeshes: undefined
    };
  }

  private abortPendingDownload(sectorIdentifier: string) {
    const pendingSector = this._pendingSectorDownloads.get(sectorIdentifier);
    if (pendingSector !== undefined) {
      pendingSector.abort();
      return pendingSector.consumedSector;
    }
    return undefined;
  }

  private removeDownloadFromQueue(sector: WantedSector, sectorIdentifier: string) {
    const queuedSector = this._queuedSectorDownloads.get(sectorIdentifier);
    if (queuedSector !== undefined) {
      remove(this._sectorDownloadQueue, sectorQueueIdentifier => {
        return sectorQueueIdentifier === sectorIdentifier;
      });
      this._queuedSectorDownloads.delete(sectorIdentifier);
      queuedSector.queuedDeferredPromise.resolve(this.createDiscardedConsumedSector(sector));

      return queuedSector.queuedDeferredPromise;
    }
    return undefined;
  }

  private getOrAddToQueuedDownloads(
    sector: WantedSector,
    sectorIdentifier: string,
    downloadSector: (sector: WantedSector, signal: AbortSignal) => Promise<ConsumedSector>
  ): Promise<ConsumedSector> {
    const queuedSector = this._queuedSectorDownloads.get(sectorIdentifier);

    if (queuedSector !== undefined) {
      const { queuedDeferredPromise } = queuedSector;
      return queuedDeferredPromise;
    }

    const queuedDeferredPromise = new DeferredPromise<ConsumedSector>();
    this._sectorDownloadQueue.push(sectorIdentifier);
    this._queuedSectorDownloads.set(sectorIdentifier, {
      sector,
      downloadSector,
      queuedDeferredPromise
    });

    return queuedDeferredPromise;
  }

  private addSectorToPendingDownloads(
    downloadSector: (sector: WantedSector, signal: AbortSignal) => Promise<ConsumedSector>,
    sector: WantedSector,
    sectorIdentifier: string
  ): Promise<ConsumedSector> {
    const { abortSignal, abort } = this.createAbortSignal();
    const sectorDownload = downloadSector(sector, abortSignal).catch(error => {
      Log.error('Failed to load sector', sector, 'error:', error);
      return this.createDiscardedConsumedSector(sector);
    });
    this._pendingSectorDownloads.set(sectorIdentifier, { consumedSector: sectorDownload, abort });
    this.processNextQueuedSectorDownload(sectorDownload, sectorIdentifier);
    return sectorDownload;
  }

  private processNextQueuedSectorDownload(sectorDownload: Promise<ConsumedSector>, sectorIdentifier: string) {
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

      const { abortSignal, abort } = this.createAbortSignal();
      const sectorDownload = downloadSector(sector, abortSignal);
      this._pendingSectorDownloads.set(nextSectorIdentifier, { consumedSector: sectorDownload, abort });
      sectorDownload.then(consumedSector => {
        queuedDeferredPromise.resolve(consumedSector);
      });

      this.processNextQueuedSectorDownload(sectorDownload, nextSectorIdentifier);
    });
  }

  private getSectorIdentifier(modelSourceIdentifer: string, sectorId: number): string {
    return `${sectorId}-${modelSourceIdentifer}`;
  }

  private createAbortSignal() {
    const abortController = new AbortController();
    const abort = () => {
      abortController.abort();
    };
    return { abortSignal: abortController.signal, abort };
  }
}
