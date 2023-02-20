/*!
 * Copyright 2022 Cognite AS
 */

import { Image360Entity } from '../entity/Image360Entity';
import pull from 'lodash/pull';
import findLast from 'lodash/findLast';
import { Log } from '@reveal/logger';

export type DownloadRequest = {
  load360Image: Promise<void>;
  abort: () => void;
};

export class Image360LoadingCache {
  private readonly _loaded360Images: Image360Entity[];
  private readonly _inFlightEntities: Map<Image360Entity, DownloadRequest>;

  get cachedEntities(): Image360Entity[] {
    return this._loaded360Images;
  }

  get currentlyLoadingEntities(): Map<Image360Entity, DownloadRequest> {
    return this._inFlightEntities;
  }

  constructor(private readonly _imageCacheSize = 10, private readonly _inFlightCacheSize = 10) {
    this._loaded360Images = [];
    this._inFlightEntities = new Map();
  }

  public async cachedPreload(entity: Image360Entity): Promise<void> {
    if (this._loaded360Images.includes(entity)) {
      return;
    }

    const inflightEntity = this._inFlightEntities.get(entity);
    if (inflightEntity !== undefined) {
      return inflightEntity.load360Image;
    }

    if (this._inFlightEntities.size === this._inFlightCacheSize) {
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
        () => {
          return Promise.resolve();
        }
      )
      .finally(() => {
        this._inFlightEntities.delete(entity);
      });

    this._inFlightEntities.set(entity, { load360Image, abort });
    await load360Image;
  }

  public async purge(entity: Image360Entity): Promise<void> {
    if (this._inFlightEntities.has(entity)) {
      await this._inFlightEntities.get(entity)?.load360Image;
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
    const entityToAbort = Array.from(this._inFlightEntities.keys())[0];
    const request = this._inFlightEntities.get(entityToAbort);
    if (request) {
      this._inFlightEntities.delete(entityToAbort);
      request.abort();
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
