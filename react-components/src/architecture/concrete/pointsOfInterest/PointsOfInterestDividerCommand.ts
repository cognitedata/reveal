import { DividerCommand } from '../../base/commands/DividerCommand';
import { PointsOfInterestTool } from './PointsOfInterestTool';

export class PointsOfInterestDividerCommand extends DividerCommand {
  public override get isVisible(): boolean {
    return this.renderTarget.commandsController.getToolByType(PointsOfInterestTool) !== undefined;
  }
}
