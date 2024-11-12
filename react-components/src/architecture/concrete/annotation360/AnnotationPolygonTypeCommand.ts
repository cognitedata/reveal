/*!
 * Copyright 2024 Cognite AS
 */

import { type BaseCommand } from '../../base/commands/BaseCommand';
import { RenderTargetCommand } from '../../base/commands/RenderTargetCommand';
import { type IconName } from '../../base/utilities/IconName';
import { PrimitiveType } from '../../base/utilities/primitives/PrimitiveType';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { getIconByPrimitiveType } from '../../base/utilities/primitives/getIconByPrimitiveType';
import { AnnotationPolygonTool } from './AnnotationPolygonTool';

export class AnnotationPolygonTypeCommand extends RenderTargetCommand {
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
    if (!(other instanceof AnnotationPolygonTypeCommand)) {
      return false;
    }
    return this._primitiveType === other._primitiveType;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private get tool(): AnnotationPolygonTool | undefined {
    return this.getActiveTool(AnnotationPolygonTool);
  }
}

// ==================================================
// PRIMATE FUNCTIONS
// ==================================================

function getTooltipByPrimitiveType(primitiveType: PrimitiveType): TranslateKey {
  switch (primitiveType) {
    case PrimitiveType.Polygon:
      return {
        fallback: 'Create polygon. Click at least 3 points and end with Esc.'
      };
    default:
      return {
        fallback: 'Select polygon.'
      };
  }
}
