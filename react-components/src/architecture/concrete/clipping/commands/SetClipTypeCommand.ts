/*!
 * Copyright 2024 Cognite AS
 */

import { RenderTargetCommand } from '../../../base/commands/RenderTargetCommand';
import { type BaseCommand } from '../../../base/commands/BaseCommand';
import { PrimitiveType } from '../../primitives/PrimitiveType';
import { type TranslateKey } from '../../../base/utilities/TranslateKey';
import { ClipTool } from '../ClipTool';
import { getIconByPrimitiveType } from '../../measurements/getIconByPrimitiveType';
import { SliceDomainObject } from '../SliceDomainObject';
import { IconName } from '../../../../components/Architecture/getIconComponent';

export class SetClipTypeCommand extends RenderTargetCommand {
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

  public override get tooltip(): TranslateKey {
    return getTooltipByPrimitiveType(this._primitiveType);
  }

  public override get isVisible(): boolean {
    return true;
  }

  public override get isEnabled(): boolean {
    if (this.tool === undefined) {
      return false;
    }
    if (
      this._primitiveType === PrimitiveType.Box ||
      this._primitiveType === PrimitiveType.PlaneXY
    ) {
      return true;
    }
    // Allow maximum 2 slices of each type
    let count = 0;
    for (const domainObject of this.rootDomainObject.getDescendantsByType(SliceDomainObject)) {
      if (domainObject.primitiveType !== this._primitiveType) {
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
    if (!(other instanceof SetClipTypeCommand)) {
      return false;
    }
    return this._primitiveType === other._primitiveType;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private get tool(): ClipTool | undefined {
    const { activeTool } = this;
    if (!(activeTool instanceof ClipTool)) {
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
    case PrimitiveType.PlaneX:
      return {
        key: 'SLICE_X_ADD',
        fallback: 'Add X slice. Click at one point.'
      };
    case PrimitiveType.PlaneY:
      return {
        key: 'SLICE_Y_ADD',
        fallback: 'Add Y slice. Click at one point.'
      };
    case PrimitiveType.PlaneZ:
      return {
        key: 'SLICE_Z_ADD',
        fallback: 'Add Z slice. Click at one point.'
      };
    case PrimitiveType.PlaneXY:
      return {
        key: 'SLICE_XY_ADD',
        fallback: 'Add XY slice. Click at two points.'
      };
    case PrimitiveType.Box:
      return {
        key: 'CROP_BOX_ADD',
        fallback:
          'Create crop box. Click at three points in a horizontal plan and the fourth to give it height.'
      };
    default:
      throw new Error('Unknown PrimitiveType');
  }
}
