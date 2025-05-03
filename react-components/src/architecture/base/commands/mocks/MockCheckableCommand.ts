/*!
 * Copyright 2024 Cognite AS
 */

import { type IconName } from '../../utilities/IconName';
import { type TranslationInput } from '../../utilities/TranslateInput';
import { RenderTargetCommand } from '../RenderTargetCommand';

export class MockCheckableCommand extends RenderTargetCommand {
  public value = false;
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return { untranslated: 'Checkable action' };
  }

  public override get icon(): IconName {
    return 'Snow';
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
