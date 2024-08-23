/*!
 * Copyright 2024 Cognite AS
 */

import { type TranslateKey } from '../../../base/utilities/TranslateKey';
import { BaseEditTool } from '../../../base/commands/BaseEditTool';
import { type BaseCommand } from '../../../base/commands/BaseCommand';
import { AnnotationTool } from './AnnotationTool';
import { PrimitiveType } from '../../primitives/PrimitiveType';
import { getIconByPrimitiveType } from '../../measurements/getIconByPrimitiveType';

export class SetAnnotationEditTypeCommand extends BaseEditTool {
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
    if (!(other instanceof AnnotationTool)) {
      return false;
    }
    return this._primitiveType === other.primitiveType;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private get tool(): AnnotationTool | undefined {
    const { activeTool } = this;
    if (!(activeTool instanceof AnnotationTool)) {
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
    case PrimitiveType.Box:
      return {
        key: 'ANNOTATIONS_CREATE',
        fallback: 'Create a new annotation'
      };
    case PrimitiveType.None:
      return {
        key: 'ANNOTATIONS_EDIT',
        fallback:
          'Edit annotation. Click on an annotation to edit it. Click on the background to deselect the annotation.'
      };
    default:
      throw new Error('Unknown PrimitiveType');
  }
}
