/*!
 * Copyright 2024 Cognite AS
 */
import { RenderTargetCommand } from '../../base/commands/RenderTargetCommand';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { PointDomainObject } from './PointDomainObject';

export class ShowAllPointCommand extends RenderTargetCommand {
  public override get tooltip(): TranslateKey {
    return { key: 'POINTS_SHOWALL', fallback: 'Show all points' };
  }

  public override get icon(): string {
    return 'EyeShow';
  }

  public override invokeCore(): boolean {
    const visible = this.isAnyVisible();
    for (const domainObject of this.rootDomainObject.getDescendantsByType(PointDomainObject)) {
      domainObject.setVisibleInteractive(!visible, this.renderTarget);
    }

    return true;
  }

  private isAnyVisible(): boolean {
    for (const descendant of this.rootDomainObject.getDescendantsByType(PointDomainObject)) {
      if (descendant.isVisible(this.renderTarget)) {
        return true;
      }
    }
    return false;
  }

  public override get isEnabled(): boolean {
    return this.rootDomainObject.getDescendantsByType(PointDomainObject) !== undefined;
  }
}
