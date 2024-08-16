/*!
 * Copyright 2024 Cognite AS
 */

import { type TranslateKey } from '../../utilities/TranslateKey';
import { RenderTargetCommand } from '../RenderTargetCommand';

export class MockActionCommand extends RenderTargetCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { fallback: 'Action' };
  }

  public override get icon(): string {
    return 'Sun';
  }

  public override get shortCutKey(): string | undefined {
    return 'A';
  }

  public override get shortCutKeyOnCtrl(): boolean {
    return true;
  }

  protected override invokeCore(): boolean {
    return true;
  }
}
