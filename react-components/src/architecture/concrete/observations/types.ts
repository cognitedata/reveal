/*!
 * Copyright 2024 Cognite AS
 */
import {
  type AnyIntersection,
  CDF_TO_VIEWER_TRANSFORMATION,
  type ICustomObject
} from '@cognite/reveal';
import { type ObservationProperties } from './models';
import { type Vector3 } from 'three';
import { type DomainObjectIntersection } from '../../base/domainObjectsHelpers/DomainObjectIntersection';
import { type ObservationsDomainObject } from './ObservationsDomainObject';

export enum ObservationStatus {
  Default,
  PendingDeletion,
  PendingCreation
}

export type Observation<IdType> = {
  properties: ObservationProperties;
  id?: IdType;
  status: ObservationStatus;
};

export function createEmptyObservationProperties(point: Vector3): ObservationProperties {
  const cdfPosition = point.clone().applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION.clone().invert());
  return { positionX: cdfPosition.x, positionY: cdfPosition.y, positionZ: cdfPosition.z };
}

const observationMarker = Symbol('observationSymbol');

export type ObservationIntersection<ObservationIdType> = Omit<
  DomainObjectIntersection,
  'userData' | 'domainObject'
> & {
  marker: typeof observationMarker;
  domainObject: ObservationsDomainObject<ObservationIdType>;
  userData: Observation<ObservationIdType>;
};

export function createObservationIntersection<ObservationIdType>(
  point: Vector3,
  distanceToCamera: number,
  customObject: ICustomObject,
  domainObject: ObservationsDomainObject<ObservationIdType>,
  overlay: Observation<ObservationIdType>
): ObservationIntersection<ObservationIdType> {
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

export function isObservationIntersection<ObservationIdType>(
  objectIntersection: AnyIntersection
): objectIntersection is ObservationIntersection<ObservationIdType> {
  return (
    (objectIntersection as ObservationIntersection<ObservationIdType>).marker === observationMarker
  );
}
