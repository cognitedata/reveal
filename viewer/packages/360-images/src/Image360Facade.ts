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
import { AsyncSequencer } from '@reveal/utilities/src/AsyncSequencer';
import { DataSourceType } from '@reveal/data-providers';
import { Image360Collection } from 'api-entry-points/core';
import { Image360IconIntersectionData } from './types';
import { Vector } from 'html2canvas/dist/types/render/vector';

export class Image360Facade<T extends DataSourceType> {
  private readonly _image360Collections: DefaultImage360Collection<T>[];
  private readonly _rayCaster: THREE.Raycaster;
  private readonly _image360Cache: Image360LoadingCache;

  private readonly _loadSequencer = new AsyncSequencer();

  get collections(): DefaultImage360Collection<T>[] {
    return this._image360Collections;
  }

  set allIconsVisibility(visible: boolean) {
    this._image360Collections.forEach(collection => collection.setIconsVisibility(visible));
  }

  set allIconsSelected(visible: boolean) {
    this._image360Collections.forEach(collection => collection.setSelectedForAll(visible));
  }

  setHoverIconVisibilityForEntity(entity: Image360Entity<T>, visible: boolean): void {
    this.getCollectionContainingEntity(entity).setSelectedVisibility(visible);
  }

  hideAllHoverIcons(): boolean {
    return this._image360Collections.reduce((changed, collection) => {
      return collection.setSelectedVisibility(false) || changed;
    }, false);
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
    dataProviderFilter: T['image360Identifier'],
    annotationFilter: Image360AnnotationFilterOptions = {},
    postTransform = new THREE.Matrix4(),
    preComputedRotation = true
  ): Promise<DefaultImage360Collection<T>> {
    const sequencer = this._loadSequencer.getNextSequencer();

    try {
      const image360Collection = await this._entityFactory.create(
        dataProviderFilter,
        postTransform,
        preComputedRotation,
        annotationFilter
      );
      await sequencer(() => {
        this._image360Collections.push(image360Collection);
      });
      return image360Collection;
    } catch (e) {
      await sequencer(() => {});
      throw new Error('Failed to create Image360Collection');
    }
  }

  public removeSet(collection: DefaultImage360Collection<T>): void {
    pull(this._image360Collections, collection);
    collection.dispose();
  }

  public async delete(entity: Image360Entity<T>): Promise<void> {
    await this._image360Cache.purge(entity);
    const collection = this.getCollectionContainingEntity(entity);
    collection.remove(entity);
    if (collection.image360Entities.length === 0) {
      collection.dispose();
      pull(this._image360Collections, collection);
    }
  }

  public preload(
    entity: Image360Entity<T>,
    revision: Image360RevisionEntity<T>,
    lockDownload?: boolean
  ): Promise<void> {
    const annotationPromise = revision.getAnnotations();
    const cacheLoadPromise = this._image360Cache.cachedPreload(entity, revision, lockDownload);

    return awaitPromises();

    async function awaitPromises(): Promise<void> {
      await Promise.all([annotationPromise, cacheLoadPromise]);
    }
  }

  public getCollectionContainingEntity(entity: Image360Entity<T>): DefaultImage360Collection<T> {
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

  public intersect(coords: THREE.Vector2, camera: THREE.Camera): Image360IconIntersectionData<T> | undefined {
    const cameraDirection = camera.getWorldDirection(new THREE.Vector3());
    const cameraPosition = camera.position.clone();
    const collectionMatrix = new THREE.Matrix4();

    const intersections = this._image360Collections.flatMap(collection =>
      getImage360Entities(collection)
        .filter(hasVisibleIcon)
        .map(
          getIntersector(
            getTransformedRay(
              this._rayCaster,
              coords,
              camera,
              getWorldToModelCollectionMatrix(collection, collectionMatrix)
            )
          )
        )
        .filter(hasIntersection)
        .map(intersectionToCameraSpace)
        .filter(isInFrontOfCamera)
        .sort(byDistanceToCamera)
        .map(([entity, intersectionPoint]) =>
          createIntersection(collection, entity, intersectionPoint, camera.position)
        )
    );

    return first(intersections);

    function getImage360Entities(collection: DefaultImage360Collection<T>): Image360Entity<T>[] {
      return collection.image360Entities;
    }

    function hasVisibleIcon(entity: Image360Entity<T>) {
      return entity.icon.getVisible() && !entity.image360Visualization.visible;
    }

    function getIntersector(ray: THREE.Ray): (entity: Image360Entity<T>) => [Image360Entity<T>, THREE.Vector3 | null] {
      return (entity: Image360Entity<T>) => [entity, entity.icon.intersect(ray)];
    }

    function getTransformedRay(
      rayCaster: THREE.Raycaster,
      coords: THREE.Vector2,
      camera: THREE.Camera,
      transform: THREE.Matrix4
    ): THREE.Ray {
      rayCaster.setFromCamera(coords, camera);
      rayCaster.ray.applyMatrix4(transform);
      return rayCaster.ray;
    }

    function getWorldToModelCollectionMatrix(
      collection: DefaultImage360Collection<T>,
      collectionMatrix: THREE.Matrix4
    ): THREE.Matrix4 {
      collection.getModelTransformation(collectionMatrix);
      collectionMatrix.invert();
      return collectionMatrix;
    }

    function hasIntersection(
      entityIntersection: [Image360Entity<T>, THREE.Vector3 | null]
    ): entityIntersection is [Image360Entity<T>, THREE.Vector3] {
      const intersection = entityIntersection[1];
      return intersection !== null;
    }

    function intersectionToCameraSpace([entity, _]: [Image360Entity<T>, THREE.Vector3 | null]): [
      Image360Entity<T>,
      THREE.Vector3
    ] {
      const entityCameraPosition = new THREE.Vector3();
      entityCameraPosition.setFromMatrixPosition(entity.transform).sub(cameraPosition);
      return [entity, entityCameraPosition];
    }

    function isInFrontOfCamera([_, intersectionPoint]: [Image360Entity<T>, THREE.Vector3]): boolean {
      return intersectionPoint.dot(cameraDirection) > 0 && intersectionPoint.lengthSq() > 0.00001;
    }

    function byDistanceToCamera(
      [_0, a]: [Image360Entity<T>, THREE.Vector3],
      [_1, b]: [Image360Entity<T>, THREE.Vector3]
    ): number {
      return a.lengthSq() - b.lengthSq();
    }

    function createIntersection(
      image360Collection: DefaultImage360Collection<T>,
      image360: Image360Entity<T>,
      intersectionPoint: THREE.Vector3,
      cameraPosition: THREE.Vector3
    ): Image360IconIntersectionData<T> {
      return {
        image360,
        image360Collection,
        point: intersectionPoint,
        distanceToCamera: intersectionPoint.distanceTo(cameraPosition)
      };
    }
  }

  public dispose(): void {
    this._image360Collections.forEach(imageCollection => imageCollection.dispose());
    this._image360Collections.splice(0);
  }
}
