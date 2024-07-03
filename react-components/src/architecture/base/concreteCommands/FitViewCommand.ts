/*!
 * Copyright 2024 Cognite AS
 */

import { IconName } from '../../../components/Architecture/getIconComponent';
import { RenderTargetCommand } from '../commands/RenderTargetCommand';
import { type TranslateKey } from '../utilities/TranslateKey';

export class FitViewCommand extends RenderTargetCommand {
  public override get icon(): IconName {
    return 'ExpandAlternative';
  }

  public override get tooltip(): TranslateKey {
    return { key: 'FIT_VIEW_TOOLTIP', fallback: 'Fit view' };
  }

  protected override invokeCore(): boolean {
    const { renderTarget } = this;
    return renderTarget.fitView();
  }
}
