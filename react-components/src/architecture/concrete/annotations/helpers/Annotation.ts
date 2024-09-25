/*!
 * Copyright 2024 Cognite AS
 */

import { Box3 } from 'three';
import { type Primitive } from '../../../base/utilities/primitives/Primitive';
import { type AnnotationStatus } from '@cognite/sdk';
import { Status } from './Status';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { remove } from '../../../base/utilities/extensions/arrayExtensions';
import { Box } from '../../../base/utilities/primitives/Box';
import { Cylinder } from '../../../base/utilities/primitives/Cylinder';

abstract class AssetId {}

export class AssetCentricAssetId extends AssetId {
  id?: number;
  externalId?: string;

  public constructor(id?: number, externalId?: string) {
    super();
    this.id = id;
    this.externalId = externalId;
  }
}

// class DataModelingAssetId extends AssetId {
//   id: DirectRelationReference;
// }

export class Annotation {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public id: number = 0;
  public modelId: number = 0;
  public assetId: AssetId | undefined = undefined;
  public status: AnnotationStatus = 'suggested';
  public primitives = new Array<Primitive>();
  public confidence: number | undefined = undefined;
  public label: string | undefined = undefined;
  public selectedIndex: number | undefined = undefined;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get isEmpty(): boolean {
    return this.primitives.length === 0;
  }

  public get isSingle(): boolean {
    return this.primitives.length === 1;
  }

  public get hasAssetRef(): boolean {
    return this.assetId !== undefined;
  }

  public get resultingCdfStatus(): AnnotationStatus {
    return this.hasAssetRef ? 'approved' : this.status;
  }

  public get firstPrimitive(): Primitive | undefined {
    return this.isEmpty ? undefined : this.primitives[0];
  }

  public get selectedPrimitive(): Primitive | undefined {
    const index = this.selectedIndex;
    if (index === undefined || index < 0 || index >= this.primitives.length) {
      return undefined;
    }
    return this.primitives[index];
  }

  public get firstLabel(): string | undefined {
    return this.isEmpty ? undefined : this.primitives[0].label;
  }

  public get firstConfidence(): number | undefined {
    return this.isEmpty ? undefined : this.primitives[0].confidence;
  }

  public get primitiveType(): PrimitiveType {
    return this.selectedPrimitive?.primitiveType ?? PrimitiveType.None;
  }

  // ==================================================
  // INSTANCE METHODS: Requests
  // ==================================================

  public equalId(other: Annotation): boolean {
    return this.id === other.id;
  }

  // ==================================================
  // INSTANCE METHODS: Getters/Setters asset ref
  // ==================================================

  public getAssetRefId(): number | undefined {
    if (this.assetId instanceof AssetCentricAssetId) {
      return this.assetId.id;
    }
    return undefined;
  }

  public setAssetRefId(value: number): void {
    if (this.assetId instanceof AssetCentricAssetId) {
      this.assetId.id = value;
    }
    this.assetId = new AssetCentricAssetId(value);
  }

  public getAssetRefExternalId(): string | undefined {
    if (this.assetId instanceof AssetCentricAssetId) {
      return this.assetId.externalId;
    }
    return undefined;
  }

  public setAssetRefExternalId(value: string): void {
    if (this.assetId instanceof AssetCentricAssetId) {
      this.assetId.externalId = value;
    }
    this.assetId = new AssetCentricAssetId(undefined, value);
  }

  // ==================================================
  // INSTANCE METHODS: Getters/Setters other
  // ==================================================

  public getBoundingBox(): Box3 {
    const boundingBox = new Box3().makeEmpty();
    this.expandBoundingBox(boundingBox);
    return boundingBox;
  }

  public getStatus(): Status {
    if (this.primitives.length === 0) {
      return Status.Rejected;
    }
    if (this.hasAssetRef) {
      return Status.Contextualized;
    }
    if (this.status === 'approved') {
      return Status.Approved;
    }
    if (this.status === 'suggested') {
      return Status.Suggested;
    }
    return Status.Rejected;
  }

  public setSelectedPrimitive(primitive: Primitive): void {
    this.selectedIndex = this.primitives.indexOf(primitive);
  }

  // ==================================================
  // INSTANCE METHODS:
  // ==================================================

  public removeSelectedPrimitive(): boolean {
    const selectedPrimitive = this.selectedPrimitive;
    this.selectedIndex = undefined;
    if (selectedPrimitive === undefined) {
      return false;
    }
    if (!remove(this.primitives, selectedPrimitive)) {
      return false;
    }
    return true;
  }

  public expandBoundingBox(boundingBox: Box3): void {
    for (const primitive of this.primitives) {
      primitive.expandBoundingBox(boundingBox);
    }
  }

  public remap(annotations: Annotation[]): undefined | Annotation {
    const newAnnotation = annotations.find((a) => a.equalId(this));
    if (newAnnotation === undefined) {
      return undefined;
    }
    if (this !== newAnnotation) {
      newAnnotation.selectedIndex = this.selectedIndex;
    }
    return newAnnotation;
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
  // ==================================================
  // STATIC METHODS:
  // ==================================================

  public static create(primitive: Primitive): Annotation {
    const annotation = new Annotation();
    annotation.selectedIndex = 0;
    annotation.status = 'approved';
    annotation.primitives.push(primitive);
    return annotation;
  }

  public static areEqualIncludeSelected(
    annotationA: Annotation | undefined,
    annotationB: Annotation | undefined,
    selectedIndexB: number | undefined
  ): boolean {
    if (annotationA === undefined && annotationB === undefined) {
      return true;
    }
    if (annotationA === undefined || annotationB === undefined) {
      return false;
    }
    return annotationA === annotationB && annotationA.selectedIndex === selectedIndexB;
  }

  public static areEqual(
    annotationA: Annotation | undefined,
    annotationB: Annotation | undefined
  ): boolean {
    if (annotationA === undefined && annotationB === undefined) {
      return true;
    }
    if (annotationA === undefined || annotationB === undefined) {
      return false;
    }
    return annotationA === annotationB;
  }
}
