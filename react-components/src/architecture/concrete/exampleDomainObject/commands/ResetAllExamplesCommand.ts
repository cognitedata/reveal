/*!
 * Copyright 2024 Cognite AS
 * BaseTool: Base class for the tool are used to interact with the render target.
 */

import { RenderTargetCommand } from '../../../base/commands/RenderTargetCommand';
import { type Tooltip } from '../../../base/commands/BaseCommand';
import { ExampleDomainObject } from '../ExampleDomainObject';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';

export class ResetAllExamplesCommand extends RenderTargetCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): Tooltip {
    return { key: 'EXAMPLES_RESET', fallback: 'Reset all examples' };
  }

  public override get icon(): string {
    return 'Copy';
  }

  public override get isEnabled(): boolean {
    return this.getFirst() !== undefined;
  }

  protected override invokeCore(): boolean {
    for (const domainObject of this.rootDomainObject.getDescendantsByType(ExampleDomainObject)) {
      domainObject.setRenderStyle(undefined);
      domainObject.notify(Changes.renderStyle);
    }
    return true;
  }

  private getFirst(): ExampleDomainObject | undefined {
    return this.rootDomainObject.getDescendantByType(ExampleDomainObject);
  }
}
