/*!
 * Copyright 2024 Cognite AS
 */
import { type Vector3 } from 'three';
import { type IconName } from '../../base/utilities/IconName';
import { type TranslateDelegate, type TranslateKey } from '../../base/utilities/TranslateKey';
import { RenderTargetCommand } from '../../base/commands/RenderTargetCommand';
import { PointsOfInterestTool } from './PointsOfInterestTool';
import { CreatePointsOfInterestWithDescriptionCommand } from './CreatePointsOfInterestWithDescriptionCommand';

export class InitiatePointsOfInterestCommand extends RenderTargetCommand {
  private readonly _position: Vector3;

  constructor(position: Vector3) {
    super();
    this._position = position;
  }

  public override get isEnabled(): boolean {
    return this._position !== undefined;
  }

  public override get icon(): IconName {
    return 'Waypoint';
  }

  public override get tooltip(): TranslateKey {
    return { key: 'CREATE_POI', fallback: 'Create point of interest' };
  }

  public override getLabel(t: TranslateDelegate): string {
    return t('CREATE_POI', 'Create point of interest');
  }

  public override get hasData(): boolean {
    return true;
  }

  protected override invokeCore(): boolean {
    if (this._position === undefined) {
      return false;
    }

    const poiTool = this.renderTarget.commandsController.getToolByType(PointsOfInterestTool);

    if (poiTool === undefined) {
      return false;
    }

    const previousTool = this.renderTarget.commandsController.activeTool;
    this.renderTarget.commandsController.setActiveTool(poiTool);
    const createPointCommand = new CreatePointsOfInterestWithDescriptionCommand(this._position);

    const onFinishCallback = (): void => {
      poiTool.setAnchoredDialogContent(undefined);
    };

    const onCancelCallback = (): void => {
      this.renderTarget.commandsController.setActiveTool(previousTool);
      onFinishCallback();
    };

    createPointCommand.onFinish = onFinishCallback;
    createPointCommand.onCancel = onCancelCallback;

    poiTool.setAnchoredDialogContent({
      contentCommands: [createPointCommand],
      position: this._position,
      onCloseCallback: onCancelCallback
    });

    return true;
  }
}
