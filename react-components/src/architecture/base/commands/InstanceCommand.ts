import { RenderTargetCommand } from './RenderTargetCommand';
import { type DomainObject } from '../domainObjects/DomainObject';

export abstract class InstanceCommand extends RenderTargetCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get isEnabled(): boolean {
    return this.anyInstances;
  }

  // ==================================================
  // VIRTUAL METHODS
  // ==================================================

  protected abstract isInstance(domainObject: DomainObject): boolean;

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  protected get anyInstances(): boolean {
    return this.getFirstInstance() !== undefined;
  }

  protected getFirstInstance(): DomainObject | undefined {
    return this.getInstances().next().value;
  }

  protected *getInstances(): Generator<DomainObject> {
    for (const domainObject of this.rootDomainObject.getDescendants()) {
      if (this.isInstance(domainObject)) {
        yield domainObject;
      }
    }
  }
}
