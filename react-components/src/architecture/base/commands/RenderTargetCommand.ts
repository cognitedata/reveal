/*!
 * Copyright 2024 Cognite AS
 */

import { BaseCommand } from './BaseCommand';
import { type RevealRenderTarget } from '../renderTarget/RevealRenderTarget';

export abstract class RenderTargetCommand extends BaseCommand {
  public _renderTarget: RevealRenderTarget | undefined = undefined;

  public get renderTarget(): RevealRenderTarget {
    if (this._renderTarget === undefined) {
      throw new Error('Render target is not set');
    }
    return this._renderTarget;
  }

  public override invoke(): boolean {
    const success = this.invokeCore();
    if (success) {
      this.renderTarget.toolController.update();
    }
    return success;
  }

  public attach(renderTarget: RevealRenderTarget): void {
    this._renderTarget = renderTarget;
  }
}
