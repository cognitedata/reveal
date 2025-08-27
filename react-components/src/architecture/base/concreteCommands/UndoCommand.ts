import { type IconName } from '../../base/utilities/types';
import { RenderTargetCommand } from '../commands/RenderTargetCommand';
import { type TranslationInput } from '../utilities/translation/TranslateInput';

export class UndoCommand extends RenderTargetCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get icon(): IconName {
    return 'Restore';
  }

  public override get tooltip(): TranslationInput {
    return { key: 'UNDO' };
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
      this._renderTarget?.updateAllCommands();
    }
    this.activeTool?.onUndo();
    return undone;
  }
}
