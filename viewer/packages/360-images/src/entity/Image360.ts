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
   */
  readonly image360Visualization: Image360Visualization;

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
