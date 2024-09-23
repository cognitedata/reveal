/*!
 * Copyright 2024 Cognite AS
 */

import { type Primitive } from '../../base/utilities/primitives/Primitive';
import { type AnnotationStatus } from '@cognite/sdk';

abstract class AssetId {}

export class AssetCentricAssetId extends AssetId {
  id?: number;
  externalId?: string;
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

  public get hasAssetRef(): boolean {
    return this.assetId !== undefined;
  }

  public get resultingStatus(): AnnotationStatus {
    return this.hasAssetRef ? 'approved' : this.status;
  }

  public get firstLabel(): string | undefined {
    return this.isEmpty ? undefined : this.primitives[0].label;
  }

  public get getConfidence(): number | undefined {
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

  public getAssetRefExternalId(): string | undefined {
    if (this.assetId instanceof AssetCentricAssetId) {
      return this.assetId.externalId;
    }
    return undefined;
  }
}
