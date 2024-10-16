/*!
 * Copyright 2024 Cognite AS
 */
import {
  type AnyIntersection,
  CDF_TO_VIEWER_TRANSFORMATION,
  type ICustomObject
} from '@cognite/reveal';
import { type PointsOfInterestProperties } from './models';
import { type Vector3 } from 'three';
import { type DomainObjectIntersection } from '../../base/domainObjectsHelpers/DomainObjectIntersection';
import { type PointsOfInterestDomainObject } from './PointsOfInterestDomainObject';

export enum PointsOfInterestStatus {
  Default,
  PendingDeletion,
  PendingCreation
}

export type PointsOfInterest<IdType> = {
  properties: PointsOfInterestProperties;
  id?: IdType;
  status: PointsOfInterestStatus;
};

export function createEmptyPointsOfInterestProperties(point: Vector3): PointsOfInterestProperties {
  const cdfPosition = point.clone().applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION.clone().invert());
  return { positionX: cdfPosition.x, positionY: cdfPosition.y, positionZ: cdfPosition.z };
}

const poiMarker = Symbol('poiMarker');

export type PointsOfInterestIntersection<PoIIdType> = Omit<
  DomainObjectIntersection,
  'userData' | 'domainObject'
> & {
  marker: typeof poiMarker;
  domainObject: PointsOfInterestDomainObject<PoIIdType>;
  userData: PointsOfInterest<PoIIdType>;
};

export function createPointsOfInterestIntersection<PoIIdType>(
  point: Vector3,
  distanceToCamera: number,
  customObject: ICustomObject,
  domainObject: PointsOfInterestDomainObject<PoIIdType>,
  overlay: PointsOfInterest<PoIIdType>
): PointsOfInterestIntersection<PoIIdType> {
  return {
    type: 'customObject',
    marker: poiMarker,
    point,
    distanceToCamera,
    customObject,
    domainObject,
    userData: overlay
  };
}

export function isPointsOfInterestIntersection<PoIIdType>(
  objectIntersection: AnyIntersection
): objectIntersection is PointsOfInterestIntersection<PoIIdType> {
  return (objectIntersection as PointsOfInterestIntersection<PoIIdType>).marker === poiMarker;
}
