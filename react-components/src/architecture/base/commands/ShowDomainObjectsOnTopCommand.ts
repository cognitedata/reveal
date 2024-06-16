/*!
 * Copyright 2024 Cognite AS
 */

import { Changes } from '../domainObjectsHelpers/Changes';
import { DepthTestRenderStyle } from '../renderStyles/DepthTestRenderStyle';
import { InstanceCommand } from './InstanceCommand';

export abstract class ShowDomainObjectsOnTopCommand extends InstanceCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get icon(): string {
    return 'EyeShow';
  }

  public override get isChecked(): boolean {
    return !this.getDepthTest();
  }

  protected override invokeCore(): boolean {
    const depthTest = this.getDepthTest();
    for (const domainObject of this.getInstances()) {
      const renderStyle = domainObject.getRenderStyle();
      if (!(renderStyle instanceof DepthTestRenderStyle)) {
        continue;
      }
      renderStyle.depthTest = !depthTest;
      domainObject.notify(Changes.renderStyle);
    }
    return true;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private getDepthTest(): boolean {
    const domainObject = this.getFirstInstance();
    if (domainObject === undefined) {
      return false;
    }
    const renderStyle = domainObject.getRenderStyle();
    if (renderStyle instanceof DepthTestRenderStyle) {
      return renderStyle.depthTest;
    }
    return false;
  }
}
