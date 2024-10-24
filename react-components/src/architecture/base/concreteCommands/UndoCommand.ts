/*!
 * Copyright 2024 Cognite AS
 */

import { type IconName } from '../../base/utilities/IconName';
import { RenderTargetCommand } from '../commands/RenderTargetCommand';
import { CommandsUpdater } from '../reactUpdaters/CommandsUpdater';
import { type TranslateKey } from '../utilities/TranslateKey';

export class UndoCommand extends RenderTargetCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get icon(): IconName {
    return 'Restore';
  }

  public override get tooltip(): TranslateKey {
    return { key: 'UNDO', fallback: 'Undo' };
  }

  public override get isEnabled(): boolean {
    const undoManager = this.undoManager;
    if (undoManager === undefined) {
      return false;
    }
    return undoManager.canUndo;
  }

  protected override get shortCutKey(): string | undefined {
    return 'Z';
  }

  protected override get shortCutKeyOnCtrl(): boolean {
    return true;
  }

  public override get isVisible(): boolean {
    return true; // Let it always be there in case many clicks
  }

  protected override invokeCore(): boolean {
    const undoManager = this.undoManager;
    if (undoManager === undefined) {
      return false;
    }
    const couldUndo = undoManager.canUndo;
    const undone = undoManager.undo(this.renderTarget);
    if (couldUndo !== undoManager.canUndo) {
      CommandsUpdater.update(this.renderTarget);
    }
    this.activeTool?.onUndo();
    return undone;
  }
}
