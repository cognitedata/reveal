import { RenderTargetCommand } from '../../../base/commands/RenderTargetCommand';
import { type BaseCommand } from '../../../base/commands/BaseCommand';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { getIconByPrimitiveType } from '../../../base/utilities/primitives/getIconByPrimitiveType';
import { type TranslationInput } from '../../../base/utilities/TranslateInput';
import { MeasurementTool } from '../MeasurementTool';
import { type IconName } from '../../../base/utilities/IconName';

export const MEASURE_PRIMITIVE_TYPES = [
  PrimitiveType.Line,
  PrimitiveType.Polyline,
  PrimitiveType.Polygon,
  PrimitiveType.VerticalArea,
  PrimitiveType.HorizontalArea,
  PrimitiveType.Box,
  PrimitiveType.HorizontalCircle,
  PrimitiveType.VerticalCylinder,
  PrimitiveType.HorizontalCylinder
];

export class SetMeasurementTypeCommand extends RenderTargetCommand {
  private readonly _primitiveType: PrimitiveType;

  public get primitiveType(): PrimitiveType {
    return this._primitiveType;
  }

  // CONSTRUCTOR
  // ==================================================

  public constructor(primitiveType: PrimitiveType) {
    super();
    if (!MEASURE_PRIMITIVE_TYPES.includes(primitiveType)) {
      throw new Error(`Invalid primitive type: ${primitiveType}`);
    }
    this._primitiveType = primitiveType;
  }

  // ==================================================
  // OVERRIDES of BaseCommand
  // ==================================================

  public override get icon(): IconName {
    return getIconByPrimitiveType(this.primitiveType);
  }

  public override get tooltip(): TranslationInput {
    return getTooltipByPrimitiveType(this.primitiveType);
  }

  public override get isEnabled(): boolean {
    return this.tool !== undefined;
  }

  public override get isChecked(): boolean {
    const { tool } = this;
    if (tool === undefined) {
      return false;
    }
    return tool.primitiveType === this.primitiveType;
  }

  protected override invokeCore(): boolean {
    const { tool } = this;
    if (tool === undefined) {
      return false;
    }
    const isChecked = tool.primitiveType === this.primitiveType;
    tool.escape();
    tool.clearDragging();
    if (isChecked) {
      tool.primitiveType = PrimitiveType.None;
    } else {
      tool.primitiveType = this.primitiveType;
    }
    return true;
  }

  public override equals(other: BaseCommand): boolean {
    if (!(other instanceof SetMeasurementTypeCommand)) {
      return false;
    }
    return this.primitiveType === other.primitiveType;
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
      return { key: 'MEASUREMENTS_ADD_LINE' };
    case PrimitiveType.Polyline:
      return { key: 'MEASUREMENTS_ADD_POLYLINE' };
    case PrimitiveType.Polygon:
      return { key: 'MEASUREMENTS_ADD_POLYGON' };
    case PrimitiveType.VerticalArea:
      return { key: 'MEASUREMENTS_ADD_VERTICAL_AREA' };
    case PrimitiveType.HorizontalArea:
      return { key: 'MEASUREMENTS_ADD_HORIZONTAL_AREA' };
    case PrimitiveType.Box:
      return { key: 'MEASUREMENTS_ADD_VOLUME' };
    case PrimitiveType.HorizontalCircle:
      return { key: 'MEASUREMENTS_ADD_CIRCLE' };
    case PrimitiveType.VerticalCylinder:
      return { key: 'MEASUREMENTS_ADD_CYLINDER_VERTICAL' };
    case PrimitiveType.HorizontalCylinder:
      return { key: 'MEASUREMENTS_ADD_CYLINDER_HORIZONTAL' };
    default:
      throw new Error('Unknown PrimitiveType');
  }
}
