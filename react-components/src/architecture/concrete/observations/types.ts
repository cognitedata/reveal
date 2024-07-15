/*!
 * Copyright 2024 Cognite AS
 */
import { AnyIntersection, CDF_TO_VIEWER_TRANSFORMATION, ICustomObject } from '@cognite/reveal';
import { type ObservationProperties } from './models';
import { type Vector3 } from 'three';
import { type FdmNode } from '../../../utilities/FdmSDK';
import { type DomainObjectIntersection } from '../../base/domainObjectsHelpers/DomainObjectIntersection';
import { ObservationsDomainObject } from './ObservationsDomainObject';

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

const observationMarker = Symbol('observationSymbol');

export type ObservationIntersection = Omit<
  DomainObjectIntersection,
  'userData' | 'domainObject'
> & {
  marker: typeof observationMarker;
  domainObject: ObservationsDomainObject;
  userData: Observation;
};

export function createObservationIntersection(
  point: Vector3,
  distanceToCamera: number,
  customObject: ICustomObject,
  domainObject: ObservationsDomainObject,
  overlay: Observation
): ObservationIntersection {
  return {
    type: 'customObject',
    marker: observationMarker,
    point,
    distanceToCamera,
    customObject,
    domainObject,
    userData: overlay
  };
}

export function isObservationIntersection(
  objectIntersection: AnyIntersection
): objectIntersection is ObservationIntersection {
  return (objectIntersection as ObservationIntersection).marker === observationMarker;
}
