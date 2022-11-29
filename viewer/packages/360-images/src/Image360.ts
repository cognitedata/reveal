/*!
 * Copyright 2022 Cognite AS
 */

import { Image360Icon } from './Image360Icon';
import { Image360Visualization } from './Image360Visualization';

export interface Image360 {

  /**
   * Get a copy of the model-to-world transformation matrix
   * of the given 360 image.
   * @returns model-to-world transform of the 360 Image
   */
  get transform(): THREE.Matrix4;

  /**
   * Get the icon that represents the 360
   * image during normal visualization.
   * @returns Image360Icon
   */
  get icon(): Image360Icon;

  /**
   * The object containing the unit cube with the 360 images.
   * @returns Image360Visualization
   */
  get image360Visualization(): Image360Visualization;

  /**
   * Loads the 360 image (6 faces) into the visualization object.
   */
  load360Image(): Promise<void>;

  /**
   * Drops the GPU resources for the 360 image
   * the icon will be preserved.
   */
  unload360Image(): void;

  /**
   * @obvious
   */
  dispose(): void;
}
