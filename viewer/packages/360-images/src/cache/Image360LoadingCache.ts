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
  load360Image: Promise<void>;
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

  constructor(private readonly _imageCacheSize = 10, private readonly _downloadCacheSize = 10) {
    this._loaded360Images = [];
    this._inProgressDownloads = [];
  }

  public async cachedPreload(entity: Image360Entity, lockDownload = false): Promise<void> {
    if (lockDownload) {
      this._lockedDownload = entity;
    }

    if (this._loaded360Images.includes(entity)) {
      return;
    }

    const inProgressDownload = this.getDownloadInProgress(entity);
    if (inProgressDownload !== undefined) {
      return inProgressDownload.load360Image;
    }

    if (this._inProgressDownloads.length === this._downloadCacheSize) {
      this.abortLastRecentlyReqestedEntity();
    }

    const { signal, abort } = this.createAbortSignal();
    const load360Image = entity
      .load360Image(signal)
      .catch(e => {
        if (signal.aborted || e === 'Aborted') {
          Log.info('Abort warning: ' + e);
        } else {
          Log.warn('Failed to load 360 image: ' + e);
        }
        return Promise.reject();
      })
      .then(
        () => {
          if (this._loaded360Images.length === this._imageCacheSize) {
            this.purgeLastRecentlyUsedInvisibleEntity();
          }
          this._loaded360Images.unshift(entity);
        },
        () => {}
      )
      .finally(() => {
        if (this._lockedDownload === entity) {
          this._lockedDownload = undefined;
        }
        remove(this._inProgressDownloads, download => {
          return download.entity === entity;
        });
      });

    this._inProgressDownloads.push({ entity, load360Image, abort });
    await load360Image;
  }

  public async purge(entity: Image360Entity): Promise<void> {
    const inFlightDownload = this.getDownloadInProgress(entity);
    if (inFlightDownload) {
      await inFlightDownload.load360Image;
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
    if (download !== undefined) {
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
