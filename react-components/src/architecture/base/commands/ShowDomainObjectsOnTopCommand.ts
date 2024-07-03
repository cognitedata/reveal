/*!
 * Copyright 2024 Cognite AS
 */

import { type IconName } from '../../../components/Architecture/getIconComponent';
import { Changes } from '../domainObjectsHelpers/Changes';
import { CommonRenderStyle } from '../renderStyles/CommonRenderStyle';
import { InstanceCommand } from './InstanceCommand';

export abstract class ShowDomainObjectsOnTopCommand extends InstanceCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get icon(): IconName {
    return 'Flag';
  }

  public override get isChecked(): boolean {
    return !this.getDepthTest();
  }

  protected override invokeCore(): boolean {
    const depthTest = this.getDepthTest();
    for (const domainObject of this.getInstances()) {
      const renderStyle = domainObject.getRenderStyle();
      if (!(renderStyle instanceof CommonRenderStyle)) {
        continue;
      }
      this.addTransaction(domainObject.createTransaction(Changes.renderStyle));
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
    if (renderStyle instanceof CommonRenderStyle) {
      return renderStyle.depthTest;
    }
    return false;
  }
}
