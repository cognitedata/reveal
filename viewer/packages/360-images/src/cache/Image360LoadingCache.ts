/*!
 * Copyright 2022 Cognite AS
 */

import { Image360Entity } from '../entity/Image360Entity';
import pull from 'lodash/pull';
import findLast from 'lodash/findLast';
import find from 'lodash/find';
import remove from 'lodash/remove';
import { Log } from '@reveal/logger';

export type DownloadRequest = {
  entity: Image360Entity;
  firstCompleted: Promise<void>;
  allCompleted: Promise<void>;
  abort: () => void;
};

export class Image360LoadingCache {
  private readonly _loaded360Images: Image360Entity[];
  private readonly _inProgressDownloads: DownloadRequest[];
  private _lockedDownload: Image360Entity | undefined;

  get cachedEntities(): Image360Entity[] {
    return this._loaded360Images;
  }

  get currentlyLoadingEntities(): DownloadRequest[] {
    return this._inProgressDownloads;
  }

  public getDownloadInProgress(entity: Image360Entity): DownloadRequest | undefined {
    const inProgressDownload = this._inProgressDownloads.find(download => {
      return download.entity === entity;
    });
    return inProgressDownload;
  }

  constructor(private readonly _imageCacheSize = 10, private readonly _downloadCacheSize = 3) {
    this._loaded360Images = [];
    this._inProgressDownloads = [];
  }

  public async cachedPreload(entity: Image360Entity, lockDownload = false): Promise<void> {
    if (this._loaded360Images.includes(entity)) {
      return;
    }

    if (lockDownload) {
      this._lockedDownload = entity;
    }

    const inProgressDownload = this.getDownloadInProgress(entity);
    if (inProgressDownload !== undefined) {
      return inProgressDownload.firstCompleted;
    }

    if (this._inProgressDownloads.length > this._downloadCacheSize) {
      this.abortLastRecentlyReqestedEntity();
    }

    const { signal, abort } = this.createAbortSignal();
    const { firstCompleted, allCompleted } = entity.load360Image(signal);

    this._inProgressDownloads.push({
      entity,
      firstCompleted,
      allCompleted,
      abort
    });

    allCompleted
      .catch(e => {
        return Promise.reject(e);
      })
      .then(
        () => {
          if (this._loaded360Images.length === this._imageCacheSize) {
            this.purgeLastRecentlyUsedInvisibleEntity();
          }
          this._loaded360Images.unshift(entity);
        },
        () => {
          return Promise.resolve();
        }
      )
      .finally(() => {
        removeDownlaod(this._lockedDownload, this._inProgressDownloads);
      });

    await firstCompleted
      .catch(e => {
        return Promise.reject(e);
      })
      .then(
        () => {
          return Promise.resolve();
        },
        reason => {
          removeDownlaod(this._lockedDownload, this._inProgressDownloads);

          if (signal.aborted || reason === 'Aborted') {
            Log.info('360 Image download aborted: ' + reason);
          } else {
            throw new Error('Failed to load 360 image: ' + reason);
          }
        }
      );

    return firstCompleted;

    function removeDownlaod(_lockedDownload: Image360Entity | undefined, _inProgressDownloads: DownloadRequest[]) {
      if (_lockedDownload === entity) {
        _lockedDownload = undefined;
      }
      remove(_inProgressDownloads, download => {
        return download.entity === entity;
      });
    }
  }

  public async purge(entity: Image360Entity): Promise<void> {
    const inFlightDownload = this.getDownloadInProgress(entity);
    if (inFlightDownload) {
      await inFlightDownload.allCompleted;
    }
    pull(this._loaded360Images, entity);
  }

  private purgeLastRecentlyUsedInvisibleEntity() {
    const entityToPurge = findLast(this._loaded360Images, entity => !entity.image360Visualization.visible);
    if (entityToPurge === undefined) {
      throw new Error('Unable to purge 360 image from cache due to too many visible instances');
    }
    pull(this._loaded360Images, entityToPurge);
    entityToPurge.unload360Image();
  }

  private abortLastRecentlyReqestedEntity() {
    const download = find(
      this._inProgressDownloads,
      download => download.entity !== this._lockedDownload && !download.entity.image360Visualization.visible
    );
    if (download) {
      pull(this._inProgressDownloads, download);
      download.abort();
    }
  }

  private createAbortSignal() {
    const abortController = new AbortController();
    const abort = () => {
      abortController.abort();
    };
    return { signal: abortController.signal, abort };
  }
}
