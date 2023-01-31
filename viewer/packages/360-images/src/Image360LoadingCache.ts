/*!
 * Copyright 2022 Cognite AS
 */

import { Image360Entity } from './Image360Entity';
import pull from 'lodash/pull';
import findLast from 'lodash/findLast';

export class Image360LoadingCache {
  private readonly _loaded360Images: Image360Entity[];
  private readonly _inFlightEntities: Map<Image360Entity, Promise<void>>;

  get cachedEntities(): Image360Entity[] {
    return this._loaded360Images;
  }

  get currentlyLoadingEntities(): Map<Image360Entity, Promise<void>> {
    return this._inFlightEntities;
  }

  constructor(private readonly _cacheSize = 10) {
    this._loaded360Images = [];
    this._inFlightEntities = new Map();
  }

  public async cachedPreload(entity: Image360Entity): Promise<void> {
    if (this._loaded360Images.includes(entity)) {
      return;
    }

    const inflightEntity = this._inFlightEntities.get(entity);
    if (inflightEntity !== undefined) {
      return inflightEntity;
    }
    const load360Image = entity.load360Image();
    this._inFlightEntities.set(entity, load360Image);

    await load360Image;

    if (this._loaded360Images.length === this._cacheSize) {
      this.purgeLastRecentlyUsedInvisibleEntity();
    }

    this._loaded360Images.unshift(entity);
    this._inFlightEntities.delete(entity);
  }

  public async purge(entity: Image360Entity): Promise<void> {
    if (this._inFlightEntities.has(entity)) {
      await this._inFlightEntities.get(entity);
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
}
