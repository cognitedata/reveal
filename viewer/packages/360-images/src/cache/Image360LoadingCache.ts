/*!
 * Copyright 2022 Cognite AS
 */

import { Image360Entity } from '../entity/Image360Entity';
import { Image360RevisionEntity } from '../entity/Image360RevisionEntity';
import pull from 'lodash/pull';
import findLast from 'lodash/findLast';
import find from 'lodash/find';
import remove from 'lodash/remove';
import { DataSourceType } from '@reveal/data-providers';

export type DownloadRequest<T extends DataSourceType> = {
  entity: Image360Entity<T>;
  revision: Image360RevisionEntity<T>;
  anyCompleted: Promise<void>;
  allCompleted: Promise<void>;
  abort: () => void;
};

export type Loaded360Image<T extends DataSourceType> = {
  entity: Image360Entity<T>;
  revision: Image360RevisionEntity<T>;
};

export class Image360LoadingCache<T extends DataSourceType> {
  private readonly _loaded360Images: Loaded360Image<T>[];
  private readonly _inProgressDownloads: DownloadRequest<T>[];
  private _lockedDownload: Image360RevisionEntity<T> | undefined;

  get cachedRevisions(): Image360RevisionEntity<T>[] {
    return this._loaded360Images.map(image => {
      return image.revision;
    });
  }

  get currentlyLoadingEntities(): DownloadRequest<T>[] {
    return this._inProgressDownloads;
  }

  public getDownloadInProgress(revision: Image360RevisionEntity<T>): DownloadRequest<T> | undefined {
    return this._inProgressDownloads.find(download => {
      return download.revision === revision;
    });
  }

  constructor(
    private readonly _imageCacheSize = 5,
    private readonly _downloadCacheSize = 3
  ) {
    this._loaded360Images = [];
    this._inProgressDownloads = [];
  }

  public async cachedPreload(
    entity: Image360Entity<T>,
    revision: Image360RevisionEntity<T>,
    lockDownload = false
  ): Promise<void> {
    if (this._loaded360Images.find(image => image.revision === revision)) {
      return;
    }

    if (lockDownload) {
      this._lockedDownload = revision;
    }

    const inProgressDownload = this.getDownloadInProgress(revision);
    if (inProgressDownload !== undefined) {
      return inProgressDownload.anyCompleted;
    }

    if (this._inProgressDownloads.length >= this._downloadCacheSize) {
      this.abortLastRecentlyReqestedRevision();
    }

    const { signal, abort } = this.createAbortSignal();
    const { lowResolutionCompleted, fullResolutionCompleted } = revision.loadTextures(signal);

    const anyCompleted = Promise.any([lowResolutionCompleted, fullResolutionCompleted]);
    const allCompleted = this.cacheWhenAllComplete(revision, entity, lowResolutionCompleted, fullResolutionCompleted);

    this._inProgressDownloads.push({
      entity,
      revision,
      anyCompleted,
      allCompleted,
      abort
    });

    await anyCompleted;
  }

  public async purge(entity: Image360Entity<T>): Promise<void> {
    entity.getRevisions().forEach(revision => this.purgeRevision(entity, revision));
  }

  private async cacheWhenAllComplete(
    revision: Image360RevisionEntity<T>,
    entity: Image360Entity<T>,
    lowResolutionCompleted: Promise<void>,
    fullResolutionCompleted: Promise<void>
  ) {
    const [_, fullResSettledResult] = await Promise.allSettled([lowResolutionCompleted, fullResolutionCompleted]);
    this.purgeFromInProgressDownloads(revision);
    if (fullResSettledResult.status === 'fulfilled') {
      this.addRevisionToCache(entity, revision);
    }
  }

  private purgeFromInProgressDownloads(revision: Image360RevisionEntity<T>) {
    if (this._lockedDownload === revision) {
      this._lockedDownload = undefined;
    }

    remove(this._inProgressDownloads, download => {
      return download.revision === revision;
    });
  }

  private addRevisionToCache(entity: Image360Entity<T>, revision: Image360RevisionEntity<T>) {
    if (this._loaded360Images.length === this._imageCacheSize) {
      const imageToPurge = findLast(
        this._loaded360Images,
        image => !this.isRevisionVisible(image.entity, image.revision)
      );
      if (imageToPurge === undefined) {
        throw new Error('Unable to purge 360 image from cache due to too many visible instances');
      }
      this.purgeRevision(imageToPurge.entity, imageToPurge.revision);
    }
    this._loaded360Images.unshift({ entity, revision });
  }

  private abortLastRecentlyReqestedRevision() {
    const download = find(
      this._inProgressDownloads,
      download =>
        download.revision !== this._lockedDownload && !this.isRevisionVisible(download.entity, download.revision)
    );
    if (download) {
      this.purgeRevision(download.entity, download.revision);
    }
  }

  private purgeRevision(entity: Image360Entity<T>, revision: Image360RevisionEntity<T>) {
    // Remove from downloads
    const download = find(this._inProgressDownloads, download => download.revision === revision);
    if (download) {
      pull(this._inProgressDownloads, download);
      download.abort();
    }

    // Remove from cache
    remove(this._loaded360Images, image => {
      return image.revision === revision;
    });

    // Clean up textures
    revision.dispose();
    if (!entity.image360Visualization.visible) entity.unloadImage();
  }

  private createAbortSignal() {
    const abortController = new AbortController();
    const abort = () => {
      abortController.abort();
    };
    return { signal: abortController.signal, abort };
  }

  private isRevisionVisible(entity: Image360Entity<T>, revision: Image360RevisionEntity<T>): boolean {
    return entity.getActiveRevision() === revision && entity.image360Visualization.visible;
  }
}
