/*!
 * Copyright 2024 Cognite AS
 */

import { remove } from '../../../base/utilities/extensions/arrayExtensions';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { Annotation } from './Annotation';
import { type Primitive } from '../../../base/utilities/primitives/Primitive';
import { Cylinder } from '../../../base/utilities/primitives/Cylinder';
import { Box } from '../../../base/utilities/primitives/Box';

export class SingleAnnotation {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public annotation: Annotation;
  public selectedPrimitive?: Primitive;

  // ==================================================
  // CONSTRUCTORS
  // ==================================================

  constructor(annotation: Annotation, selectedPrimitive?: Primitive) {
    this.annotation = annotation;
    this.selectedPrimitive = selectedPrimitive;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public get isSingle(): boolean {
    return this.annotation.isSingle;
  }

  public get firstPrimitive(): Primitive | undefined {
    return this.annotation.firstPrimitive;
  }

  public get primitiveType(): PrimitiveType {
    return this.selectedPrimitive?.primitiveType ?? PrimitiveType.None;
  }

  public equals(other: SingleAnnotation | undefined): boolean {
    if (other === undefined) {
      return false;
    }
    return (
      this.annotation === other.annotation && this.selectedPrimitive === other.selectedPrimitive
    );
  }

  public removeSelectedGeometryGeometry(): boolean {
    if (!remove(this.annotation.primitives, this.selectedPrimitive)) {
      return false;
    }
    this.selectedPrimitive = undefined;
    return true;
  }

  public align(horizontal: boolean): boolean {
    const { selectedPrimitive: primitive } = this;
    if (primitive === undefined) {
      return false;
    }
    if (primitive instanceof Box) {
      // Remove x and y rotation
      primitive.rotation.x = 0;
      primitive.rotation.y = 0;
    } else if (primitive instanceof Cylinder) {
      const a = primitive.centerA;
      const b = primitive.centerB;

      if (horizontal) {
        const z = (a.z + b.z) / 2;
        a.z = z;
        b.z = z;
      } else {
        const x = (a.x + b.x) / 2;
        a.x = x;
        b.x = x;
        const y = (a.y + b.y) / 2;
        a.y = y;
        b.y = y;
      }
      if (a.distanceTo(b) < primitive.radius / 4) {
        return false; // Avoid zero length cylinders
      }
    } else {
      return false;
    }
    return true;
  }

  public remap(annotations: Annotation[]): boolean {
    const newAnnotation = annotations.find((a) => a.compareId(this.annotation));
    if (newAnnotation === undefined) {
      return false;
    }
    if (this.annotation !== newAnnotation) {
      this.annotation = newAnnotation;
      this.selectedPrimitive = this.firstPrimitive;
    }
    return true;
  }

  // ==================================================
  // STATIC METHODS
  // ==================================================

  public static areEqual(
    a: SingleAnnotation | undefined,
    b: SingleAnnotation | undefined
  ): boolean {
    if (a === undefined && b === undefined) {
      return true;
    }
    if (a === undefined) {
      return false;
    }
    return a.equals(b);
  }
}

export function createAnnotation(primitive: Primitive): SingleAnnotation {
  const annotation = new Annotation();
  annotation.status = 'approved';
  annotation.primitives.push(primitive);
  return new SingleAnnotation(annotation, primitive);
}
