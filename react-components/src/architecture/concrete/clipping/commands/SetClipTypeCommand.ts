import { RenderTargetCommand } from '../../../base/commands/RenderTargetCommand';
import { type BaseCommand } from '../../../base/commands/BaseCommand';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { type TranslationInput } from '../../../base/utilities/TranslateInput';
import { ClipTool } from '../ClipTool';
import { getIconByPrimitiveType } from '../../../base/utilities/primitives/getIconByPrimitiveType';
import { SliceDomainObject } from '../SliceDomainObject';
import { type IconName } from '../../../base/utilities/IconName';

export class SetClipTypeCommand extends RenderTargetCommand {
  private readonly _primitiveType: PrimitiveType;

  public get primitiveType(): PrimitiveType {
    return this._primitiveType;
  }

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
    return getIconByPrimitiveType(this.primitiveType);
  }

  public override get tooltip(): TranslationInput {
    return getTooltipByPrimitiveType(this.primitiveType);
  }

  public override get isVisible(): boolean {
    return true;
  }

  public override get isEnabled(): boolean {
    if (this.tool === undefined) {
      return false;
    }
    if (this.primitiveType === PrimitiveType.Box || this.primitiveType === PrimitiveType.PlaneXY) {
      return true;
    }
    // Allow maximum 2 slices of each type
    let count = 0;
    for (const domainObject of this.rootDomainObject.getDescendantsByType(SliceDomainObject)) {
      if (domainObject.primitiveType !== this.primitiveType) {
        continue;
      }
      count++;
      if (count >= 2) {
        return false;
      }
    }
    return true;
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
    tool.escape();
    tool.clearDragging();
    if (tool.primitiveType === this.primitiveType) {
      tool.primitiveType = PrimitiveType.None;
    } else {
      tool.primitiveType = this.primitiveType;
    }
    return true;
  }

  public override equals(other: BaseCommand): boolean {
    if (!(other instanceof SetClipTypeCommand)) {
      return false;
    }
    return this.primitiveType === other.primitiveType;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private get tool(): ClipTool | undefined {
    return this.getActiveTool(ClipTool);
  }
}

// ==================================================
// PRIMATE FUNCTIONS
// ==================================================

function getTooltipByPrimitiveType(primitiveType: PrimitiveType): TranslationInput {
  switch (primitiveType) {
    case PrimitiveType.PlaneX:
      return {
        key: 'ADD_SLICE_X'
      };
    case PrimitiveType.PlaneY:
      return {
        key: 'ADD_SLICE_Y'
      };
    case PrimitiveType.PlaneZ:
      return {
        key: 'ADD_SLICE_Z'
      };
    case PrimitiveType.PlaneXY:
      return {
        key: 'ADD_SLICE_XY'
      };
    case PrimitiveType.Box:
      return {
        key: 'ADD_CROP_BOX'
      };
    default:
      throw new Error('Unknown PrimitiveType');
  }
}
