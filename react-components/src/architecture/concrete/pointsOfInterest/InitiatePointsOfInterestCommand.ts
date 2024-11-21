/*!
 * Copyright 2024 Cognite AS
 */
import { type Vector3 } from 'three';
import { type IconName } from '../../base/utilities/IconName';
import { type TranslationInput } from '../../base/utilities/TranslateInput';
import { RenderTargetCommand } from '../../base/commands/RenderTargetCommand';
import { PointsOfInterestTool } from './PointsOfInterestTool';

export class InitiatePointsOfInterestCommand extends RenderTargetCommand {
  private readonly _position: Vector3;

  constructor(position: Vector3) {
    super();
    this._position = position;
  }

  public override get hasData(): boolean {
    return true;
  }

  public override get icon(): IconName {
    return 'Waypoint';
  }

  public override get tooltip(): TranslationInput {
    return { key: 'POINT_OF_INTEREST_CREATE' };
  }

  protected override invokeCore(): boolean {
    const poiTool = this.renderTarget.commandsController.getToolByType(PointsOfInterestTool);

    if (poiTool === undefined) {
      return false;
    }

    this.renderTarget.commandsController.setActiveTool(poiTool);
    poiTool.openCreateCommandDialog(this._position);

    return true;
  }
}
