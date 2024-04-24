/*!
 * Copyright 2024 Cognite AS
 */

import { BaseCommand } from './BaseCommand';
import { type RevealRenderTarget } from '../RenderTarget/RevealRenderTarget';

export abstract class RenderTargetCommand extends BaseCommand {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================
  public readonly target: RevealRenderTarget;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  protected constructor(target: RevealRenderTarget) {
    super();
    this.target = target;
  }
}
