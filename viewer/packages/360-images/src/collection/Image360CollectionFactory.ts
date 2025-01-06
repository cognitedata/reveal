/*!
 * Copyright 2023 Cognite AS
 */

import assert from 'assert';
import zip from 'lodash/zip';
import uniqBy from 'lodash/uniqBy';
import { DataSourceType } from '@reveal/data-providers';
import { BeforeSceneRenderedDelegate, DeviceDescriptor, EventTrigger, SceneHandler } from '@reveal/utilities';
import { DefaultImage360Collection } from './DefaultImage360Collection';
import { Image360Entity } from '../entity/Image360Entity';
import { IconCollection, IconsOptions } from '../icons/IconCollection';
import { Vector3, type Matrix4 } from 'three';
import { Overlay3DIcon } from '@reveal/3d-overlays';
import { Historical360ImageSet } from '@reveal/data-providers/src/types';
import { Image360AnnotationFilterOptions } from '../annotation/types';
import { Image360AnnotationFilter } from '../annotation/Image360AnnotationFilter';
import { getImage360ProviderFromMap, Image360ProviderMap } from '@reveal/data-providers/src/Image360Provider';

export class Image360CollectionFactory {
  private readonly _image360ProviderMap: Image360ProviderMap;
  private readonly _sceneHandler: SceneHandler;
  private readonly _onBeforeSceneRendered: EventTrigger<BeforeSceneRenderedDelegate>;
  private readonly _iconsOptions: IconsOptions | undefined;
  private readonly _device: DeviceDescriptor;
  private readonly _setNeedsRedraw: () => void;

  constructor(
    image360ProviderMap: Image360ProviderMap,
    sceneHandler: SceneHandler,
    onBeforeSceneRendered: EventTrigger<BeforeSceneRenderedDelegate>,
    setNeedsRedraw: () => void,
    device: DeviceDescriptor,
    iconsOptions?: IconsOptions
  ) {
    this._image360ProviderMap = image360ProviderMap;
    this._sceneHandler = sceneHandler;
    this._onBeforeSceneRendered = onBeforeSceneRendered;
    this._iconsOptions = iconsOptions;
    this._device = device;
    this._setNeedsRedraw = setNeedsRedraw;
  }

  public async create<T extends DataSourceType>(
    image360Identifier: T['image360Identifier'],
    postTransform: Matrix4,
    preMultipliedRotation: boolean,
    annotationFilter: Image360AnnotationFilterOptions
  ): Promise<DefaultImage360Collection<T>> {
    const provider = getImage360ProviderFromMap<T>(image360Identifier, this._image360ProviderMap);

    const historicalDescriptors = (await provider.get360ImageDescriptors(
      image360Identifier,
      preMultipliedRotation
    )) as Historical360ImageSet<T>[];
    historicalDescriptors.forEach(image360Descriptor => image360Descriptor.transform.premultiply(postTransform));

    const points = historicalDescriptors.map(descriptor => new Vector3().setFromMatrixPosition(descriptor.transform));
    const collectionIcons = new IconCollection(
      points,
      this._sceneHandler,
      this._onBeforeSceneRendered,
      this._iconsOptions
    );
    const icons = collectionIcons.icons;

    const annotationFilterer = new Image360AnnotationFilter(annotationFilter);

    const entities = zip(historicalDescriptors, icons)
      .filter(isDefined)
      .map(([descriptor, icon]) => {
        return new Image360Entity<T>(
          descriptor,
          this._sceneHandler,
          provider,
          annotationFilterer,
          descriptor.transform,
          icon,
          this._device
        );
      });

    const uniqueCollections = uniqBy(historicalDescriptors, desc => desc.collectionId);

    assert(uniqueCollections.length === 1);

    const { collectionLabel } = uniqueCollections[0];

    return new DefaultImage360Collection<T>(
      image360Identifier,
      collectionLabel,
      entities,
      collectionIcons,
      annotationFilterer,
      this._image360ProviderMap,
      this._setNeedsRedraw
    );

    function isDefined(
      pair: [Historical360ImageSet<T> | undefined, Overlay3DIcon | undefined]
    ): pair is [Historical360ImageSet<T>, Overlay3DIcon] {
      return pair[0] !== undefined && pair[1] !== undefined;
    }
  }
}
