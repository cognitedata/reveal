/*!
 * Copyright 2024 Cognite AS
 */
import { Vector3 } from 'three';
import { type IconName } from '../../base/utilities/IconName';
import { TranslateDelegate, type TranslateKey } from '../../base/utilities/TranslateKey';
import { RenderTargetCommand } from '../../base/commands/RenderTargetCommand';
import { getDefaultCommand } from '../../../components/Architecture/utilities';
import { PointsOfInterestTool } from './PointsOfInterestTool';
import { CreatePointsOfInterestWithDescriptionCommand } from './CreatePointsOfInterestWithDescriptionCommand';

export class InitiatePointsOfInterestCommand<PoIIdType> extends RenderTargetCommand {
  private _position?: Vector3;

  constructor() {
    super();
    this._position = undefined;
  }

  public get position(): Vector3 | undefined {
    return this._position;
  }

  public set position(position: Vector3 | undefined) {
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

  protected override invokeCore(): boolean {
    if (this._position === undefined) {
      return false;
    }

    const poiTool = getDefaultCommand(new PointsOfInterestTool(), this.renderTarget);
    const previousTool = this.renderTarget.commandsController.activeTool;
    this.renderTarget.commandsController.setActiveTool(poiTool);
    const createPointCommand = getDefaultCommand(
      new CreatePointsOfInterestWithDescriptionCommand(),
      this.renderTarget
    );

    const onFinishCallback = () => {
      poiTool.setAnchoredDialogContent(undefined);
    };

    const onCancelCallback = () => {
      this.renderTarget.commandsController.setActiveTool(previousTool);
      onFinishCallback();
    };

    createPointCommand.position = this._position;
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
