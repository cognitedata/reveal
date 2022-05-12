/*!
 * Copyright 2022 Cognite AS
 */

import { WellKnownAsprsPointClassCodes } from './types';

const PotreeDefaultPointClass = 'DEFAULT';

export function createPointClassKey(pointClass: number | WellKnownAsprsPointClassCodes): number {
  if (pointClass === WellKnownAsprsPointClassCodes.Default) {
    // Potree has a special class 'DEFAULT'. Our map has number keys, but this one is specially
    // handled in Potree so we ignore type.
    return PotreeDefaultPointClass as any;
  }
  return pointClass;
}
