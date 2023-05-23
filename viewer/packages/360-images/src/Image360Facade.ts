/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';
import first from 'lodash/first';
import pull from 'lodash/pull';

import { Image360Entity } from './entity/Image360Entity';
import { Image360LoadingCache } from './cache/Image360LoadingCache';
import { Image360CollectionFactory } from './collection/Image360CollectionFactory';
import { DefaultImage360Collection } from './collection/DefaultImage360Collection';
import { IconCullingScheme } from './icons/IconCollection';
import { Image360RevisionEntity } from './entity/Image360RevisionEntity';
import { Image360AnnotationFilterOptions } from './annotation/types';

export class Image360Facade<T> {
  private readonly _image360Collections: DefaultImage360Collection[];
  private readonly _rayCaster: THREE.Raycaster;
  private readonly _image360Cache: Image360LoadingCache;

  get collections(): DefaultImage360Collection[] {
    return this._image360Collections;
  }

  set allIconsVisibility(visible: boolean) {
    this._image360Collections.forEach(collection => collection.setIconsVisibility(visible));
  }

  set allIconsSelected(visible: boolean) {
    this._image360Collections.forEach(collection => collection.setSelectedForAll(visible));
  }

  set hoverIconVisibility(visible: boolean) {
    this._image360Collections.forEach(collection => collection.setSelectedVisibility(visible));
  }

  set allIconCullingScheme(scheme: IconCullingScheme) {
    this._image360Collections.forEach(collection => collection.setCullingScheme(scheme));
  }

  constructor(private readonly _entityFactory: Image360CollectionFactory<T>) {
    this._image360Collections = [];
    this._rayCaster = new THREE.Raycaster();
    this._image360Cache = new Image360LoadingCache();
  }

  public async create(
    dataProviderFilter: T,
    annotationFilter: Image360AnnotationFilterOptions = {},
    postTransform = new THREE.Matrix4(),
    preComputedRotation = true
  ): Promise<DefaultImage360Collection> {
    const image360Collection = await this._entityFactory.create(
      dataProviderFilter,
      postTransform,
      preComputedRotation,
      annotationFilter
    );
    this._image360Collections.push(image360Collection);
    return image360Collection;
  }

  public async delete(entity: Image360Entity): Promise<void> {
    await this._image360Cache.purge(entity);
    const collection = this.getCollectionContainingEntity(entity);
    collection.remove(entity);
    if (collection.image360Entities.length === 0) {
      collection.dispose();
      pull(this._image360Collections, collection);
    }
  }

  public preload(entity: Image360Entity, revision: Image360RevisionEntity, lockDownload?: boolean): Promise<void> {
    const annotationPromise = revision.getAnnotations();
    const cacheLoadPromise = this._image360Cache.cachedPreload(entity, revision, lockDownload);

    return awaitPromises();

    async function awaitPromises(): Promise<void> {
      await Promise.all([annotationPromise, cacheLoadPromise]);
    }
  }

  public getCollectionContainingEntity(entity: Image360Entity): DefaultImage360Collection {
    const imageCollection = this._image360Collections.filter(collection =>
      collection.image360Entities.includes(entity)
    );
    if (imageCollection.length !== 1) {
      throw new Error(
        `Failed to get Collection for Image360Entity. The entity is present in ${imageCollection.length} collections.`
      );
    }
    return imageCollection[0];
  }

  public intersect(coords: THREE.Vector2, camera: THREE.Camera): Image360Entity | undefined {
    this._rayCaster.setFromCamera(coords, camera);
    const cameraDirection = camera.getWorldDirection(new THREE.Vector3());
    const cameraPosition = camera.position.clone();

    const intersections = this._image360Collections
      .flatMap(getImage360Entities)
      .filter(hasVisibleIcon)
      .map(entity => getIntersection(entity, this._rayCaster.ray))
      .filter(hasIntersection)
      .map(intersectionToCameraSpace)
      .filter(isInFrontOfCamera)
      .sort(byDistanceToCamera)
      .map(selectEntity);

    return first(intersections);

    function getImage360Entities(collection: DefaultImage360Collection): Image360Entity[] {
      return collection.image360Entities;
    }

    function hasVisibleIcon(entity: Image360Entity) {
      return entity.icon.visible && !entity.image360Visualization.visible;
    }

    function getIntersection(entity: Image360Entity, ray: THREE.Ray): [Image360Entity, THREE.Vector3 | null] {
      return [entity, entity.icon.intersect(ray)];
    }

    function hasIntersection(
      entityIntersection: [Image360Entity, THREE.Vector3 | null]
    ): entityIntersection is [Image360Entity, THREE.Vector3] {
      const intersection = entityIntersection[1];
      return intersection !== null;
    }

    function intersectionToCameraSpace([entity, _]: [Image360Entity, THREE.Vector3 | null]): [
      Image360Entity,
      THREE.Vector3
    ] {
      const entityCameraPosition = new THREE.Vector3();
      entityCameraPosition.setFromMatrixPosition(entity.transform).sub(cameraPosition);
      return [entity, entityCameraPosition];
    }

    function isInFrontOfCamera([_, intersectionPoint]: [Image360Entity, THREE.Vector3]): boolean {
      return intersectionPoint.dot(cameraDirection) > 0 && intersectionPoint.lengthSq() > 0.00001;
    }

    function byDistanceToCamera(
      [_0, a]: [Image360Entity, THREE.Vector3],
      [_1, b]: [Image360Entity, THREE.Vector3]
    ): number {
      return a.lengthSq() - b.lengthSq();
    }

    function selectEntity([entity, _]: [Image360Entity, THREE.Vector3]): Image360Entity {
      return entity;
    }
  }

  public dispose(): void {
    this._image360Collections.forEach(imageCollection => imageCollection.dispose());
    this._image360Collections.splice(0);
  }
}
