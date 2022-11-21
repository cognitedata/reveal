/*!
 * Copyright 2022 Cognite AS
 */

import { Image360Entity } from './Image360Entity';

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
      const cachePurgedEntity = this._loaded360Images.pop();
      cachePurgedEntity?.dispose();
    }

    this._loaded360Images.unshift(entity);
    this._inFlightEntities.delete(entity);
  }
}
