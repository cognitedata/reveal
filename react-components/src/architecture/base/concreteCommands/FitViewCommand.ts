import { type IconName } from '../../base/utilities/IconName';
import { RenderTargetCommand } from '../commands/RenderTargetCommand';
import { type TranslationInput } from '../utilities/TranslateInput';

export class FitViewCommand extends RenderTargetCommand {
  public override get icon(): IconName {
    return 'ExpandAlternative';
  }

  public override get tooltip(): TranslationInput {
    return { key: 'FIT_VIEW_TOOLTIP' };
  }

  protected override invokeCore(): boolean {
    const { renderTarget } = this;
    return renderTarget.fitView();
  }
}
