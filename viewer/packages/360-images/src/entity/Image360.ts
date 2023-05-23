/*!
 * Copyright 2022 Cognite AS
 */

import { Image360Revision } from './Image360Revision';
import { Image360Visualization } from './Image360Visualization';

/**
 * Metadata for a 360 image
 */
export type Image360Metadata = {
  /**
   * The name or ID of the station this 360 image represents.
   */
  station: string;
  /**
   * The name of the collection to which this 360 image belongs.
   */
  collection: string;
  /**
   * The date of the most recently viewed revision of this 360 image,
   * or the newest one if unviewed.
   */
  date?: Date;
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
   * Get additional information about this image and its active revision.
   */
  getImageMetadata(): Image360Metadata;

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
}
