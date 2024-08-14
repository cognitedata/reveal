/*!
 * Copyright 2024 Cognite AS
 */

import { type RevealRenderTarget } from '../renderTarget/RevealRenderTarget';
import { UnitSystem } from '../renderTarget/UnitSystem';
import { DomainObject } from './DomainObject';
import { type TranslateKey } from '../utilities/TranslateKey';

export class RootDomainObject extends DomainObject {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _renderTarget: RevealRenderTarget;
  public readonly unitSystem = new UnitSystem();

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get renderTarget(): RevealRenderTarget {
    return this._renderTarget;
  }

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(renderTarget: RevealRenderTarget) {
    super();
    this.name = 'Root';
    this._renderTarget = renderTarget;
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get typeName(): TranslateKey {
    return { fallback: 'Root' };
  }

  public override clone(what?: symbol): DomainObject {
    const clone = new RootDomainObject(this.renderTarget);
    clone.copyFrom(this, what);
    return clone;
  }
}
