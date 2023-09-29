/*!
 * Copyright 2022 Cognite AS
 */

import { Image360Revision } from './Image360Revision';
import { Image360Visualization } from './Image360Visualization';

import { Color } from 'three';

/**
 * Image360 icon style
 */
export type Image360IconStyle = {
  /**
   * A color tint to apply to the 360 icon
   */
  color?: Color;
};

/**
 * A single 360 image "station", which may consist of several revisions
 * captured in approximately the same location
 */
export interface Image360 {
  /**
   * Get a copy of the model-to-world transformation matrix
   * of the given 360 image.
   * @returns model-to-world transform of the 360 Image
   */
  readonly transform: THREE.Matrix4;

  /**
   * The object containing the unit cube with the 360 images.
   * @returns Image360Visualization
   */
  readonly image360Visualization: Image360Visualization;

  /**
   * Get Id of 360 image entity.
   * @returns Station Id
   */
  readonly id: string;

  /**
   * Get label of 360 image entity.
   * @returns Station label
   * */
  readonly label: string | undefined;

  /**
   * List all historical images for this entity.
   * @returns A list of available revisions.
   */
  getRevisions(): Image360Revision[];

  /**
   * Get the revision that is currently loaded for this entry.
   * @returns The active revision.
   */
  getActiveRevision(): Image360Revision;

  /**
   * Get a copy of the style assigned to the icon of this entity
   */
  getIconStyle(): Image360IconStyle;

  /**
   * Assign a style to the icon of this entity
   */
  setIconStyle(style: Image360IconStyle): void;
}
