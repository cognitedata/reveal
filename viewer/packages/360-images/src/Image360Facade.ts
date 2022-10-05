/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';
import pull from 'lodash/pull';

import { Image360Entity } from './Image360Entity';
import { Image360EntityFactory } from './Image360EntityFactory';
import { Image360Icon } from './Image360Icon';

export class Image360Facade<T> {
  private readonly _entityFactory: Image360EntityFactory<T>;
  private readonly _image360Entities: Image360Entity[];
  private readonly _rayCaster: THREE.Raycaster;
  constructor(entityFactory: Image360EntityFactory<T>) {
    this._entityFactory = entityFactory;
    this._image360Entities = [];
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

  public delete(entity: Image360Entity): void {
    pull(this._image360Entities, entity);
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
