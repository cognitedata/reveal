/*!
 * Copyright 2024 Cognite AS
 */

import { type TranslateKey } from '../utilities/TranslateKey';
import { type DomainObject } from '../domainObjects/DomainObject';
import { DomainObjectCommand } from '../commands/DomainObjectCommand';
import { type UndoManager } from '../undo/UndoManager';
import { Changes } from '../domainObjectsHelpers/Changes';

export class DeleteDomainObjectCommand extends DomainObjectCommand<DomainObject> {
  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  private get undoManager(): UndoManager | undefined {
    const root = this._domainObject.rootDomainObject;
    if (root === undefined) {
      return undefined;
    }
    const activeTool = root.renderTarget.commandsController.activeTool;
    if (activeTool === undefined) {
      return undefined;
    }
    return activeTool.undoManager;
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { key: 'DELETE', fallback: 'Delete' };
  }

  public override get icon(): string {
    return 'Delete';
  }

  public override get buttonType(): string {
    return 'ghost-destructive';
  }

  public override get isEnabled(): boolean {
    return this._domainObject.canBeRemoved;
  }

  protected override invokeCore(): boolean {
    const undoManager = this.undoManager;
    if (undoManager !== undefined) {
      const transaction = this._domainObject.createTransaction(Changes.deleted);
      if (transaction !== undefined) {
        undoManager.addTransaction(transaction);
      }
    }
    return this._domainObject.removeInteractive();
  }
}
