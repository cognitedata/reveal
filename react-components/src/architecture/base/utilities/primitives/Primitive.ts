/*!
 * Copyright 2024 Cognite AS
 */

import { Box3, type Ray, type Vector3, type Matrix4 } from 'three';
import { type PrimitiveType } from './PrimitiveType';

export abstract class Primitive {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public confidence: number | undefined = undefined;
  public label: string | undefined = undefined;

  // ==================================================
  // VIRTUAL METHODS
  // ==================================================

  public abstract get primitiveType(): PrimitiveType;
  public abstract get volume(): number;
  public abstract get area(): number;
  public abstract get diagonal(): number;

  public abstract getMatrix(): Matrix4;
  public abstract setMatrix(matrix: Matrix4): void;
  public abstract expandBoundingBox(boundingBox: Box3): void;

  public abstract isPointInside(point: Vector3, globalMatrix: Matrix4): boolean;
  public abstract intersectRay(ray: Ray, globalMatrix: Matrix4): Vector3 | undefined;

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public getBoundingBox(): Box3 {
    const boundingBox = new Box3().makeEmpty();
    this.expandBoundingBox(boundingBox);
    return boundingBox;
  }
}
