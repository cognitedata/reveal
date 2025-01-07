/*!
 * Copyright 2022 Cognite AS
 */

import { Image360 } from './../entity/Image360';
import { Image360EnteredDelegate, Image360ExitedDelegate } from '../types';

import { Image360AnnotationAppearance } from '../annotation/types';
import { Image360Revision } from '../entity/Image360Revision';
import { IdEither } from '@cognite/sdk';
import { Image360Annotation } from '../annotation/Image360Annotation';
import { ClassicDataSourceType, DataSourceType } from '@reveal/data-providers';
import { Matrix4 } from 'three';
import { InstanceReference } from '@reveal/data-providers/src/types';

/**
 * Asset search return type, including information about the image in which the asset is found
 */
export type AssetAnnotationImage360Info<T extends DataSourceType = ClassicDataSourceType> = {
  /**
   * Reference to the relevant asset
   */
  annotationInfo: T['image360AnnotationType'];
  /**
   * The image entity in which the asset was found
   */
  imageEntity: Image360<T>;
  /**
   * The image revision in which the asset was found
   */
  imageRevision: Image360Revision<T>;
};

/**
 * Result item from an asset annotation query
 */
export type Image360AnnotationAssetQueryResult<T extends DataSourceType = ClassicDataSourceType> = {
  /**
   * The Image360 to which the result annotation belongs
   */
  image: Image360<T>;
  /**
   * The image revision to which the result annotation belongs
   */
  revision: Image360Revision<T>;
  /**
   * The found annotation
   */
  annotation: Image360Annotation<T>;
};

/**
 * A wrapper that represents a set of 360 images.
 */
export interface Image360Collection<T extends DataSourceType = ClassicDataSourceType> {
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
  readonly image360Entities: Image360<T>[];

  /**
   * If defined, any subsequently entered 360 images will load the revision that are closest to the target date.
   * If undefined, the most recent revision will be loaded.
   */
  targetRevisionDate: Date | undefined;

  /**
   * Sets the transformation matrix to be applied to the collection.
   * @param matrix The transformation matrix to be applied to the collection.
   */
  setModelTransformation(matrix: Matrix4): void;

  /**
   * Gets the transformation matrix of the collection
   */
  getModelTransformation(out?: Matrix4): Matrix4;

  /**
   * Specify parameters used to determine the number of icons that are visible when entering 360 Images.
   * @param radius Only icons within the given radius will be made visible.
   * @param pointLimit Limit the number of points within the given radius. Points closer to the camera will be prioritized.
   */
  set360IconCullingRestrictions(radius: number, pointLimit: number): void;

  /**
   * Gets visibility of all 360 image icons.
   * @returns true if all icons are visible, false if all icons are invisible
   */
  getIconsVisibility(): boolean;

  /**
   * Set visibility of all 360 image icons.
   * @param visible If true all icons are made visible according to the active culling scheme. If false all icons are hidden.
   */
  setIconsVisibility(visible: boolean): void;

  /**
   * Check if the occluded icons are visible
   * @returns true is occluded icons are visible
   */
  isOccludedIconsVisible(): boolean;

  /**
   * Set the occluded icons visible
   * @param visible
   */
  setOccludedIconsVisible(visible: boolean): void;

  /**
   * Get the opacity of the images
   * @returns The opacity of the images
   */
  getImagesOpacity(): number;

  /**
   * Set the opacity of the images
   * @param opacity The opacity of the images
   */
  setImagesOpacity(opacity: number): void;

  /**
   * Get the opacity of the icons
   * @returns The opacity of the icons
   */
  getIconsOpacity(): number;

  /**
   * Set the opacity of the icons
   * @param opacity The opacity of the icons
   */
  setIconsOpacity(opacity: number): void;

  /**
   * Subscribes to events on 360 Image datasets. There are several event types:
   * 'image360Entered' - Subscribes to a event for entering 360 image mode.
   * 'image360Exited' - Subscribes to events indicating 360 image mode has exited.
   * @param event The event type.
   * @param callback Callback to be called when the event is fired.
   */
  on(event: 'image360Entered', callback: Image360EnteredDelegate<T>): void;
  on(event: 'image360Exited', callback: Image360ExitedDelegate): void;

  /**
   * Unsubscribes from 360 image dataset event.
   * @param event The event type.
   * @param callback Callback function to be unsubscribed.
   */
  off(event: 'image360Entered', callback: Image360EnteredDelegate<T>): void;
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
  findImageAnnotations(filter: InstanceReference<T>): Promise<Image360AnnotationAssetQueryResult<T>[]>;

  /**
   * Get IDs of all CDF assets associated with this 360 image collection through CDF annotations
   *
   * @deprecated Use {@link Image360Collection.getAnnotationsInfo}
   */
  getAssetIds(): Promise<IdEither[]>;

  /**
   * Get IDs of all CDF assets and related image/revision associated with this
   * 360 image collection through CDF annotations
   *
   * @param source What source data to pull the annotation info from
   */
  getAnnotationsInfo(source: 'assets'): Promise<AssetAnnotationImage360Info<T>[]>;
}
