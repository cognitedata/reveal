/*!
 * Copyright 2024 Cognite AS
 */

import { RenderTargetCommand } from '../../base/commands/RenderTargetCommand';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { PointDomainObject } from './PointDomainObject';

export class ShowPointsOnTopCommand extends RenderTargetCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { key: 'POINTS_SHOW_ON_TOP', fallback: 'Show all points on top' };
  }

  public override get icon(): string {
    return 'Flag';
  }

  public override get isEnabled(): boolean {
    return this.getFirstVisible() !== undefined;
  }

  public override get isChecked(): boolean {
    return !this.getDepthTest();
  }

  protected override invokeCore(): boolean {
    const depthTest = this.getDepthTest();
    for (const domainObject of this.rootDomainObject.getDescendantsByType(PointDomainObject)) {
      const style = domainObject.renderStyle;
      style.depthTest = !depthTest;
      domainObject.notify(Changes.renderStyle);
    }
    return true;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private getDepthTest(): boolean {
    const domainObject = this.getFirstVisible();
    if (domainObject === undefined) {
      return false;
    }
    return domainObject.renderStyle.depthTest;
  }

  private getFirstVisible(): PointDomainObject | undefined {
    for (const descendant of this.rootDomainObject.getDescendantsByType(PointDomainObject)) {
      if (descendant.isVisible(this.renderTarget)) {
        return descendant;
      }
    }
    return undefined;
  }
}
