import { CDF_TO_VIEWER_TRANSFORMATION, Overlay3D, Overlay3DCollection } from '@cognite/reveal';
import { Observation, ObservationProperties } from './models';
import { Vector3 } from 'three';

export type ObservationOverlay = Overlay3D<Observation> | Overlay3D<ObservationProperties>;
export type ObservationCollection =
  | Overlay3DCollection<Observation>
  | Overlay3DCollection<ObservationProperties>;

export function isPendingObservation(
  observationOverlay: ObservationOverlay
): observationOverlay is Overlay3D<ObservationProperties> {
  return (observationOverlay.getContent() as ObservationProperties).positionX !== undefined;
}

export function createEmptyObservationProperties(point: Vector3): ObservationProperties {
  const cdfPosition = point.clone().applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION.clone().invert());
  return { positionX: cdfPosition.x, positionY: cdfPosition.y, positionZ: cdfPosition.z };
}
