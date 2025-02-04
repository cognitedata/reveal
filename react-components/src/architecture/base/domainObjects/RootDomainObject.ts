/*!
 * Copyright 2024 Cognite AS
 */

import { type CogniteClient } from '@cognite/sdk';
import { type RevealRenderTarget } from '../renderTarget/RevealRenderTarget';
import { UnitSystem } from '../renderTarget/UnitSystem';
import { DomainObject } from './DomainObject';
import { FdmSDK } from '../../../data-providers/FdmSDK';
import { type TranslationInput } from '../utilities/TranslateInput';
import { CogniteCadModel, CognitePointCloudModel } from '@cognite/reveal';
import { CadDomainObject } from '../revealDomainObject/cad/CadDomainObject';
import { PointCloudDomainObject } from '../revealDomainObject/pointCloud/PointCloudDomainObject';
import { Image360CollectionDomainObject } from '../revealDomainObject/Image360Collection/Image360CollectionDomainObject';
import { type RevealModel } from '../revealDomainObject/RevealTypes';

export class RootDomainObject extends DomainObject {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _renderTarget: RevealRenderTarget;
  public readonly unitSystem = new UnitSystem();
  private readonly _sdk: CogniteClient;
  private readonly _fdmSdk: FdmSDK;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get renderTarget(): RevealRenderTarget {
    return this._renderTarget;
  }

  public get sdk(): CogniteClient {
    return this._sdk;
  }

  public get fdmSdk(): FdmSDK {
    return this._fdmSdk;
  }

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(renderTarget: RevealRenderTarget, sdk: CogniteClient) {
    super();
    this._renderTarget = renderTarget;
    this._sdk = sdk;
    this._fdmSdk = new FdmSDK(sdk);
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get hasIndexOnLabel(): boolean {
    return false;
  }

  public override get typeName(): TranslationInput {
    return { key: 'SCENE' };
  }

  public override clone(what?: symbol): DomainObject {
    const clone = new RootDomainObject(this.renderTarget, this.sdk);
    clone.copyFrom(this, what);
    return clone;
  }

  // ==================================================
  // INSTANCE METHODS: RevealModel methods
  // ==================================================

  public getDomainObjectByRevealModel(model: RevealModel): DomainObject | undefined {
    if (model instanceof CogniteCadModel) {
      for (const child of this.getChildrenByType(CadDomainObject)) {
        if (child.model === model) {
          return child;
        }
      }
    } else if (model instanceof CognitePointCloudModel) {
      for (const child of this.getChildrenByType(PointCloudDomainObject)) {
        if (child.model === model) {
          return child;
        }
      }
    } else {
      for (const child of this.getChildrenByType(Image360CollectionDomainObject)) {
        if (child.model === model) {
          return child;
        }
      }
    }
    return undefined;
  }

  public addRevealModel(model: RevealModel): void {
    let domainObject: DomainObject;
    if (model instanceof CogniteCadModel) {
      domainObject = new CadDomainObject(model);
    } else if (model instanceof CognitePointCloudModel) {
      domainObject = new PointCloudDomainObject(model);
    } else {
      domainObject = new Image360CollectionDomainObject(model);
    }
    this.addChildInteractive(domainObject);
  }

  public removeRevealModel(model: RevealModel): void {
    const domainObject = this.getDomainObjectByRevealModel(model);
    if (domainObject !== undefined) {
      domainObject.removeInteractive();
    }
  }
}
