import { BaseCommand } from './BaseCommand';
import { type RevealRenderTarget } from '../renderTarget/RevealRenderTarget';
import { type RootDomainObject } from '../domainObjects/RootDomainObject';
import { type UndoManager } from '../undo/UndoManager';
import { type Transaction } from '../undo/Transaction';
import { type BaseTool } from './BaseTool';
import { type Class, isInstanceOf } from '../domainObjectsHelpers/Class';
import { type RevealSettingsController } from '../../concrete/reveal/RevealSettingsController';

/**
 * Represents a base class where the render target is known.
 * Subclasses of this class is used to interact with the render target
 */
export abstract class RenderTargetCommand extends BaseCommand {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public _renderTarget: RevealRenderTarget | undefined = undefined;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get renderTarget(): RevealRenderTarget {
    if (this._renderTarget === undefined) {
      throw new Error('Render target is not set. Have you called attach() on this command?');
    }
    return this._renderTarget;
  }

  protected get root(): RootDomainObject {
    return this.renderTarget.root;
  }

  protected get settingsController(): RevealSettingsController {
    return this.renderTarget.revealSettingsController;
  }

  protected get activeTool(): BaseTool | undefined {
    return this.renderTarget.commandsController.activeTool;
  }

  protected getActiveTool<T extends BaseTool>(classType: Class<T>): T | undefined {
    const { activeTool } = this.renderTarget.commandsController;
    return isInstanceOf(activeTool, classType) ? activeTool : undefined;
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override invoke(): boolean {
    const success = this.invokeCore();
    if (success) {
      this._renderTarget?.updateAllCommands();
    }
    return success;
  }

  // ==================================================
  // VIRTUAL METHODS
  // ==================================================

  public get undoManager(): UndoManager | undefined {
    // This method is overridden on BaseTool only!
    const { activeTool } = this;
    if (activeTool === undefined) {
      return undefined;
    }
    return activeTool.undoManager;
  }

  public attach(renderTarget: RevealRenderTarget): void {
    this._renderTarget = renderTarget;
    this.attachChildren();
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  protected attachChildren(): void {
    for (const child of this.getChildren()) {
      if (child instanceof RenderTargetCommand) {
        child.attach(this.renderTarget);
      }
    }
  }

  public addTransaction(transaction: Transaction | undefined): void {
    if (transaction === undefined) {
      return;
    }
    const undoManager = this.undoManager;
    if (undoManager === undefined) {
      return;
    }
    if (undoManager.addTransaction(transaction)) {
      this._renderTarget?.updateAllCommands(); // This refresh the undo button!
    }
  }
}
