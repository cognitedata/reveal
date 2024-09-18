/*!
 * Copyright 2024 Cognite AS
 */

import { RenderTargetCommand } from '../../../base/commands/RenderTargetCommand';
import { type BaseCommand } from '../../../base/commands/BaseCommand';
import { PrimitiveType } from '../../primitives/common/PrimitiveType';
import { getIconByPrimitiveType } from '../getIconByPrimitiveType';
import { type TranslateKey } from '../../../base/utilities/TranslateKey';
import { MeasurementTool } from '../MeasurementTool';

export class SetMeasurementTypeCommand extends RenderTargetCommand {
  private readonly _primitiveType: PrimitiveType;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(primitiveType: PrimitiveType) {
    super();
    this._primitiveType = primitiveType;
  }

  // ==================================================
  // OVERRIDES of BaseCommand
  // ==================================================

  public override get icon(): string {
    return getIconByPrimitiveType(this._primitiveType);
  }

  public override get tooltip(): TranslateKey {
    return getTooltipByPrimitiveType(this._primitiveType);
  }

  public override get isEnabled(): boolean {
    return this.tool !== undefined;
  }

  public override get isChecked(): boolean {
    const { tool } = this;
    if (tool === undefined) {
      return false;
    }
    return tool.primitiveType === this._primitiveType;
  }

  protected override invokeCore(): boolean {
    const { tool } = this;
    if (tool === undefined) {
      return false;
    }
    tool.handleEscape();
    tool.clearDragging();
    if (tool.primitiveType === this._primitiveType) {
      tool.primitiveType = PrimitiveType.None;
    } else {
      tool.primitiveType = this._primitiveType;
    }
    return true;
  }

  public override equals(other: BaseCommand): boolean {
    if (!(other instanceof SetMeasurementTypeCommand)) {
      return false;
    }
    return this._primitiveType === other._primitiveType;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private get tool(): MeasurementTool | undefined {
    return this.getActiveTool(MeasurementTool);
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
