/*!
 * Copyright 2022 Cognite AS
 */

import { Image360Entity } from './Image360Entity';

export class Image360LoadingCache {
  private readonly _loaded360Images: Image360Entity[];
  private readonly _inFlightEntities: Set<Image360Entity>;

  get cachedEntities(): Image360Entity[] {
    return this._loaded360Images;
  }

  get currentlyLoadingEntities(): Set<Image360Entity> {
    return this._inFlightEntities;
  }

  constructor(private readonly _cacheSize = 10) {
    this._loaded360Images = [];
    this._inFlightEntities = new Set();
  }

  public async cachedPreload(entity: Image360Entity): Promise<void> {
    if (this._loaded360Images.filter(preloadedEntity => preloadedEntity === entity).length > 0) {
      return;
    }

    if (this._inFlightEntities.has(entity)) {
      return entity.load360Image();
    }

    this._inFlightEntities.add(entity);

    await entity.load360Image();

    if (this._loaded360Images.length === this._cacheSize) {
      const cachePurgedEntity = this._loaded360Images.pop();
      await cachePurgedEntity?.dispose();
    }

    this._loaded360Images.unshift(entity);
    this._inFlightEntities.delete(entity);
  }
}
