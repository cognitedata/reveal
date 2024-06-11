/*!
 * Copyright 2024 Cognite AS
 */

import { RenderTargetCommand } from '../../base/commands/RenderTargetCommand';
import { type BaseCommand } from '../../base/commands/BaseCommand';
import { MeasureType, getIconByMeasureType, getTooltipByMeasureType } from './MeasureType';
import { MeasurementTool } from './MeasurementTool';
import { type TranslateKey } from '../../base/utilities/TranslateKey';

export class SetMeasurementTypeCommand extends RenderTargetCommand {
  private readonly _measureType: MeasureType;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(measureType: MeasureType) {
    super();
    this._measureType = measureType;
  }

  // ==================================================
  // OVERRIDES of BaseCommand
  // ==================================================

  public override get icon(): string {
    return getIconByMeasureType(this._measureType);
  }

  public override get tooltip(): TranslateKey {
    return getTooltipByMeasureType(this._measureType);
  }

  public override get isEnabled(): boolean {
    return this.measurementTool !== undefined;
  }

  public override get isChecked(): boolean {
    const { measurementTool } = this;
    if (measurementTool === undefined) {
      return false;
    }
    return measurementTool.measureType === this._measureType;
  }

  protected override invokeCore(): boolean {
    const { measurementTool } = this;
    if (measurementTool === undefined) {
      return false;
    }
    measurementTool.handleEscape();
    measurementTool.clearDragging();
    if (measurementTool.measureType === this._measureType) {
      measurementTool.measureType = MeasureType.None;
    } else {
      measurementTool.measureType = this._measureType;
    }
    return true;
  }

  public override equals(other: BaseCommand): boolean {
    if (!(other instanceof SetMeasurementTypeCommand)) {
      return false;
    }
    return this._measureType === other._measureType;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private get measurementTool(): MeasurementTool | undefined {
    const activeTool = this.renderTarget.commandsController.activeTool;
    if (!(activeTool instanceof MeasurementTool)) {
      return undefined;
    }
    return activeTool;
  }
}
