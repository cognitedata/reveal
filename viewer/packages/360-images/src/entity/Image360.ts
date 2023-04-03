/*!
 * Copyright 2022 Cognite AS
 */

import { Image360Revision } from './Image360Revision';
import { Image360Visualization } from './Image360Visualization';

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
   * */
  readonly image360Visualization: Image360Visualization;

  /**
   * Set the opacity of all images in this entity.
   */
  setOpacity(alpha: number): void;

  /**
   * List the ids and dates for all available revisions. If a revison is undated, the date will be undefined.
   * @returns A list of id and date pairs, sorted with the most recent date first.
   * */
  list360ImageRevisions(): Image360Revision[];

  /**
   * Get the revision that is currently loaded for this entry.
   * @returns Returns the active revision.
   */
  getActiveRevision(): Image360Revision;

  /**
   * Will reload the entity with images from the new revision.
   * Resolves once loading is complete. Rejects if revision could not be changed.
   * If the entity is not entered/visible the promise will be resolved instantly.
   *
   * @param revision The revision to load
   * @returns Promise for when revision has either been updated or it failed to change.
   */
  changeRevision(revision: Image360Revision): Promise<void>;
}
