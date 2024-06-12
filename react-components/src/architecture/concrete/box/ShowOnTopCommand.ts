/*!
 * Copyright 2024 Cognite AS
 */

import { RenderTargetCommand } from '../../base/commands/RenderTargetCommand';
import { type DomainObject } from '../../base/domainObjects/DomainObject';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { TextRenderStyle } from './TextRenderStyle';

export abstract class ShowOnTopCommand extends RenderTargetCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get icon(): string {
    return 'EyeShow';
  }

  public override get isEnabled(): boolean {
    return this.getFirst() !== undefined;
  }

  public override get isChecked(): boolean {
    return !this.getDepthTest();
  }

  protected override invokeCore(): boolean {
    const depthTest = this.getDepthTest();
    for (const domainObject of this.rootDomainObject.getDescendants()) {
      if (!this.canBeSelected(domainObject)) {
        continue;
      }
      const renderStyle = domainObject.getRenderStyle();
      if (!(renderStyle instanceof TextRenderStyle)) {
        continue;
      }
      renderStyle.depthTest = !depthTest;
      domainObject.notify(Changes.renderStyle);
    }
    return true;
  }

  // ==================================================
  // VIRTUAL METHODS
  // ==================================================

  protected abstract canBeSelected(domainObject: DomainObject): boolean;

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private getDepthTest(): boolean {
    const domainObject = this.getFirst();
    if (domainObject === undefined) {
      return false;
    }
    const renderStyle = domainObject.getRenderStyle();
    if (renderStyle instanceof TextRenderStyle) {
      return renderStyle.depthTest;
    }
    return false;
  }

  private getFirst(): DomainObject | undefined {
    for (const domainObject of this.rootDomainObject.getDescendants()) {
      if (this.canBeSelected(domainObject)) {
        return domainObject;
      }
    }
    return undefined;
  }
}
