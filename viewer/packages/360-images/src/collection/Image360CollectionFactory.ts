/*!
 * Copyright 2023 Cognite AS
 */

import { Image360Descriptor, Image360Provider } from '@reveal/data-providers';
import { SceneHandler } from '@reveal/utilities';
import zip from 'lodash/zip';
import { DefaultImage360Collection } from './DefaultImage360Collection';
import { Image360Entity } from '../entity/Image360Entity';
import { Image360Icon } from '../icons/Image360Icon';
import { Image360CollectionIcons } from '../icons/IconCollection';

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
    const event360Descriptors = await this._image360DataProvider.get360ImageDescriptors(
      dataProviderFilter,
      preMultipliedRotation
    );
    event360Descriptors.forEach(image360Descriptor => image360Descriptor.transform.premultiply(postTransform));

    const collectionIcons = new Image360CollectionIcons(this._sceneHandler);
    const icons = collectionIcons.initializeImage360Icons(event360Descriptors.map(descriptor => descriptor.transform));

    const entities = zip(event360Descriptors, icons)
      .filter(isDefined)
      .map(([descriptor, icon]) => {
        return new Image360Entity(
          descriptor,
          this._sceneHandler,
          this._image360DataProvider,
          descriptor.transform,
          icon!
        );
      });

    return new DefaultImage360Collection(entities, collectionIcons);

    function isDefined(
      pair: [Image360Descriptor | undefined, Image360Icon | undefined]
    ): pair is [Image360Descriptor, Image360Icon] {
      return pair[0] !== undefined && pair[1] !== undefined;
    }
  }
}
