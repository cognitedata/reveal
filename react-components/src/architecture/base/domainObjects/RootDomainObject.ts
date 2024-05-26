/*!
 * Copyright 2024 Cognite AS
 */

import { type RevealRenderTarget } from '../renderTarget/RevealRenderTarget';
import { DomainObject } from './DomainObject';

export class RootDomainObject extends DomainObject {
  private readonly _renderTarget: RevealRenderTarget;

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
    console.log(this._renderTarget);
  }

  // ==================================================
  // OVERRIDES of DomainObject
  // ==================================================

  public override get typeName(): string {
    return 'Root';
  }
}
