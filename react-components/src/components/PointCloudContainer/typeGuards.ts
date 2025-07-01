import { type DMInstanceRef } from '@cognite/reveal';

export function isPointCloudVolumesAnnotation(
  volumes: Array<number | DMInstanceRef>
): volumes is number[] {
  return volumes.every((volume): volume is number => typeof volume === 'number');
}

export function isPointCloudVolumesDMInstanceRef(
  volumes: Array<number | DMInstanceRef>
): volumes is DMInstanceRef[] {
  return volumes.every(
    (volume): volume is DMInstanceRef =>
      typeof volume === 'object' && volume !== null && 'externalId' in volume && 'space' in volume
  );
}
