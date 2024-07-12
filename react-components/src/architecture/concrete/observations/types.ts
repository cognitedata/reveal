/*!
 * Copyright 2024 Cognite AS
 */
import { CDF_TO_VIEWER_TRANSFORMATION, CustomObjectIntersection, Overlay3D } from '@cognite/reveal';
import { type ObservationProperties } from './models';
import { type Vector3 } from 'three';
import { FdmNode } from '../../../utilities/FdmSDK';
import { DomainObjectIntersection } from '../../base/domainObjectsHelpers/DomainObjectIntersection';

export enum ObservationStatus {
  Default,
  PendingDeletion,
  PendingCreation
}

export type Observation = {
  properties: ObservationProperties;
  fdmMetadata?: FdmNode<ObservationProperties>;
  status: ObservationStatus;
};

export function createEmptyObservationProperties(point: Vector3): ObservationProperties {
  const cdfPosition = point.clone().applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION.clone().invert());
  return { positionX: cdfPosition.x, positionY: cdfPosition.y, positionZ: cdfPosition.z };
}

export const observationMarker = Symbol('observationSymbol');

export type ObservationIntersection = Omit<DomainObjectIntersection, 'userData'> & {
  marker: typeof observationMarker;
  userData: Overlay3D<Observation>;
};

export function isObservationIntersection(
  objectIntersection: CustomObjectIntersection
): objectIntersection is ObservationIntersection {
  return (objectIntersection as ObservationIntersection).marker === observationMarker;
}
