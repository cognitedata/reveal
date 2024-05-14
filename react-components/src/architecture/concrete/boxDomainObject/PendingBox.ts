/*!
 * Copyright 2024 Cognite AS
 */

import { Matrix4, type Vector3 } from 'three';
import { horizontalAngle } from '../../base/utilities/extensions/vectorExtensions';
import { Range3 } from '../../base/utilities/geometry/Range3';
import { forceBetween0AndPi } from '../../base/utilities/extensions/mathExtensions';
import { replaceLast } from '../../base/utilities/extensions/arrayExtensions';
import { type BoxDomainObject } from './BoxDomainObject';
import { CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';

/**
 * Helper class for generate a Box by clicking around
 */
export class PendingBox {
  public static MinimumNumberOfPoints = 4;
  // ==================================================
  // INSTANCE FIELDS/PROPERTIES
  // ==================================================

  public readonly boxDomainObject: BoxDomainObject;
  private readonly _points: Vector3[] = [];
  private _lastIsHovering: boolean = false;

  public get countPoint(): number {
    return this._points.length;
  }

  public get hasEnoughPoints(): boolean {
    return this.countPoint >= 3;
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

  public addPoint(point: Vector3, isHovering: boolean): void {
    point = point.clone();
    point.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION.clone().invert());

    if (this._lastIsHovering) {
      replaceLast(this._points, point);
    } else {
      this._points.push(point);
    }
    this._lastIsHovering = isHovering;
    this.rebuild();
  }

  public removeLastHovering(): void {
    if (this._lastIsHovering) {
      this._points.pop();
    }
  }

  /**
   * Create the box by adding points. The first point will make a boc with a center and a tiny size.
   * The second point will give the zRotation and one edge of the box
   * the other will expand the box to include the point.
   * @throws Error if points array is empty.
   */

  public rebuild(): void {
    if (this._points.length === 0) {
      throw new Error('Cannot create a box without points');
    }
    if (this._points.length <= 2) {
      if (this._points.length === 1) {
        // Calculate center and size
        // const margin = distance * MARGIN_FACTOR;
        // range.expandByMargin(margin);
        this.boxDomainObject.forceMinSize();
        this.boxDomainObject.center.copy(this._points[0]);
        return;
      } else if (this._points.length === 2) {
        // Calculate center and size
        // const range = new Range3();
        // for (const point of points) {
        //   range.add(point);
        // }
        // box.center.copy(range.center);
        // box.size.x = horizontalDistanceTo(points[0], points[1]);
        // box.forceMinSize();

        // Calculate zRotation
        const vector = this._points[1].clone();
        vector.sub(this._points[0]);
        this.boxDomainObject.zRotation = forceBetween0AndPi(horizontalAngle(vector));
      }
    }
    const matrix = new Matrix4().makeRotationZ(this.boxDomainObject.zRotation);
    const inverseMatrix = matrix.clone().invert();
    const rotatedRange = new Range3();
    for (const point of this._points) {
      const copy = point.clone();
      copy.applyMatrix4(inverseMatrix);
      rotatedRange.add(copy);
    }
    const center = rotatedRange.center;
    const delta = rotatedRange.delta;
    center.applyMatrix4(matrix);

    // Set the cente and the size
    this.boxDomainObject.center.copy(center);
    this.boxDomainObject.size.copy(delta);
    this.boxDomainObject.forceMinSize();
  }
}
