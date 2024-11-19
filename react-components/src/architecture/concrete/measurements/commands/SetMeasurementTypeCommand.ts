/*!
 * Copyright 2024 Cognite AS
 */

import { RenderTargetCommand } from '../../../base/commands/RenderTargetCommand';
import { type BaseCommand } from '../../../base/commands/BaseCommand';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { getIconByPrimitiveType } from '../../../base/utilities/primitives/getIconByPrimitiveType';
import { type TranslationInput } from '../../../base/utilities/TranslateInput';
import { MeasurementTool } from '../MeasurementTool';
import { type IconName } from '../../../base/utilities/IconName';

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

  public override get icon(): IconName {
    return getIconByPrimitiveType(this._primitiveType);
  }

  public override get tooltip(): TranslationInput {
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
    tool.onEscapeKey();
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

function getTooltipByPrimitiveType(primitiveType: PrimitiveType): TranslationInput {
  switch (primitiveType) {
    case PrimitiveType.Line:
      return {
        key: 'MEASUREMENTS_ADD_LINE'
      };
    case PrimitiveType.Polyline:
      return {
        key: 'MEASUREMENTS_ADD_POLYLINE'
      };
    case PrimitiveType.Polygon:
      return {
        key: 'MEASUREMENTS_ADD_POLYGON'
      };
    case PrimitiveType.VerticalArea:
      return {
        key: 'MEASUREMENTS_ADD_VERTICAL_AREA'
      };
    case PrimitiveType.HorizontalArea:
      return {
        key: 'MEASUREMENTS_ADD_HORIZONTAL_AREA'
      };
    case PrimitiveType.Box:
      return {
        key: 'MEASUREMENTS_ADD_VOLUME'
      };
    default:
      throw new Error('Unknown PrimitiveType');
  }
}
