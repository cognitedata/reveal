/*!
 * Copyright 2024 Cognite AS
 */
import { RenderTargetCommand } from '../../base/commands/RenderTargetCommand';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { PointDomainObject } from './PointDomainObject';

export class DeleteAllPointsCommand extends RenderTargetCommand {
  public override get tooltip(): TranslateKey {
    return { key: 'POINTS_DELETE', fallback: 'Delete all points' };
  }

  public override get icon(): string {
    return 'Delete';
  }

  public override get buttonType(): string {
    return 'ghost-destructive';
  }

  public override invokeCore(): boolean {
    const children = this.rootDomainObject.getThisAndDescendantsByType(PointDomainObject);
    const array = Array.from(children);
    array.reverse();
    for (const domainObject of array) {
      domainObject.removeInteractive(true);
    }
    return true; // Indicate success
  }

  public override get isEnabled(): boolean {
    return this.rootDomainObject.getDescendantsByType(PointDomainObject) !== undefined;
  }
}
