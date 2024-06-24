/*!
 * Copyright 2024 Cognite AS
 */

import { BaseCommand } from './BaseCommand';
import { type RevealRenderTarget } from '../renderTarget/RevealRenderTarget';
import { type RootDomainObject } from '../domainObjects/RootDomainObject';
import { CommandsUpdater } from '../reactUpdaters/CommandsUpdater';
import { type UndoManager } from '../undo/UndoManager';
import { type Transaction } from '../undo/Transaction';

/**
 * Represents a base class where the render target is known.
 * Subclasses of this class is used to interact with the render target
 */
export abstract class RenderTargetCommand extends BaseCommand {
  public _renderTarget: RevealRenderTarget | undefined = undefined;

  public get renderTarget(): RevealRenderTarget {
    if (this._renderTarget === undefined) {
      throw new Error('Render target is not set');
    }
    return this._renderTarget;
  }

  public get rootDomainObject(): RootDomainObject {
    return this.renderTarget.rootDomainObject;
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override invoke(): boolean {
    const success = this.invokeCore();
    if (success) {
      CommandsUpdater.update(this._renderTarget);
    }
    return success;
  }

  // ==================================================
  // VIRTUAL METHODS
  // ==================================================

  public get undoManager(): UndoManager | undefined {
    // This method is overridden on BaseTool only!
    const activeTool = this.renderTarget.commandsController.activeTool;
    if (activeTool === undefined) {
      return undefined;
    }
    return activeTool.undoManager;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public attach(renderTarget: RevealRenderTarget): void {
    this._renderTarget = renderTarget;
  }

  public addTransaction(transaction: Transaction | undefined): void {
    if (transaction === undefined) {
      return;
    }
    const undoManager = this.undoManager;
    if (undoManager === undefined) {
      return;
    }
    const couldUndo = undoManager.canUndo;
    undoManager.addTransaction(transaction);
    if (couldUndo !== undoManager.canUndo) {
      CommandsUpdater.update(this.renderTarget);
    }
  }
}
