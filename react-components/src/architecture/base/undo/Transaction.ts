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

  public readonly uniqueId: number;
  public readonly changed: symbol;
  protected readonly parentUniqueId: number;
  public readonly timeStamp = Date.now();

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  protected constructor(domainObject: DomainObject, changed: symbol) {
    this.uniqueId = domainObject.uniqueId;
    this.changed = changed;

    const parent = domainObject.parent;
    if (parent === undefined) {
      throw new Error('Parent is undefined');
    }
    this.parentUniqueId = parent.uniqueId;
  }

  // ==================================================
  // VIRTUAL METHODS (To be override)
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
    const uniqueId = this.changed === Changes.deleted ? this.parentUniqueId : this.uniqueId;
    const domainObject = root.getThisOrDescendantByUniqueId(uniqueId);
    if (domainObject === undefined) {
      return false;
    }
    this.undoCore(domainObject, root.renderTarget);
    return true;
  }
}
