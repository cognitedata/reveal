import { type DomainObject } from '../domainObjects/DomainObject';
import { RenderTargetCommand } from './RenderTargetCommand';

export abstract class DomainObjectCommand<Type extends DomainObject> extends RenderTargetCommand {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  protected readonly _domainObject: Type;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(domainObject: Type) {
    super();
    this._domainObject = domainObject;
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get hasData(): boolean {
    return true;
  }
}
