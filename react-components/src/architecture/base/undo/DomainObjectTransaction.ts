import { Transaction } from './Transaction';
import { type DomainObject } from '../domainObjects/DomainObject';
import { Changes } from '../domainObjectsHelpers/Changes';
import { type RevealRenderTarget } from '../renderTarget/RevealRenderTarget';

/**
 * Represents an generic transaction used for undo.
 * It implements undo transaction for added, deleted, name, color, geometry
 * and render style changes.
 */
export class DomainObjectTransaction extends Transaction {
  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private readonly copy?: DomainObject;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(domainObject: DomainObject, changed: symbol) {
    // if Delete, use the parent as the domainObject
    super(domainObject, changed);
    if (changed === Changes.deleted) {
      this.copy = domainObject.clone();
    } else if (changed !== Changes.added) {
      this.copy = domainObject.clone(changed);
    }
  }

  // ==================================================
  // VIRTUAL METHODS (To be overridden)
  // =================================================

  protected override undoCore(
    domainObject: DomainObject,
    renderTarget: RevealRenderTarget
  ): boolean {
    switch (this.changed) {
      case Changes.added:
        domainObject.removeInteractive();
        break;

      case Changes.deleted: {
        if (this.copy === undefined) {
          return false;
        }
        const newDomainObject = this.copy;

        // The domain object for deleted is the parent
        domainObject.addChildInteractive(newDomainObject);
        newDomainObject.setVisibleInteractive(true, renderTarget);
        break;
      }
      default:
        if (this.copy === undefined) {
          return false;
        }
        domainObject.copyFrom(this.copy, this.changed);
        domainObject.notify(this.changed);
        domainObject.setVisibleInteractive(true, renderTarget);
        break;
    }
    return true;
  }
}
