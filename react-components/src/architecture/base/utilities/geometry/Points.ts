/*!
 * Copyright 2024 Cognite AS
 */

import { clear } from '../extensions/arrayExtensions';
import { type Range3 } from './Range3';
import { Shape } from './Shape';
import { type Vector3 } from 'three';

export class Points extends Shape {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public list: Vector3[] = [];

  public get length(): number {
    return this.list.length;
  }

  // ==================================================
  // OVERRIDES of Shape:
  // ==================================================

  public override clone(): Shape {
    const result = new Points();
    result.list = [...this.list];
    return result;
  }

  public override expandBoundingBox(boundingBox: Range3): void {
    for (const point of this.list) {
      boundingBox.add(point);
    }
  }

  // ==================================================
  // INSTANCE METHODS: Operations
  // ==================================================

  public add(point: Vector3): void {
    this.list.push(point);
  }

  public clear(): void {
    clear(this.list);
  }
}
