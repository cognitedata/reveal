/*!
 * Copyright 2022 Cognite AS
 */

import { Image360 } from './Image360';

/**
 * A wrapper that represents a set of 360 images.
 */
export interface Image360Collection {
  /**
   * A list containing all the 360 images in this set.
   */
  readonly image360Entities: Image360[];
}
