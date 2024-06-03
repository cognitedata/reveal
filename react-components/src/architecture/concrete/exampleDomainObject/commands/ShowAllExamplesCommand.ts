/*!
 * Copyright 2024 Cognite AS
 * BaseTool: Base class for the tool are used to interact with the render target.
 */

import { RenderTargetCommand } from '../../../base/commands/RenderTargetCommand';
import { type Tooltip } from '../../../base/commands/BaseCommand';
import { ExampleDomainObject } from '../ExampleDomainObject';

export class ShowAllExamplesCommand extends RenderTargetCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): Tooltip {
    return { key: 'EXAMPLES_SHOW', fallback: 'Show or hide all examples' };
  }

  public override get icon(): string {
    return 'EyeShow';
  }

  public override get isEnabled(): boolean {
    return this.getFirst() !== undefined;
  }

  public override get isCheckable(): boolean {
    return true;
  }

  public override get isChecked(): boolean {
    const domainObject = this.getFirst();
    if (domainObject === undefined) {
      return false;
    }
    return domainObject.isVisible(this.renderTarget);
  }

  protected override invokeCore(): boolean {
    const isVisible = this.isChecked;
    for (const domainObject of this.rootDomainObject.getDescendantsByType(ExampleDomainObject)) {
      domainObject.setVisibleInteractive(!isVisible, this.renderTarget);
    }
    return true;
  }

  private getFirst(): ExampleDomainObject | undefined {
    return this.rootDomainObject.getDescendantByType(ExampleDomainObject);
  }
}
