/*!
 * Copyright 2024 Cognite AS
 */

import { RenderTargetCommand } from '../commands/RenderTargetCommand';
import { type Tooltip } from '../commands/BaseCommand';

export class FitViewCommand extends RenderTargetCommand {
  public override get icon(): string {
    return 'ExpandAlternative';
  }

  public override get tooltip(): Tooltip {
    return { key: 'FIT_VIEW_TOOLTIP', fallback: 'Fit view' };
  }

  protected override invokeCore(): boolean {
    const { renderTarget } = this;
    return renderTarget.fitView();
  }
}
