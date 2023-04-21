/*!
 * Copyright 2023 Cognite AS
 */

import { Image360Descriptor, Image360Provider } from '@reveal/data-providers';
import { BeforeSceneRenderedDelegate, DeviceDescriptor, EventTrigger, SceneHandler } from '@reveal/utilities';
import zip from 'lodash/zip';
import { DefaultImage360Collection } from './DefaultImage360Collection';
import { Image360Entity } from '../entity/Image360Entity';
import { Image360Icon } from '../icons/Image360Icon';
import { IconCollection } from '../icons/IconCollection';
import { Vector3 } from 'three';
import uniq from 'lodash/uniq';
import assert from 'assert';

export class Image360CollectionFactory<T> {
  private readonly _image360DataProvider: Image360Provider<T>;
  private readonly _sceneHandler: SceneHandler;
  private readonly _onBeforeSceneRendered: EventTrigger<BeforeSceneRenderedDelegate>;
  private readonly _device: DeviceDescriptor;
  constructor(
    image360DataProvider: Image360Provider<T>,
    sceneHandler: SceneHandler,
    onBeforeSceneRendered: EventTrigger<BeforeSceneRenderedDelegate>,
    device: DeviceDescriptor
  ) {
    this._image360DataProvider = image360DataProvider;
    this._sceneHandler = sceneHandler;
    this._onBeforeSceneRendered = onBeforeSceneRendered;
    this._device = device;
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

    const points = event360Descriptors.map(descriptor => new Vector3().setFromMatrixPosition(descriptor.transform));
    const collectionIcons = new IconCollection(points, this._sceneHandler, this._onBeforeSceneRendered);
    const icons = collectionIcons.icons;

    const entities = zip(event360Descriptors, icons)
      .filter(isDefined)
      .map(([descriptor, icon]) => {
        return new Image360Entity(
          descriptor,
          this._sceneHandler,
          this._image360DataProvider,
          descriptor.transform,
          icon,
          this._device
        );
      });

    const collectionIds = uniq(event360Descriptors.map(desc => desc.collectionId));

    assert(collectionIds.length === 1);

    return new DefaultImage360Collection(collectionIds[0], entities, collectionIcons);

    function isDefined(
      pair: [Image360Descriptor | undefined, Image360Icon | undefined]
    ): pair is [Image360Descriptor, Image360Icon] {
      return pair[0] !== undefined && pair[1] !== undefined;
    }
  }
}
