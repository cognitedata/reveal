import { RenderTargetCommand } from '../../base/commands/RenderTargetCommand';
import { PointsOfInterestDomainObject } from './PointsOfInterestDomainObject';
import { PointsOfInterestTool } from './PointsOfInterestTool';

export class PointsOfInterestCommand<PoiIdType> extends RenderTargetCommand {
  protected getTool(): PointsOfInterestTool<PoiIdType> | undefined {
    return this.getActiveTool(PointsOfInterestTool);
  }

  protected getPointsOfInterestDomainObject(): PointsOfInterestDomainObject<PoiIdType> | undefined {
    return this.root.getDescendantByType(PointsOfInterestDomainObject);
  }
}
