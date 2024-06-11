/*!
 * Copyright 2024 Cognite AS
 */

import { RenderTargetCommand } from '../../../base/commands/RenderTargetCommand';
import { type TranslateKey } from '../../../base/utilities/TranslateKey';
import { ExampleDomainObject } from '../ExampleDomainObject';

export class ShowAllExamplesCommand extends RenderTargetCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { key: 'EXAMPLES_SHOW', fallback: 'Show or hide all examples' };
  }

  public override get icon(): string {
    return 'EyeShow';
  }

  public override get isEnabled(): boolean {
    return this.getFirst() !== undefined;
  }

  public override get isChecked(): boolean {
    return this.isAnyVisible();
  }

  protected override invokeCore(): boolean {
    const isVisible = this.isAnyVisible();
    for (const domainObject of this.rootDomainObject.getDescendantsByType(ExampleDomainObject)) {
      domainObject.setVisibleInteractive(!isVisible, this.renderTarget);
    }
    return true;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private isAnyVisible(): boolean {
    for (const descendant of this.rootDomainObject.getDescendantsByType(ExampleDomainObject)) {
      if (descendant.isVisible(this.renderTarget)) {
        return true;
      }
    }
    return false;
  }

  private getFirst(): ExampleDomainObject | undefined {
    return this.rootDomainObject.getDescendantByType(ExampleDomainObject);
  }
}
