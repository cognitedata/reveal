/*!
 * Copyright 2022 Cognite AS
 */

import { Image360 } from './../entity/Image360';
import {
  Image360AnnotationClickedDelegate,
  Image360AnnotationHoveredDelegate,
  Image360EnteredDelegate,
  Image360ExitedDelegate
} from '../types';

import { Image360AnnotationAppearance } from '../annotation/types';

/**
 * A wrapper that represents a set of 360 images.
 */
export interface Image360Collection {
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
   * 'image360AnnotationHovered - Subscribes to events indicating that the cursor hovered over an image annotation.
   * 'image360AnnotationClicked - Subscribes to events indicating a click on an image annotation
   * @param event The event type.
   * @param callback Callback to be called when the event is fired.
   */
  on(event: 'image360Entered', callback: Image360EnteredDelegate): void;
  on(event: 'image360Exited', callback: Image360ExitedDelegate): void;
  on(event: 'image360AnnotationHovered', callback: Image360AnnotationHoveredDelegate): void;
  on(event: 'image360AnnotationClicked', callback: Image360AnnotationClickedDelegate): void;

  /**
   * Unsubscribes from 360 image dataset event.
   * @param event The event type.
   * @param callback Callback function to be unsubscribed.
   */
  off(event: 'image360Entered', callback: Image360EnteredDelegate): void;
  off(event: 'image360Exited', callback: Image360ExitedDelegate): void;
  off(event: 'image360AnnotationHovered', callback: Image360AnnotationHoveredDelegate): void;
  off(event: 'image360AnnotationClicked', callback: Image360AnnotationClickedDelegate): void;

  /**
   * Assign a default style which affects all annotations
   */
  setDefaultAnnotationStyle(appearance: Image360AnnotationAppearance): void;
}
