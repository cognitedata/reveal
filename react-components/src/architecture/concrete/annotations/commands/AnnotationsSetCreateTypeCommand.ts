import { type TranslationInput } from '../../../base/utilities/TranslateInput';
import { type BaseCommand } from '../../../base/commands/BaseCommand';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { RenderTargetCommand } from '../../../base/commands/RenderTargetCommand';
import { AnnotationsCreateTool } from './AnnotationsCreateTool';
import { type IconName } from '../../../base/utilities/IconName';

export class AnnotationsSetCreateTypeCommand extends RenderTargetCommand {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

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
    switch (this._primitiveType) {
      case PrimitiveType.Box:
        return 'Cube';
      case PrimitiveType.HorizontalCylinder:
        return 'CylinderHorizontal';
      case PrimitiveType.VerticalCylinder:
        return 'CylinderVertical';
      default:
        throw new Error('Unknown PrimitiveType');
    }
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
    tool.escape();
    tool.clearDragging();
    if (this.isChecked) {
      tool.primitiveType = PrimitiveType.None;
    } else {
      tool.primitiveType = this._primitiveType;
    }
    return true;
  }

  public override equals(other: BaseCommand): boolean {
    if (!(other instanceof AnnotationsSetCreateTypeCommand)) {
      return false;
    }
    return this._primitiveType === other._primitiveType;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private get tool(): AnnotationsCreateTool | undefined {
    return this.getActiveTool(AnnotationsCreateTool);
  }
}

// ==================================================
// PRIMATE FUNCTIONS
// ==================================================

function getTooltipByPrimitiveType(primitiveType: PrimitiveType): TranslationInput {
  switch (primitiveType) {
    case PrimitiveType.Box:
      return {
        untranslated: 'Create a new box annotation'
      };
    case PrimitiveType.HorizontalCylinder:
      return {
        untranslated:
          'Create a new horizontal cylinder annotation. Click two times to get the center endpoints, the third defines the radius.'
      };
    case PrimitiveType.VerticalCylinder:
      return {
        untranslated:
          'Create a new vertical cylinder annotation. Click two times to get the center endpoints, the third defines the radius.'
      };
    default:
      throw new Error('Unknown PrimitiveType');
  }
}
