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

  private readonly _points: Vector3[] = [];
  private _lastIsPending: boolean = false;

  protected get lastIsPending(): boolean {
    return this._lastIsPending;
  }

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get realPointCount(): number {
    return this._lastIsPending ? this.pointCount - 1 : this.pointCount;
  }

  public get pointCount(): number {
    return this._points.length;
  }

  public get points(): Vector3[] {
    return this._points;
  }

  public get lastPoint(): Vector3 {
    return this._points[this._points.length - 1];
  }

  public get firstPoint(): Vector3 {
    return this._points[0];
  }

  // ==================================================
  // VIRTUAL METHODS
  // ==================================================

  public abstract get domainObject(): DomainObject;

  public abstract get maximumPointCount(): number;

  public get minimumPointCount(): number {
    return this.maximumPointCount;
  }

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
    if (this._lastIsPending) {
      replaceLast(this._points, point);
    } else {
      this._points.push(point);
    }
    this._lastIsPending = isPending;
  }

  protected removePendingPoint(): void {
    if (this._lastIsPending) {
      this._points.pop();
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
