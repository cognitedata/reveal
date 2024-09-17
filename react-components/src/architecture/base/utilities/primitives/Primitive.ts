/*!
 * Copyright 2024 Cognite AS
 */

import { type Box3, type Matrix4 } from 'three';

export abstract class Primitive {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================
  public confidence: number | undefined = undefined;
  public label: string | undefined = undefined;

  // ==================================================
  // VIRTUAL METHODS FIELDS
  // ==================================================

  public abstract getMatrix(matrix: Matrix4): Matrix4;
  public abstract getBoundingBox(): Box3;
}
