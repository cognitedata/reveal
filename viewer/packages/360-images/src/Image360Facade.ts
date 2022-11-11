/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';
import pull from 'lodash/pull';

import { Image360Entity } from './Image360Entity';
import { Image360EntityFactory } from './Image360EntityFactory';
import { Image360Icon } from './Image360Icon';

export class Image360Facade<T> {
  private readonly _image360Entities: Image360Entity[];
  private readonly _rayCaster: THREE.Raycaster;
  private readonly _loaded360Images: Image360Entity[];
  private readonly _inFlightEntities: Set<Image360Entity>;

  set allIconsVisibility(visible: boolean) {
    this._image360Entities.forEach(entity => (entity.icon.visible = visible));
  }

  set allHoverIconsVisibility(visible: boolean) {
    this._image360Entities.forEach(entity => (entity.icon.hoverSpriteVisible = visible));
  }

  constructor(private readonly _entityFactory: Image360EntityFactory<T>, private readonly _cacheSize = 10) {
    this._image360Entities = [];
    this._loaded360Images = [];
    this._inFlightEntities = new Set();
    this._rayCaster = new THREE.Raycaster();
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
    pull(this._loaded360Images, entity);
    return entity.unload360Image();
  }

  public async preload(entity: Image360Entity): Promise<void> {
    if (this._loaded360Images.filter(preloadedEntity => preloadedEntity === entity).length > 0) {
      console.log('cachehit!');
      return;
    }

    const imageLoad = entity.load360Image();
    if (this._inFlightEntities.has(entity)) {
      console.log('Inflight!');
      return entity.load360Image().then();
    }

    this._inFlightEntities.add(entity);

    await imageLoad;

    if (this._loaded360Images.length === this._cacheSize) {
      console.log('purge');
      const cachePurgedEntity = this._loaded360Images.pop();
      await cachePurgedEntity?.dispose();
    }

    this._loaded360Images.unshift(entity);
    this._inFlightEntities.delete(entity);
    console.log('add');
    console.log('number of entities in cache: ' + this._loaded360Images.length);
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
