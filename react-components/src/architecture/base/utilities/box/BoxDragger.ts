/*!
 * Copyright 2024 Cognite AS
 */

import { CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';
import { type Ray, Vector3, Plane, Vector2, Matrix4 } from 'three';
import { Changes } from '../../domainObjectsHelpers/Changes';
import { BoxFace } from './BoxFace';
import { BoxFocusType } from './BoxFocusType';
import { type DomainObject } from '../../domainObjects/DomainObject';
import { type IBox } from './IBox';
import { type BoxPickInfo } from './BoxPickInfo';
import { forceBetween0AndPi } from '../extensions/mathExtensions';

export class BoxDragger {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public readonly domainObject: DomainObject;
  private readonly _box: IBox;

  private readonly _face = new BoxFace();
  private readonly _focusType: BoxFocusType;
  private readonly _point: Vector3 = new Vector3(); // Intersection point
  private readonly _normal: Vector3 = new Vector3(); // Intersection normal
  private readonly _planeOfBox: Plane = new Plane(); // Plane of the intersection/normal
  private readonly _minPoint: Vector3 = new Vector3(); // Start of line from point at -normal direction
  private readonly _maxPoint: Vector3 = new Vector3(); // End of line from point at +normal direction

  // Original values when the drag started
  private readonly _sizeOfBox: Vector3 = new Vector3();
  private readonly _centerOfBox: Vector3 = new Vector3();
  private readonly _zRotationOfBox: number = 0;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get face(): BoxFace {
    return this._face;
  }

  public get focusType(): BoxFocusType {
    return this._focusType;
  }

  // ==================================================
  // CONTRUCTOR
  // ==================================================

  public constructor(domainObject: DomainObject, point: Vector3, pickInfo: BoxPickInfo) {
    this.domainObject = domainObject;
    this._box = domainObject as unknown as IBox;
    this._face.copy(pickInfo.face);
    this._focusType = pickInfo.focusType;
    this._point.copy(point);
    this._normal.copy(this._face.getNormal());

    const rotationMatrix = this.getRotationMatrix();
    this._normal.applyMatrix4(rotationMatrix);
    this._normal.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
    this._normal.normalize();

    const length = this._box.size.getComponent(this._face.index) * 100;
    this._minPoint.copy(point);
    this._maxPoint.copy(point);
    this._minPoint.addScaledVector(this._normal, +length);
    this._maxPoint.addScaledVector(this._normal, -length);

    this._planeOfBox.setFromNormalAndCoplanarPoint(this._normal, point.clone());

    // Back up the original values
    this._sizeOfBox.copy(this._box.size);
    this._centerOfBox.copy(this._box.center);
    this._zRotationOfBox = this._box.zRotation;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public apply(ray: Ray): boolean {
    if (!this.applyByFocusType(this.focusType, ray)) {
      return false;
    }
    this.domainObject.notify(Changes.geometry);
    return true;
  }

  private applyByFocusType(type: BoxFocusType, ray: Ray): boolean {
    switch (type) {
      case BoxFocusType.Scale:
        return this.scale(ray);
      case BoxFocusType.Translate:
        return this.translate(ray);
      case BoxFocusType.Rotate:
        return this.rotate(ray);
      default:
        return false;
    }
  }

  private translate(ray: Ray): boolean {
    const planeIntersect = ray.intersectPlane(this._planeOfBox, new Vector3());
    if (planeIntersect === null) {
      return false;
    }
    const deltaCenter = planeIntersect.sub(this._point);
    deltaCenter.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION.clone().invert());

    // First copy the original values
    const { center } = this._box;
    center.copy(this._centerOfBox);

    // Then translate the center
    center.add(deltaCenter);
    return true;
  }

  private scale(ray: Ray): boolean {
    // Take find closest point between the ray and the line perpenducular to the face of in picked box.
    // The distance from this point to the face of in picked box is the change.
    const pointOnSegment = new Vector3();
    ray.distanceSqToSegment(this._minPoint, this._maxPoint, undefined, pointOnSegment);
    const deltaSize = this._planeOfBox.distanceToPoint(pointOnSegment);
    if (deltaSize === 0) {
      return false;
    }
    // First copy the original values
    const { size, center } = this._box;
    size.copy(this._sizeOfBox);
    center.copy(this._centerOfBox);

    // Apply the change
    const index = this._face.index;
    size.setComponent(index, deltaSize + size.getComponent(index));
    this._box.forceMinSize();

    const newDeltaSize = size.getComponent(index) - this._sizeOfBox.getComponent(index);
    if (newDeltaSize === 0) {
      return false; // Nothing has changed
    }
    // The center of the box should be moved by half of the delta size and take the rotation into accont.
    const deltaCenter = (this._face.sign * newDeltaSize) / 2;
    const deltaCenterVector = new Vector3();
    deltaCenterVector.setComponent(index, deltaCenter);
    const rotationMatrix = this.getRotationMatrix();
    deltaCenterVector.applyMatrix4(rotationMatrix);
    center.add(deltaCenterVector);
    return true;
  }

  private rotate(ray: Ray): boolean {
    // Use top face and create a plane on the top face
    const boxFace = new BoxFace(2);
    const normal = boxFace.getNormal();
    normal.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
    normal.normalize();

    const plane = new Plane().setFromNormalAndCoplanarPoint(normal, this._point.clone());
    const endPoint = ray.intersectPlane(plane, new Vector3());
    if (endPoint === null) {
      return false;
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
    this._box.zRotation = forceBetween0AndPi(deltaAngle + this._zRotationOfBox);
    return true;

    function substractXZ(v1: Vector3, v2: Vector3): Vector2 {
      return new Vector2(v1.x - v2.x, v1.z - v2.z);
    }
  }

  public getRotationMatrix(matrix: Matrix4 = new Matrix4()): Matrix4 {
    matrix.makeRotationZ(this._box.zRotation);
    return matrix;
  }
}
