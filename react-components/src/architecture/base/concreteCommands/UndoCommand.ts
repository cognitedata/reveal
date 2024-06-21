/*!
 * Copyright 2024 Cognite AS
 */

import { RenderTargetCommand } from '../commands/RenderTargetCommand';
import { CommandsUpdater } from '../reactUpdaters/CommandsUpdater';
import { type UndoManager } from '../undo/UndoManager';
import { type TranslateKey } from '../utilities/TranslateKey';

export class UndoCommand extends RenderTargetCommand {
  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  private get undoManager(): UndoManager | undefined {
    const activeTool = this.renderTarget.commandsController.activeTool;
    if (activeTool === undefined) {
      return undefined;
    }
    return activeTool.undoManager;
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get icon(): string {
    return 'Refresh'; // Should be 'Restore ' but it doesn't exist
  }

  public override get tooltip(): TranslateKey {
    return { key: 'UNDO', fallback: 'Undo [Ctrl+Z]' };
  }

  public override get isEnabled(): boolean {
    const undoManager = this.undoManager;
    if (undoManager === undefined) {
      return false;
    }
    return undoManager.canUndo;
  }

  public override get shortCutKey(): string | undefined {
    return 'Z';
  }

  public override get shortCutKeyOnCtrl(): boolean {
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
    const undone = undoManager.undo(this.renderTarget);
    CommandsUpdater.update(this.renderTarget);
    return undone;
  }
}
