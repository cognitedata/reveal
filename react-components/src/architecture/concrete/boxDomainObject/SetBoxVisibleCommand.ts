/*!
 * Copyright 2024 Cognite AS
 * BaseTool: Base class for the tool are used to interact with the render target.
 */
/* eslint-disable @typescript-eslint/class-literal-property-style */

import { RenderTargetCommand } from '../../base/commands/RenderTargetCommand';
import { BoxDomainObject } from './BoxDomainObject';
import { type Tooltip } from '../../base/commands/BaseCommand';

export const BOX_NAME = 'BOX';

export class SetBoxVisibleCommand extends RenderTargetCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get icon(): string {
    return 'CheckmarkAlternative';
  }

  public override get tooltip(): Tooltip {
    return { key: 'UNKNOWN', fallback: 'Set measurement box visible' };
  }

  protected override invokeCore(): boolean {
    const { renderTarget } = this;
    const { rootDomainObject } = renderTarget;

    let isVisible = false;
    for (const boxDomainObject of rootDomainObject.getDescendantsByType(BoxDomainObject)) {
      if (boxDomainObject.isVisible(renderTarget)) {
        isVisible = true;
        break;
      }
    }
    for (const boxDomainObject of rootDomainObject.getDescendantsByType(BoxDomainObject)) {
      boxDomainObject.setVisibleInteractive(!isVisible, renderTarget);
    }
    return true;
  }
}
