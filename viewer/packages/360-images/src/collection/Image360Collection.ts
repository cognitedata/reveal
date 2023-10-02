/*!
 * Copyright 2022 Cognite AS
 */

import { Image360 } from './../entity/Image360';
import { Image360EnteredDelegate, Image360ExitedDelegate } from '../types';

import { Image360AnnotationAppearance } from '../annotation/types';
import { Image360Revision } from '../entity/Image360Revision';
import { IdEither } from '@cognite/sdk';
import { Image360Annotation } from '../annotation/Image360Annotation';
import { ImageAssetLinkAnnotation } from '@reveal/data-providers';

/**
 * Filter for finding annotations related to an asset
 */
export type Image360AnnotationAssetFilter = {
  /**
   * Reference to the wanted asset
   */
  assetRef: IdEither;
};

/**
 * Asset search return type, including information about the image in which the asset is found
 */
export type AssetImage360Info = {
  /**
   * Reference to the relevant asset
   */
  annotationInfo: ImageAssetLinkAnnotation;
  /**
   * The image entity in which the asset was found
   */
  imageEntity: Image360;
  /**
   * The image revision in which the asset was found
   */
  imageRevision: Image360Revision;
};

/**
 * Result item from an asset annotation query
 */
export type Image360AnnotationAssetQueryResult = {
  /**
   * The Image360 to which the result annotation belongs
   */
  image: Image360;
  /**
   * The image revision to which the result annotation belongs
   */
  revision: Image360Revision;
  /**
   * The found annotation
   */
  annotation: Image360Annotation;
};

/**
 * A wrapper that represents a set of 360 images.
 */
export interface Image360Collection {
  /**
   * The id of the collection.
   * @returns The id of the collection.
   */
  readonly id: string;

  /**
   * The label of the collection.
   * @returns The label of the collection.
   */
  readonly label: string | undefined;

  /**
   * A list containing all the 360 images in this set.
   */
  readonly image360Entities: Image360[];

  /**
   * If defined, any subsequently entered 360 images will load the revision that are closest to the target date.
   * If undefined, the most recent revision will be loaded.
   */
  targetRevisionDate: Date | undefined;

  /**
   * Specify parameters used to determine the number of icons that are visible when entering 360 Images.
   * @param radius Only icons within the given radius will be made visible.
   * @param pointLimit Limit the number of points within the given radius. Points closer to the camera will be prioritized.
   */
  set360IconCullingRestrictions(radius: number, pointLimit: number): void;

  /**
   * Set visibility of all 360 image icons.
   * @param visible If true all icons are made visible according to the active culling scheme. If false all icons are hidden.
   */
  setIconsVisibility(visible: boolean): void;

  /**
   * Subscribes to events on 360 Image datasets. There are several event types:
   * 'image360Entered' - Subscribes to a event for entering 360 image mode.
   * 'image360Exited' - Subscribes to events indicating 360 image mode has exited.
   * @param event The event type.
   * @param callback Callback to be called when the event is fired.
   */
  on(event: 'image360Entered', callback: Image360EnteredDelegate): void;
  on(event: 'image360Exited', callback: Image360ExitedDelegate): void;

  /**
   * Unsubscribes from 360 image dataset event.
   * @param event The event type.
   * @param callback Callback function to be unsubscribed.
   */
  off(event: 'image360Entered', callback: Image360EnteredDelegate): void;
  off(event: 'image360Exited', callback: Image360ExitedDelegate): void;

  /**
   * Get the assigned default style affecting all annotations
   */
  getDefaultAnnotationStyle(): Image360AnnotationAppearance;

  /**
   * Assign a default style which affects all annotations
   */
  setDefaultAnnotationStyle(appearance: Image360AnnotationAppearance): void;

  /**
   * Find 360 images associated with an asset through CDF annotations
   */
  findImageAnnotations(filter: Image360AnnotationAssetFilter): Promise<Image360AnnotationAssetQueryResult[]>;

  /**
   * Get IDs of all CDF assets associated with this 360 image collection through CDF annotations
   *
   * @deprecated Use {@link Image360Collection.getAssetInfo}
   */
  getAssetIds(): Promise<IdEither[]>;

  /**
   * Get IDs of all CDF assets and related image/revision associated with this
   * 360 image collection through CDF annotations
   */
  getAssetInfo(): Promise<AssetImage360Info[]>;
}
