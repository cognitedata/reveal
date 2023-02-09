/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';
import pull from 'lodash/pull';
import first from 'lodash/first';

import { Image360Entity } from './Image360Entity';
import { Image360EntityFactory } from './Image360EntityFactory';
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

  public async delete(entity: Image360Entity): Promise<void> {
    pull(this._image360Entities, entity);
    await this._image360Cache.purge(entity);
    entity.dispose();
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
    const ray = this._rayCaster.ray;
    const cameraDirection = camera.getWorldDirection(new THREE.Vector3());
    const cameraPosition = camera.position.clone();

    const intersections = this._image360Entities
      .filter(hasVisibleIcon)
      .map(getIntersection)
      .filter(hasIntersection)
      .map(intersectionToCameraSpace)
      .filter(isInFrontOfCamera)
      .sort(byDistanceToCamera)
      .map(selectEntity);

    return first(intersections);

    function hasVisibleIcon(entity: Image360Entity) {
      return entity.icon.visible;
    }

    function getIntersection(entity: Image360Entity): [Image360Entity, THREE.Vector3 | null] {
      return [entity, entity.icon.intersect(ray)];
    }

    function hasIntersection(
      entityIntersection: [Image360Entity, THREE.Vector3 | null]
    ): entityIntersection is [Image360Entity, THREE.Vector3] {
      const intersection = entityIntersection[1];
      return intersection !== null;
    }

    function intersectionToCameraSpace([entity, intersectionPoint]: [Image360Entity, THREE.Vector3 | null]): [
      Image360Entity,
      THREE.Vector3
    ] {
      return [entity, intersectionPoint!.sub(cameraPosition)];
    }

    function isInFrontOfCamera([_, intersectionPoint]: [Image360Entity, THREE.Vector3]): boolean {
      return intersectionPoint.dot(cameraDirection) > 0;
    }

    function byDistanceToCamera(
      [_0, a]: [Image360Entity, THREE.Vector3],
      [_1, b]: [Image360Entity, THREE.Vector3]
    ): number {
      return a.length() - b.length();
    }

    function selectEntity([entity, _]: [Image360Entity, THREE.Vector3]): Image360Entity {
      return entity;
    }
  }
}
