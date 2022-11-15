/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';
import pull from 'lodash/pull';

import { Image360Entity } from './Image360Entity';
import { Image360EntityFactory } from './Image360EntityFactory';
import { Image360Icon } from './Image360Icon';
import { Image360LoadingCache } from './Image360LoadingCache';

export class Image360Facade<T> {
  private readonly _image360Entities: Image360Entity[];
  private readonly _rayCaster: THREE.Raycaster;
  private readonly _image360Cache: Image360LoadingCache;

  set allIconsVisibility(visible: boolean) {
    this._image360Entities.forEach(entity => (entity.icon.visible = visible));
  }

  set allHoverIconsVisibility(visible: boolean) {
    this._image360Entities.forEach(entity => (entity.icon.hoverSpriteVisible = visible));
  }

  constructor(private readonly _entityFactory: Image360EntityFactory<T>) {
    this._image360Entities = [];
    this._rayCaster = new THREE.Raycaster();
    this._image360Cache = new Image360LoadingCache();
  }

  public async create(
    dataProviderFilter: T,
    postTransform = new THREE.Matrix4(),
    preComputedRotation = true
  ): Promise<Image360Entity[]> {
    const image360Entities = await this._entityFactory.create(dataProviderFilter, postTransform, preComputedRotation);
    this._image360Entities.push(...image360Entities);
    return image360Entities;
  }

  public delete(entity: Image360Entity): Promise<void> {
    pull(this._image360Entities, entity);
    return entity.unload360Image();
  }

  public preload(entity: Image360Entity): Promise<void> {
    return this._image360Cache.cachedPreload(entity);
  }

  public intersect(
    coords: {
      x: number;
      y: number;
    },
    camera: THREE.Camera
  ): Image360Entity | undefined {
    this._rayCaster.setFromCamera(coords, camera);
    const intersections = this._rayCaster.intersectObjects<Image360Icon>(
      this._image360Entities.map(p => p.icon),
      false
    );
    if (intersections.length > 0) {
      return this._image360Entities.filter(p => p.icon === intersections[0].object)[0];
    }
  }
}
