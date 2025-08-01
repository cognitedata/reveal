import { PointCloudDomainObject } from '../../../concrete/reveal/pointCloud/PointCloudDomainObject';
import { DividerCommand } from '../../commands/DividerCommand';

export class PointCloudDividerCommand extends DividerCommand {
  public override get isVisible(): boolean {
    return this.rootDomainObject.getDescendantsByType(PointCloudDomainObject) !== undefined;
  }
}
