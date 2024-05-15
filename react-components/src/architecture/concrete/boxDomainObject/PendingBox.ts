/*!
 * Copyright 2024 Cognite AS
 */

import { Matrix4, Plane, type Ray, Vector3 } from 'three';
import {
  horizontalAngle,
  verticalDistanceTo
} from '../../base/utilities/extensions/vectorExtensions';
import { Range3 } from '../../base/utilities/geometry/Range3';
import { forceBetween0AndPi } from '../../base/utilities/extensions/mathExtensions';
import { replaceLast } from '../../base/utilities/extensions/arrayExtensions';
import { type BoxDomainObject } from './BoxDomainObject';
import { CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';
import { GeometryType } from '../../base/utilities/box/GeometryType';

const UP_VECTOR = new Vector3(0, 0, 1);
/**
 * Helper class for generate a Box by clicking around
 */
export class PendingBox {
  // ==================================================
  // INSTANCE FIELDS/PROPERTIES
  // ==================================================

  public readonly boxDomainObject: BoxDomainObject;
  private readonly _points: Vector3[] = [];
  private _lastIsHovering: boolean = false;

  public get realPointCount(): number {
    return this._lastIsHovering ? this._points.length - 1 : this._points.length;
  }

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(boxDomainObject: BoxDomainObject) {
    this.boxDomainObject = boxDomainObject;
    this._lastIsHovering = false;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public addPoint(ray: Ray, point: Vector3 | undefined, isHovering: boolean): boolean {
    if (point !== undefined) {
      point = point.clone();
    }
    this.convertToCdfCoords(ray, point);

    const geometryType = this.boxDomainObject.geometryType;

    // Recalculate the point anywhy for >= 1 points
    // This makes it more natural and you can pick in empty space
    if (geometryType === GeometryType.HorizontalArea || geometryType === GeometryType.Volume) {
      if (this.realPointCount === 1 || this.realPointCount === 2) {
        const plane = new Plane().setFromNormalAndCoplanarPoint(UP_VECTOR, this._points[0]);
        const newPoint = ray.intersectPlane(plane, new Vector3());
        if (newPoint === null) {
          return false;
        }
        point = newPoint;
      } else if (
        this.boxDomainObject.geometryType === GeometryType.Volume &&
        this.realPointCount === 3
      ) {
        const lastPoint = this._points[2];
        const minPoint = lastPoint.clone().addScaledVector(UP_VECTOR, -1000);
        const maxPoint = lastPoint.clone().addScaledVector(UP_VECTOR, 1000);
        if (point === undefined) {
          point = new Vector3();
        }
        // Three.js lack a distance to line function, so I use the line segment function
        ray.distanceSqToSegment(minPoint, maxPoint, undefined, point);
      }
    }
    if (point === undefined) {
      return false;
    }
    this.addRawPoint(point, isHovering);
    return this.rebuild();
  }

  private addRawPoint(point: Vector3, isHovering: boolean): void {
    if (this._lastIsHovering) {
      replaceLast(this._points, point);
    } else {
      this._points.push(point);
    }
    this._lastIsHovering = isHovering;
  }

  private convertToCdfCoords(ray: Ray, point: Vector3 | undefined): void {
    const matrix = CDF_TO_VIEWER_TRANSFORMATION.clone().invert();
    ray.applyMatrix4(matrix);
    if (point !== undefined) {
      point.applyMatrix4(matrix);
    }
  }

  /**
   * Create the box by adding points. The first point will make a box with a center and a tiny size.
   * The second point will give the zRotation and the size.x and center.x
   * The third will give the size.y and center.y
   * The third will give the size.z and center.z
   */

  private rebuild(): boolean {
    if (this._points.length === 0) {
      throw new Error('Cannot create a box without points');
    }
    if (this._points.length === 1) {
      this.boxDomainObject.forceMinSize();
      this.boxDomainObject.center.copy(this._points[0]);
      this.boxDomainObject.center.z += this.boxDomainObject.size.z / 2;
      return true;
    }
    if (this._points.length === 2) {
      // Set the zRotation
      const vector = new Vector3().subVectors(this._points[1], this._points[0]);
      this.boxDomainObject.zRotation = forceBetween0AndPi(horizontalAngle(vector));
    }
    const geometryType = this.boxDomainObject.geometryType;
    if (this._points.length <= 3) {
      // Set the center and the size only in 2D space
      const newCenter = new Vector3();
      const newSize = new Vector3();
      this.getCenterAndSizeFromBoundingBox(newCenter, newSize);

      this.boxDomainObject.center.x = newCenter.x;
      this.boxDomainObject.size.x = newSize.x;

      if (geometryType === GeometryType.VerticalArea) {
        this.boxDomainObject.center.z = newCenter.z;
        this.boxDomainObject.center.y = newCenter.y;
        this.boxDomainObject.size.z = newSize.z;
      } else {
        this.boxDomainObject.center.y = newCenter.y;
        this.boxDomainObject.size.y = newSize.y;
      }
      this.boxDomainObject.forceMinSize();
    } else {
      // Now set the 3D center and size
      const sizeZ = verticalDistanceTo(this._points[2], this._points[3]);
      const centerZ = (this._points[2].z + this._points[3].z) / 2;
      this.boxDomainObject.size.z = sizeZ;
      this.boxDomainObject.center.z = centerZ;
    }
    return true;
  }

  private getCenterAndSizeFromBoundingBox(center: Vector3, size: Vector3): void {
    const matrix = new Matrix4().makeRotationZ(this.boxDomainObject.zRotation);
    const inverseMatrix = matrix.clone().invert();
    const range = new Range3();
    for (const point of this._points) {
      const copy = point.clone();
      copy.applyMatrix4(inverseMatrix);
      range.add(copy);
    }
    range.getCenter(center);
    range.getDelta(size);
    center.applyMatrix4(matrix);
  }
}
