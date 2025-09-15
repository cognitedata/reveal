import { CadDomainObject } from '../CadDomainObject';
import { DividerCommand } from '../../../../base/commands/DividerCommand';

export class CadDividerCommand extends DividerCommand {
  public override get isVisible(): boolean {
    return this.root.getDescendantByType(CadDomainObject) !== undefined;
  }
}
