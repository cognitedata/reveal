/*!
 * Copyright 2024 Cognite AS
 */

import { type Range1 } from './Range1';
import { Range3 } from './Range3';

export abstract class Shape {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private _boundingBox: Range3 | undefined;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get zRange(): Range1 {
    return this.boundingBox.z;
  }

  public get boundingBox(): Range3 {
    if (this._boundingBox === undefined) {
      this._boundingBox = this.calculateBoundingBox();
    }
    return this._boundingBox;
  }

  public set boundingBox(boundingBox) {
    this._boundingBox = boundingBox.clone();
  }

  // ==================================================
  // VIRTUAL METHODS
  // ==================================================

  public abstract clone(): Shape;

  public abstract expandBoundingBox(boundingBox: Range3): void;

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public calculateBoundingBox(): Range3 {
    const boundingBox = new Range3();
    this.expandBoundingBox(boundingBox);
    return boundingBox;
  }

  public touch(): void {
    this._boundingBox = undefined;
  }
}
