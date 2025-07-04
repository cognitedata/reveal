import { type TranslationInput } from '../../../../src/architecture/base/utilities/TranslateInput';
import { RenderTargetCommand } from '../../../../src/architecture/base/commands/RenderTargetCommand';

export class MockToggleCommand extends RenderTargetCommand {
  public value = false;
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return { untranslated: 'Boolean' };
  }

  public override get isToggle(): boolean {
    return true;
  }

  public override get isChecked(): boolean {
    return this.value;
  }

  protected override invokeCore(): boolean {
    this.value = !this.value;
    return true;
  }
}
