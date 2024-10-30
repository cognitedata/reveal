/*!
 * Copyright 2024 Cognite AS
 */
import { Image360Action } from '@cognite/reveal';
import { RenderTargetCommand } from '../../commands/RenderTargetCommand';
import { type TranslateKey } from '../../utilities/TranslateKey';
import { type IconName } from '../../utilities/IconName';
import { type BaseCommand } from '../../commands/BaseCommand';
import { CommandsUpdater } from '../../reactUpdaters/CommandsUpdater';

export class Image360ActionCommand extends RenderTargetCommand {
  private readonly _action: Image360Action;

  public constructor(action: Image360Action) {
    super();
    this._action = action;
  }

  public override equals(other: BaseCommand): boolean {
    if (!(other instanceof Image360ActionCommand)) {
      return false;
    }
    return this._action === other._action;
  }

  public override get icon(): IconName {
    switch (this._action) {
      case Image360Action.Backward:
        return 'ArrowLeft';
      case Image360Action.Forward:
        return 'ArrowRight';
      case Image360Action.Enter:
        return 'View360';
      case Image360Action.Exit:
        return 'CloseLarge';
      default:
        throw new Error('Unknown action');
    }
  }

  public override get tooltip(): TranslateKey {
    switch (this._action) {
      case Image360Action.Backward:
        return { fallback: 'Go one 360 image back' };
      case Image360Action.Forward:
        return { fallback: 'Go one 360 image forward' };
      case Image360Action.Enter:
        return { fallback: 'Enter last exited 360 image' };
      case Image360Action.Exit:
        return { fallback: 'Exit 360 image' };
      default:
        throw new Error('Unknown action');
    }
  }

  public override get isEnabled(): boolean {
    return this.renderTarget.viewer.canDoImage360Action(this._action);
  }

  public override invokeCore(): boolean {
    void this.renderTarget.viewer.image360Action(this._action).then(() => {
      CommandsUpdater.update(this.renderTarget);
    });
    return false; // Do not need another update
  }
}
