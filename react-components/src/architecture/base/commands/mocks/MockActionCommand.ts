/*!
 * Copyright 2024 Cognite AS
 */

import { type IconName } from '../../utilities/IconName';
import { type TranslateKey } from '../../utilities/TranslateKey';
import { RenderTargetCommand } from '../RenderTargetCommand';

export class MockActionCommand extends RenderTargetCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { fallback: 'Action' };
  }

  public override get icon(): IconName {
    return 'Sun';
  }

  protected override get shortCutKey(): string | undefined {
    return 'A';
  }

  protected override get shortCutKeyOnCtrl(): boolean {
    return true;
  }

  protected override invokeCore(): boolean {
    return true;
  }
}
