/*!
 * Copyright 2024 Cognite AS
 */

import { type DomainObject } from '../domainObjects/DomainObject';
import { Changes } from '../domainObjectsHelpers/Changes';
import { type RevealRenderTarget } from '../renderTarget/RevealRenderTarget';

export abstract class Transaction {
  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public readonly changed: symbol;
  public readonly uniqueId: number;
  private readonly _parentUniqueId?: number;
  public readonly timeStamp = Date.now();

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  protected constructor(domainObject: DomainObject, changed: symbol) {
    this.uniqueId = domainObject.uniqueId;
    this.changed = changed;

    const parent = domainObject.parent;
    if (parent !== undefined) {
      this._parentUniqueId = parent.uniqueId;
    }
  }

  // ==================================================
  // VIRTUAL METHODS (To be overridden)
  // =================================================

  protected abstract undoCore(
    domainObject: DomainObject,
    renderTarget: RevealRenderTarget
  ): boolean;

  // ==================================================
  // INSTANCE METHODS
  // =================================================

  public undo(renderTarget: RevealRenderTarget): boolean {
    const root = renderTarget.rootDomainObject;
    const uniqueId = this.changed === Changes.deleted ? this._parentUniqueId : this.uniqueId;
    if (uniqueId === undefined) {
      return false;
    }
    const domainObject = root.getThisOrDescendantByUniqueId(uniqueId);
    if (domainObject === undefined) {
      return false;
    }
    this.undoCore(domainObject, renderTarget);
    return true;
  }
}
