import { PointCloudDomainObject } from '../PointCloudDomainObject';
import { DividerCommand } from '../../../../base/commands/DividerCommand';

export class PointCloudDividerCommand extends DividerCommand {
  public override get isVisible(): boolean {
    return this.root.getDescendantByType(PointCloudDomainObject) !== undefined;
  }
}
