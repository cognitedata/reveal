/*!
 * Copyright 2024 Cognite AS
 */
/* eslint-disable @typescript-eslint/class-literal-property-style */

import { CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';
import { type Ray, Vector3, Plane, Vector2, Matrix4 } from 'three';
import { Changes } from '../../domainObjectsHelpers/Changes';
import { BoxFace } from './BoxFace';
import { BoxFocusType } from './BoxFocusType';
import { type DomainObject } from '../../domainObjects/DomainObject';
import { type IBox } from './IBox';

const MIN_SIZE = 0.01;

export class BoxDragger {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public readonly domainObject: DomainObject;
  public readonly box: IBox;

  private readonly _face = new BoxFace();
  private readonly _point: Vector3 = new Vector3();
  private readonly _normal: Vector3 = new Vector3();
  private readonly _planeOfBox: Plane = new Plane();
  private readonly _minPoint: Vector3 = new Vector3();
  private readonly _maxPoint: Vector3 = new Vector3();

  // Original values when the drag started
  private readonly _scaleOfBox: Vector3 = new Vector3();
  private readonly _centerOfBox: Vector3 = new Vector3();
  private readonly _zRotationOfBox: number = 0;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get face(): BoxFace {
    return this._face;
  }

  // ==================================================
  // CONTRUCTOR
  // ==================================================

  public constructor(domainObject: DomainObject, point: Vector3, face: BoxPickInfo) {
    this.domainObject = domainObject;
    this.box = domainObject as unknown as IBox;
    this._face.copy(face);
    this._point.copy(point);
    this._normal.copy(this._face.getNormal());

    const rotationMatrix = this.getRotationMatrix();
    this._normal.applyMatrix4(rotationMatrix);
    this._normal.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
    this._normal.normalize();

    const length = this.box.size.getComponent(this._face.index) * 100;
    this._minPoint.copy(point);
    this._maxPoint.copy(point);
    this._minPoint.addScaledVector(this._normal, +length);
    this._maxPoint.addScaledVector(this._normal, -length);

    this._planeOfBox.setFromNormalAndCoplanarPoint(this._normal, point.clone());

    // Back up the original values
    this._scaleOfBox.copy(this.box.size);
    this._centerOfBox.copy(this.box.center);
    this._zRotationOfBox = this.box.zRotation;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public apply(type: BoxFocusType, ray: Ray): void {
    switch (type) {
      case BoxFocusType.Scale:
        this.scale(ray);
        break;
      case BoxFocusType.Translate:
        this.translate(ray);
        break;
      case BoxFocusType.Rotate:
        this.rotate(ray);
        break;
      default:
    }
  }

  private translate(ray: Ray): void {
    const planeIntersect = ray.intersectPlane(this._planeOfBox, new Vector3());
    if (planeIntersect === null) {
      return;
    }
    const deltaCenter = planeIntersect.sub(this._point);
    deltaCenter.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION.clone().invert());

    // First copy the original values
    const { center } = this.box;
    center.copy(this._centerOfBox);

    // Then translate the center
    center.add(deltaCenter);

    // Notify the changes
    this.domainObject.notify(Changes.geometry);
  }

  private scale(ray: Ray): void {
    // Take find closest point between the ray and the line perpenducular to the face of in picked box.
    // The distance from this point to the face of in picked box is the change.
    const pointOnSegment = new Vector3();
    ray.distanceSqToSegment(this._minPoint, this._maxPoint, undefined, pointOnSegment);
    const deltaSize = this._planeOfBox.distanceToPoint(pointOnSegment);
    if (deltaSize === 0) {
      return;
    }
    // First copy the original values
    const { size, center } = this.box;
    size.copy(this._scaleOfBox);
    center.copy(this._centerOfBox);

    // Restrict the size to be at least MIN_SIZE
    const index = this._face.index;
    const newSize = Math.max(MIN_SIZE, deltaSize + size.getComponent(index));
    const newDeltaSize = newSize - size.getComponent(index);
    if (newDeltaSize === 0) {
      return;
    }

    // Then change the values
    size.setComponent(index, newSize);

    // The center of the box should be moved by half of the delta size and take the rotation into accont.
    const deltaCenter = (this._face.sign * newDeltaSize) / 2;
    const deltaCenterVector = new Vector3();
    deltaCenterVector.setComponent(index, deltaCenter);
    const rotationMatrix = this.getRotationMatrix();
    deltaCenterVector.applyMatrix4(rotationMatrix);
    center.add(deltaCenterVector);

    // Notify the changes
    this.domainObject.notify(Changes.geometry);
  }

  private rotate(ray: Ray): void {
    // Use top face and create a plane on the top face
    const face = new BoxFace(2);
    const normal = face.getNormal();
    normal.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
    normal.normalize();

    const plane = new Plane().setFromNormalAndCoplanarPoint(normal, this._point.clone());
    const endPoint = ray.intersectPlane(plane, new Vector3());
    if (endPoint === null) {
      return;
    }
    const centerOfBox = this._centerOfBox.clone();
    centerOfBox.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
    const center = plane.projectPoint(centerOfBox, new Vector3());

    // Ignore Y-value (up) since we are only interested in the rotation around the Up-axis
    const centerToStartPoint = substractXZ(this._point, center);
    const centerToEndPoint = substractXZ(endPoint, center);

    const startAngle = centerToStartPoint.angle();
    const endAngle = centerToEndPoint.angle();
    const deltaAngle = startAngle - endAngle;

    // Rotate
    this.box.zRotation = deltaAngle + this._zRotationOfBox;

    // Notify the changes
    this.domainObject.notify(Changes.geometry);

    function substractXZ(v1: Vector3, v2: Vector3): Vector2 {
      return new Vector2(v1.x - v2.x, v1.z - v2.z);
    }
  }

  public getRotationMatrix(matrix: Matrix4 = new Matrix4()): Matrix4 {
    matrix.makeRotationZ(this.box.zRotation);
    return matrix;
  }
}
