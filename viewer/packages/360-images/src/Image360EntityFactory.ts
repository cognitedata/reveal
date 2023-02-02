/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';

import { Image360Entity } from './Image360Entity';
import { SceneHandler } from '@reveal/utilities';
import { Image360Provider } from '@reveal/data-providers';

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
    return event360Metadatas.map(
      image360Descriptor =>
        new Image360Entity(
          image360Descriptor,
          this._sceneHandler,
          this._image360DataProvider,
          postTransform,
          preMultipliedRotation
        )
    );
  }
}
