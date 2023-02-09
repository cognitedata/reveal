/*!
 * Copyright 2023 Cognite AS
 */

import { Image360Descriptor, Image360Provider } from '@reveal/data-providers';
import { SceneHandler } from '@reveal/utilities';
import zip from 'lodash/zip';
import { Matrix4, Vector3 } from 'three';
import { DefaultImage360Collection } from './DefaultImage360Collection';
import { Image360Entity } from './Image360Entity';
import { Image360CollectionIcons } from './visuals/Image360CollectionIcons';

export class Image360CollectionFactory<T> {
  private readonly _image360DataProvider: Image360Provider<T>;
  private readonly _sceneHandler: SceneHandler;
  constructor(image360DataProvider: Image360Provider<T>, sceneHandler: SceneHandler) {
    this._image360DataProvider = image360DataProvider;
    this._sceneHandler = sceneHandler;
  }

  public async create(
    dataProviderFilter: T,
    postTransform: THREE.Matrix4,
    preMultipliedRotation: boolean
  ): Promise<DefaultImage360Collection> {
    const event360Metadatas = await this._image360DataProvider.get360ImageDescriptors(dataProviderFilter);

    const positions = event360Metadatas
      .map(image360Descriptor => this.computeTransform(image360Descriptor, preMultipliedRotation, postTransform))
      .map(p => new Vector3().setFromMatrixPosition(p));

    const collectionIcons = new Image360CollectionIcons(this._sceneHandler);
    const icons = collectionIcons.initializeImage360Icons(positions);

    const entities = zip(event360Metadatas, icons)
      .filter(([image360Descriptor, icon]) => {
        return image360Descriptor !== undefined && icon !== undefined;
      })
      .map(([image360Descriptor, icon]) => {
        const worldTransform = this.computeTransform(image360Descriptor!, preMultipliedRotation, postTransform);
        return new Image360Entity(
          image360Descriptor!,
          this._sceneHandler,
          this._image360DataProvider,
          worldTransform,
          icon!
        );
      });

    return new DefaultImage360Collection(entities, collectionIcons);
  }

  private computeTransform(
    image360Metadata: Image360Descriptor,
    preComputedRotation: boolean,
    postTransform: THREE.Matrix4
  ): THREE.Matrix4 {
    const { translation, rotation } = image360Metadata.transformations;

    const entityTransform = translation.clone();

    if (!preComputedRotation) {
      entityTransform.multiply(rotation.clone().multiply(new Matrix4().makeRotationY(Math.PI / 2)));
    } else {
      entityTransform.multiply(new Matrix4().makeRotationY(Math.PI));
    }

    return postTransform.clone().multiply(entityTransform);
  }
}
