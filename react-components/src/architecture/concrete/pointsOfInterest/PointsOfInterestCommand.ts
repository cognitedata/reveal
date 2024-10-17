/*!
 * Copyright 2024 Cognite AS
 */
import { RenderTargetCommand } from '../../base/commands/RenderTargetCommand';
import { PointsOfInterestDomainObject } from './PointsOfInterestDomainObject';
import { PointsOfInterestTool } from './PointsOfInterestTool';

export abstract class PointsOfInterestCommand<PoIIdType> extends RenderTargetCommand {
  protected getTool(): PointsOfInterestTool<PoIIdType> | undefined {
    return this.getActiveTool(PointsOfInterestTool);
  }

  protected getPointsOfInterestDomainObject(): PointsOfInterestDomainObject<PoIIdType> | undefined {
    return this.rootDomainObject.getDescendantByType(PointsOfInterestDomainObject);
  }
}
