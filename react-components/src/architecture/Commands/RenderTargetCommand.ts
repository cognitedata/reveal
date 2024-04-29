/*!
 * Copyright 2024 Cognite AS
 */

import { BaseCommand } from './BaseCommand';
import { type RevealRenderTarget } from '../renderTarget/RevealRenderTarget';

export abstract class RenderTargetCommand extends BaseCommand {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public readonly renderTarget: RevealRenderTarget;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  protected constructor(renderTarget: RevealRenderTarget) {
    super();
    this.renderTarget = renderTarget;
  }
}
