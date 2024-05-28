/*!
 * Copyright 2024 Cognite AS
 */

import { BaseCommand } from './BaseCommand';
import { type RevealRenderTarget } from '../renderTarget/RevealRenderTarget';
import { type RootDomainObject } from '../domainObjects/RootDomainObject';
import { UiUpdater } from '../domainObjectsHelpers/UiUpdater';

/**
 * Represents a base class where the render target is known.
 * Subclasses of this class is used to interact with the render target
 */
export abstract class RenderTargetCommand extends BaseCommand {
  public _renderTarget: RevealRenderTarget | undefined = undefined;

  public get renderTarget(): RevealRenderTarget {
    if (this._renderTarget === undefined) {
      throw new Error('Render target is not set');
    }
    return this._renderTarget;
  }

  public get rootDomainObject(): RootDomainObject {
    return this.renderTarget.rootDomainObject;
  }

  public override invoke(): boolean {
    const success = this.invokeCore();
    if (success) {
      UiUpdater.update(this._renderTarget);
    }
    return success;
  }

  public attach(renderTarget: RevealRenderTarget): void {
    this._renderTarget = renderTarget;
  }
}
