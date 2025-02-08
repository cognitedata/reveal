/*!
 * Copyright 2024 Cognite AS
 */

import { type RevealRenderTarget } from '../renderTarget/RevealRenderTarget';
import { UnitSystem } from '../renderTarget/UnitSystem';
import { DomainObject } from './DomainObject';
import { type CogniteClient } from '@cognite/sdk';
import { FdmSDK } from '../../../data-providers/FdmSDK';
import { type TranslationInput } from '../utilities/TranslateInput';
import { type IconName } from '../utilities/IconName';
import { AxisDomainObject } from '../../concrete/axis/AxisDomainObject';

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
    this.addChild(new AxisDomainObject());
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get typeName(): TranslationInput {
    return { key: 'SCENE' };
  }

  public override get icon(): IconName {
    return 'GraphTree';
  }

  public override get hasIconColor(): boolean {
    return false;
  }

  public override get hasIndexOnLabel(): boolean {
    return false;
  }

  public override clone(what?: symbol): DomainObject {
    const clone = new RootDomainObject(this.renderTarget, this.sdk);
    clone.copyFrom(this, what);
    return clone;
  }
}
