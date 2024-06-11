/*!
 * Copyright 2024 Cognite AS
 */
import { RenderTargetCommand } from '../../base/commands/RenderTargetCommand';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { PointDomainObject } from './PointDomainObject';

export class ResetAllPointsCommand extends RenderTargetCommand {
  public override get tooltip(): TranslateKey {
    return { key: 'POINTS_RESET', fallback: 'Reset the visual style in all points' };
  }

  public override get icon(): string {
    return 'ClearAll';
  }

  protected override invokeCore(): boolean {
    for (const domainObject of this.rootDomainObject.getDescendantsByType(PointDomainObject)) {
      domainObject.setRenderStyle(undefined);
      domainObject.notify(Changes.renderStyle);
    }
    return true; // Indicate success
  }

  public override get isEnabled(): boolean {
    return this.rootDomainObject.getDescendantsByType(PointDomainObject) !== undefined;
  }
}
