/*!
 * Copyright 2024 Cognite AS
 */

import { RenderTargetCommand } from '../../../base/commands/RenderTargetCommand';
import { type BaseCommand } from '../../../base/commands/BaseCommand';
import { PrimitiveType } from '../../primitives/PrimitiveType';
import { type TranslateKey } from '../../../base/utilities/TranslateKey';
import { ClipTool } from '../ClipTool';
import { getIconByPrimitiveType } from '../../measurements/getIconByPrimitiveType';

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
    if (!(other instanceof SetClipTypeCommand)) {
      return false;
    }
    return this._primitiveType === other._primitiveType;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private get tool(): ClipTool | undefined {
    const activeTool = this.renderTarget.commandsController.activeTool;
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
        key: 'PLANE_X_ADD',
        fallback: 'Add X plane. Click at one point.'
      };
    case PrimitiveType.PlaneY:
      return {
        key: 'PLANE_Y_ADD',
        fallback: 'Add Y plane. Click at one point.'
      };
    case PrimitiveType.PlaneZ:
      return {
        key: 'PLANE_Z_ADD',
        fallback: 'Add Z plane. Click at one point.'
      };
    case PrimitiveType.PlaneXY:
      return {
        key: 'PLANE_XY_ADD',
        fallback: 'Add XY plane. Click at two points.'
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
