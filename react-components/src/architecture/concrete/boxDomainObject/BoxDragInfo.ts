/*!
 * Copyright 2024 Cognite AS
 */
/* eslint-disable @typescript-eslint/class-literal-property-style */

import { type BoxDomainObject } from './BoxDomainObject';
import { CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';
import { type Ray, Vector3, Plane } from 'three';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { type DomainObjectIntersection } from '../../base/domainObjectsHelpers/DomainObjectIntersection';
import { BoxFace } from './BoxFace';

const MIN_SIZE = 0.1;

export class BoxDragInfo {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public readonly boxDomainObject: BoxDomainObject;
  public readonly face = new BoxFace();
  private readonly _point: Vector3 = new Vector3();
  private readonly _normal: Vector3 = new Vector3();
  private readonly _scaleOfBox: Vector3 = new Vector3();
  private readonly _centerOfBox: Vector3 = new Vector3();
  private readonly _planeOfBox: Plane = new Plane();
  private readonly _minPoint: Vector3 = new Vector3();
  private readonly _maxPoint: Vector3 = new Vector3();

  // ==================================================
  // CONTRUCTOR
  // ==================================================

  public constructor(event: PointerEvent, intersection: DomainObjectIntersection) {
    // Plase check the domainObject by instanceof before enter this constructor
    this.boxDomainObject = intersection.domainObject as BoxDomainObject;
    this.face.copy(intersection.userData as BoxFace);
    this._point.copy(intersection.point);
    this._normal.copy(this.face.getNormal());

    this._normal.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
    this._normal.normalize();

    this._minPoint.copy(intersection.point);
    this._maxPoint.copy(intersection.point);

    this._minPoint.addScaledVector(this._normal, +intersection.distanceToCamera * 10);
    this._maxPoint.addScaledVector(this._normal, -intersection.distanceToCamera * 10);

    this._scaleOfBox.copy(this.boxDomainObject.size);
    this._centerOfBox.copy(this.boxDomainObject.center);
    this._planeOfBox.setFromNormalAndCoplanarPoint(this._normal, intersection.point.clone());
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public translate(ray: Ray): void {
    const planeIntersect = ray.intersectPlane(this._planeOfBox, new Vector3());
    if (planeIntersect === null) {
      return;
    }
    const deltaCenter = planeIntersect.sub(this._point);
    deltaCenter.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION.clone().invert());

    // First copy the original values
    const { size, center } = this.boxDomainObject;
    size.copy(this._scaleOfBox);
    center.copy(this._centerOfBox);

    // Then translate the center
    center.add(deltaCenter);

    // Notify the changes
    this.boxDomainObject.notify(Changes.geometry);
  }

  public scale(ray: Ray): void {
    // Take find closest point between the ray and the line perpenducular to the face of in picked box.
    // The distance from this point to the face of in picked box is the change.
    const pointOnSegment = new Vector3();
    ray.distanceSqToSegment(this._minPoint, this._maxPoint, undefined, pointOnSegment);
    const deltaSize = this._planeOfBox.distanceToPoint(pointOnSegment);
    if (Math.abs(deltaSize) < 0.001) {
      return;
    }
    // First copy the original values
    const { size, center } = this.boxDomainObject;
    size.copy(this._scaleOfBox);
    center.copy(this._centerOfBox);

    // Restrict the size to be at least MIN_SIZE
    const index = this.face.index;
    const newSize = Math.max(MIN_SIZE, deltaSize + size.getComponent(index));
    const newDeltaSize = newSize - size.getComponent(index);
    if (newDeltaSize === 0) {
      return;
    }

    // Then change the values
    const deltaCenter = (this.face.sign * newDeltaSize) / 2;
    size.setComponent(index, newSize);
    center.setComponent(index, deltaCenter + center.getComponent(index));

    // Notify the changes
    this.boxDomainObject.notify(Changes.geometry);
  }
}
