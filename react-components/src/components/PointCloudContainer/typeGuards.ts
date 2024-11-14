/*!
 * Copyright 2024 Cognite AS
 */

import { type DMInstanceRef } from '@cognite/reveal';

export function isPointCloudVolumesAnnotation(
  volumes: Array<number | DMInstanceRef>
): volumes is number[] {
  return volumes.every((volume) => typeof volume === 'number');
}

export function isPointCloudVolumesDMInstanceRef(
  volumes: Array<number | DMInstanceRef>
): volumes is DMInstanceRef[] {
  return volumes.every(
    (volume) => typeof volume === 'object' && 'externalId' in volume && 'space' in volume
  );
}
