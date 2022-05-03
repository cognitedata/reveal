/*!
 * Copyright 2022 Cognite AS
 */

import { RawStyleObject } from './StyleObject';
import { RawAxisAlignedBox } from './shapes/AxisAlignedBox';

export const hardCodedObjects: RawStyleObject[] = [
  {
    objectId: 1123192,
    shape: {
      type: 'aabb',
      box: {
        min: [- 445, - 477, 927],
        max: [- 435, - 467, 937]
        // min: [8, 3, 8],
        // max: [12, 12, 12]
      }
    } as RawAxisAlignedBox
  }
];
