/*!
 * Copyright 2024 Cognite AS
 */

import { type Ray, type Vector3 } from 'three';
import { replaceLast } from '../utilities/extensions/arrayExtensions';
import { CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';
import { type DomainObject } from '../domainObjects/DomainObject';

/**
 * Helper class for create a domain object by clicking around
 */
export abstract class BaseCreator {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _points: Vector3[] = []; // Clicked points
  private _lastIsPending: boolean = false; // If true, the last point is hover and not confirmed.

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get points(): Vector3[] {
    return this._points;
  }

  public get pointCount(): number {
    return this.points.length;
  }

  public get realPointCount(): number {
    return this.lastIsPending ? this.pointCount - 1 : this.pointCount;
  }

  public get firstPoint(): Vector3 {
    return this.points[0];
  }

  public get lastPoint(): Vector3 {
    return this.points[this.pointCount - 1];
  }

  protected get lastIsPending(): boolean {
    return this._lastIsPending;
  }

  // ==================================================
  // VIRTUAL METHODS
  // ==================================================

  public get preferIntersection(): boolean {
    return false;
  }

  public abstract get domainObject(): DomainObject;

  public abstract get maximumPointCount(): number;

  public abstract get minimumPointCount(): number;

  protected abstract addPointCore(
    ray: Ray,
    point: Vector3 | undefined,
    isPending: boolean
  ): boolean;

  public handleEscape(): void {}

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public get isFinished(): boolean {
    return this.realPointCount === this.maximumPointCount;
  }

  public addPoint(ray: Ray, point: Vector3 | undefined, isPending: boolean): boolean {
    if (point !== undefined) {
      point = point.clone();
    }
    this.convertToCdfCoords(ray, point);
    return this.addPointCore(ray, point, isPending);
  }

  protected addRawPoint(point: Vector3, isPending: boolean): void {
    if (this.lastIsPending) {
      replaceLast(this.points, point);
    } else {
      this.points.push(point);
    }
    this._lastIsPending = isPending;
  }

  protected removePendingPoint(): void {
    if (this.lastIsPending) {
      this.points.pop();
      this._lastIsPending = false;
    }
  }

  private convertToCdfCoords(ray: Ray, point: Vector3 | undefined): void {
    const matrix = CDF_TO_VIEWER_TRANSFORMATION.clone().invert();
    ray.applyMatrix4(matrix);
    if (point !== undefined) {
      point.applyMatrix4(matrix);
    }
  }
}
