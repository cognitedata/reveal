/*!
 * Copyright 2024 Cognite AS
 */

import { Box3 } from 'three';
import { type Primitive } from '../../../base/utilities/primitives/Primitive';
import { type AnnotationStatus } from '@cognite/sdk';
import { Status } from './Status';

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

  public get firstLabel(): string | undefined {
    return this.isEmpty ? undefined : this.primitives[0].label;
  }

  public get firstConfidence(): number | undefined {
    return this.isEmpty ? undefined : this.primitives[0].confidence;
  }

  // ==================================================
  // INSTANCE METHODS: Getters
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

  public compareId(other: Annotation): boolean {
    return this.id === other.id;
  }

  public expandBoundingBox(boundingBox: Box3): void {
    for (const primitive of this.primitives) {
      const box = primitive.getBoundingBox();
      boundingBox.union(box);
    }
  }
}
