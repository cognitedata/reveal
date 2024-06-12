/*!
 * Copyright 2024 Cognite AS
 */

import { RenderTargetCommand } from '../../../base/commands/RenderTargetCommand';
import { type BaseCommand } from '../../../base/commands/BaseCommand';
import { PrimitiveType } from '../../boxAndLines/PrimitiveType';
import { getIconByPrimitiveType } from '../getIconByPrimitiveType';
import { type TranslateKey } from '../../../base/utilities/TranslateKey';
import { MeasurementTool } from '../MeasurementTool';

export class SetMeasurementTypeCommand extends RenderTargetCommand {
  private readonly _measureType: PrimitiveType;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(measureType: PrimitiveType) {
    super();
    this._measureType = measureType;
  }

  // ==================================================
  // OVERRIDES of BaseCommand
  // ==================================================

  public override get icon(): string {
    return getIconByPrimitiveType(this._measureType);
  }

  public override get tooltip(): TranslateKey {
    return getTooltipByPrimitiveType(this._measureType);
  }

  public override get isEnabled(): boolean {
    return this.measurementTool !== undefined;
  }

  public override get isChecked(): boolean {
    const { measurementTool } = this;
    if (measurementTool === undefined) {
      return false;
    }
    return measurementTool.primitiveType === this._measureType;
  }

  protected override invokeCore(): boolean {
    const { measurementTool } = this;
    if (measurementTool === undefined) {
      return false;
    }
    measurementTool.handleEscape();
    measurementTool.clearDragging();
    if (measurementTool.primitiveType === this._measureType) {
      measurementTool.primitiveType = PrimitiveType.None;
    } else {
      measurementTool.primitiveType = this._measureType;
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

// ==================================================
// PRIMATE FUNCTIONS
// ==================================================

function getTooltipByPrimitiveType(primitiveType: PrimitiveType): TranslateKey {
  switch (primitiveType) {
    case PrimitiveType.Line:
      return {
        key: 'MEASUREMENTS_ADD_LINE',
        fallback: 'Measure distance between two points. Click at the start point and the end point.'
      };
    case PrimitiveType.Polyline:
      return {
        key: 'MEASUREMENTS_ADD_POLYLINE',
        fallback:
          'Measure the length of a continuous polyline. Click at any number of points and end with Esc.'
      };
    case PrimitiveType.Polygon:
      return {
        key: 'MEASUREMENTS_ADD_POLYGON',
        fallback: 'Measure an area of a polygon. Click at least 3 points and end with Esc.'
      };
    case PrimitiveType.VerticalArea:
      return {
        key: 'MEASUREMENTS_ADD_VERTICAL_AREA',
        fallback: 'Measure rectangular vertical Area. Click at two points in a vertical plan.'
      };
    case PrimitiveType.HorizontalArea:
      return {
        key: 'MEASUREMENTS_ADD_HORIZONTAL_AREA',
        fallback: 'Measure rectangular horizontal Area. Click at three points in a horizontal plan.'
      };
    case PrimitiveType.Box:
      return {
        key: 'MEASUREMENTS_ADD_VOLUME',
        fallback:
          'Measure volume of a box. Click at three points in a horizontal plan and the fourth to give it height.'
      };
    default:
      throw new Error('Unknown PrimitiveType');
  }
}
