/*!
 * Copyright 2024 Cognite AS
 */

import { type Box3, type Matrix4 } from 'three';
import { type PrimitiveType } from './PrimitiveType';

export abstract class Primitive {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================
  public confidence: number | undefined = undefined;
  public label: string | undefined = undefined;

  // ==================================================
  // VIRTUAL METHODS FIELDS
  // ==================================================

  public abstract getMatrix(): Matrix4;
  public abstract getBoundingBox(): Box3;
  public abstract get volume(): number;
  public abstract get area(): number;
  public abstract get primitiveType(): PrimitiveType;
}
