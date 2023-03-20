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
  fullResolutionCompleted: Promise<void>;
  abort: () => void;
};

export type Loaded360Image = {
  entity: Image360Entity;
  isFullResolution: boolean;
};

export class Image360LoadingCache {
  private readonly _loaded360Images: Loaded360Image[];
  private readonly _inProgressDownloads: DownloadRequest[];
  private _lockedDownload: Image360Entity | undefined;

  get cachedEntities(): Image360Entity[] {
    return this._loaded360Images.map(image => {
      return image.entity;
    });
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
    if (this._loaded360Images.find(image => image.entity === entity)?.isFullResolution) {
      return;
    }

    if (lockDownload) {
      this._lockedDownload = entity;
    }

    const inProgressDownload = this.getDownloadInProgress(entity);
    if (inProgressDownload !== undefined) {
      return inProgressDownload.firstCompleted;
    }

    if (this._inProgressDownloads.length >= this._downloadCacheSize) {
      this.abortLastRecentlyReqestedEntity();
    }

    const { signal, abort } = this.createAbortSignal();
    const { firstCompleted, fullResolutionCompleted } = entity.load360Image(signal);

    this._inProgressDownloads.push({
      entity,
      firstCompleted,
      fullResolutionCompleted,
      abort
    });

    fullResolutionCompleted
      .catch(e => {
        return Promise.reject(e);
      })
      .then(
        () => {
          this.addEntityToCache(entity, true);
        },
        () => {
          return Promise.resolve();
        }
      )
      .finally(() => {
        removeDownload(this._lockedDownload, this._inProgressDownloads);
      });

    const visualzationBoxReady = await firstCompleted
      .catch(e => {
        return Promise.reject(e);
      })
      .then(
        () => {
          this.addEntityToCache(entity, false);
        },
        reason => {
          removeDownload(this._lockedDownload, this._inProgressDownloads);

          if (signal.aborted || reason === 'Aborted') {
            Log.info('360 Image download aborted: ' + reason);
          } else {
            throw new Error('Failed to load 360 image: ' + reason);
          }
        }
      );

    return visualzationBoxReady;

    function removeDownload(_lockedDownload: Image360Entity | undefined, _inProgressDownloads: DownloadRequest[]) {
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
      pull(this._inProgressDownloads, inFlightDownload);
      inFlightDownload.abort();
    }
    remove(this._loaded360Images, image => {
      return image.entity === entity;
    });
  }

  private addEntityToCache(entity: Image360Entity, isFullResolution: boolean) {
    const cachedImage = this._loaded360Images.find(image => image.entity === entity);
    if (cachedImage && cachedImage.isFullResolution && !isFullResolution) {
      return;
    }

    if (cachedImage) {
      pull(this._loaded360Images, cachedImage);
    }

    if (this._loaded360Images.length === this._imageCacheSize) {
      const entityToPurge = findLast(this._loaded360Images, image => !image.entity.image360Visualization.visible);
      if (entityToPurge === undefined) {
        throw new Error('Unable to purge 360 image from cache due to too many visible instances');
      }
      pull(this._loaded360Images, entityToPurge);
      entityToPurge.entity.unload360Image();
    }
    this._loaded360Images.unshift({ entity, isFullResolution });
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
