/*!
 * Copyright 2024 Cognite AS
 */

import { BaseCommand } from './BaseCommand';
import { type RevealRenderTarget } from '../renderTarget/RevealRenderTarget';
import { type RootDomainObject } from '../domainObjects/RootDomainObject';
import { CommandsUpdater } from '../reactUpdaters/CommandsUpdater';
import { type UndoManager } from '../undo/UndoManager';
import { type Transaction } from '../undo/Transaction';
import { type BaseTool } from './BaseTool';

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
      throw new Error('Render target is not set');
    }
    return this._renderTarget;
  }

  protected get rootDomainObject(): RootDomainObject {
    return this.renderTarget.rootDomainObject;
  }

  protected get activeTool(): BaseTool | undefined {
    return this.renderTarget.commandsController.activeTool;
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
    const { activeTool } = this;
    if (activeTool === undefined) {
      return undefined;
    }
    return activeTool.undoManager;
  }

  public attach(renderTarget: RevealRenderTarget): void {
    this._renderTarget = renderTarget;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

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
      CommandsUpdater.update(this.renderTarget); // This refresh the undo button!
    }
  }
}
