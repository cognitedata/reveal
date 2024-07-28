/*!
 * Copyright 2024 Cognite AS
 */

import { type RevealRenderTarget } from '../renderTarget/RevealRenderTarget';
import { type TranslateKey } from '../utilities/TranslateKey';
import { type BaseCommand } from '../commands/BaseCommand';
import { RenderTargetCommand } from '../commands/RenderTargetCommand';

export class SettingsCommand extends RenderTargetCommand {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _commands: BaseCommand[] = [];

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { key: 'SETTINGS_TOOLTIP', fallback: 'Settings' };
  }

  public override get icon(): string | undefined {
    return 'Settings';
  }

  public override attach(renderTarget: RevealRenderTarget): void {
    super.attach(renderTarget);
    for (const command of this._commands) {
      if (command instanceof RenderTargetCommand) {
        command.attach(renderTarget);
      }
    }
  }
  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public add(command: BaseCommand): void {
    this._commands.push(command);
  }

  public get commands(): BaseCommand[] {
    return this._commands;
  }
}
