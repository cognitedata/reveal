/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';

import { Image360Entity } from './Image360Entity';
import { SceneHandler } from '@reveal/utilities';
import { Image360Descriptor, Image360Provider } from '@reveal/data-providers';
import { Image360CollectionIcons } from './visuals/Image360CollectionIcons';
import { Vector3 } from 'three';
import zip from 'lodash/zip';

export class Image360EntityFactory<T> {
  private readonly _sceneHandler: SceneHandler;
  private readonly _image360DataProvider: Image360Provider<T>;
  constructor(image360DataProvider: Image360Provider<T>, sceneHandler: SceneHandler) {
    this._image360DataProvider = image360DataProvider;
    this._sceneHandler = sceneHandler;
  }
  public async create(
    dataProviderFilter: T,
    postTransform: THREE.Matrix4,
    preMultipliedRotation: boolean
  ): Promise<Image360Entity[]> {
    const event360Metadatas = await this._image360DataProvider.get360ImageDescriptors(dataProviderFilter);

    const positions = event360Metadatas
      .map(image360Descriptor => this.computeTransform(image360Descriptor, preMultipliedRotation, postTransform))
      .map(p => new Vector3().setFromMatrixPosition(p));

    const collectionIcons = new Image360CollectionIcons(this._sceneHandler);
    const icons = collectionIcons.getImage360Icons(positions);

    return zip(event360Metadatas, icons)
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
  }

  private computeTransform(
    image360Metadata: Image360Descriptor,
    preComputedRotation: boolean,
    postTransform: THREE.Matrix4
  ): THREE.Matrix4 {
    const { translation, rotation } = image360Metadata.transformations;

    const entityTransform = translation.clone();

    if (!preComputedRotation) {
      entityTransform.multiply(rotation.clone().multiply(new THREE.Matrix4().makeRotationY(Math.PI / 2)));
    } else {
      entityTransform.multiply(new THREE.Matrix4().makeRotationY(Math.PI));
    }

    return postTransform.clone().multiply(entityTransform);
  }
}
