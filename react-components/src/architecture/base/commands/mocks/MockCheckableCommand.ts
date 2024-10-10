/*!
 * Copyright 2024 Cognite AS
 */

import { type IconName } from '../../utilities/IconName';
import { type TranslateKey } from '../../utilities/TranslateKey';
import { RenderTargetCommand } from '../RenderTargetCommand';

export class MockCheckableCommand extends RenderTargetCommand {
  public value = false;
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { fallback: 'Checkable action' };
  }

  public override get icon(): IconName {
    return 'Snow';
  }

  public override get isChecked(): boolean {
    return this.value;
  }

  protected override invokeCore(): boolean {
    this.value = !this.value;
    return true;
  }

  public override get isToggle(): boolean {
    return true;
  }
}
