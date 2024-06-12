/*!
 * Copyright 2024 Cognite AS
 */

import { RenderTargetCommand } from '../../base/commands/RenderTargetCommand';
import { type DomainObject } from '../../base/domainObjects/DomainObject';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { PrimitiveRenderStyle } from './PrimitiveRenderStyle';

export abstract class ShowPrimitivesOnTopCommand extends RenderTargetCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get icon(): string {
    return 'EyeShow';
  }

  public override get isEnabled(): boolean {
    return this.getFirstSelectable() !== undefined;
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
      if (!(renderStyle instanceof PrimitiveRenderStyle)) {
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
    const domainObject = this.getFirstSelectable();
    if (domainObject === undefined) {
      return false;
    }
    const renderStyle = domainObject.getRenderStyle();
    if (renderStyle instanceof PrimitiveRenderStyle) {
      return renderStyle.depthTest;
    }
    return false;
  }

  private getFirstSelectable(): DomainObject | undefined {
    for (const domainObject of this.rootDomainObject.getDescendants()) {
      if (this.canBeSelected(domainObject)) {
        return domainObject;
      }
    }
    return undefined;
  }
}
