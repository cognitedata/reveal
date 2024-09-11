/*!
 * Copyright 2024 Cognite AS
 */

import { type TranslateKey } from '../../../base/utilities/TranslateKey';
import { type BaseCommand } from '../../../base/commands/BaseCommand';
import { AnnotationEditTool } from './AnnotationEditTool';
import { PrimitiveType } from '../../primitives/PrimitiveType';
import { RenderTargetCommand } from '../../../base/commands/RenderTargetCommand';
import { AnnotationsDomainObject } from '../AnnotationsDomainObject';

export class SetAnnotationEditTypeCommand extends RenderTargetCommand {
  private readonly _primitiveType: PrimitiveType;
  private readonly _isHorizontal: boolean;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(primitiveType: PrimitiveType, isHorizontal = false) {
    super();
    this._primitiveType = primitiveType;
    this._isHorizontal = isHorizontal;
  }

  // ==================================================
  // OVERRIDES of BaseCommand
  // ==================================================

  public override get icon(): string {
    if (this._primitiveType === PrimitiveType.Cylinder) {
      return this._isHorizontal ? 'SplitViewHorizontal' : 'SplitView';
    }
    return getIconByPrimitiveType(this._primitiveType);
  }

  public override get tooltip(): TranslateKey {
    return getTooltipByPrimitiveType(this._primitiveType, this._isHorizontal);
  }

  public override get buttonType(): string {
    if (this._primitiveType === PrimitiveType.Box) {
      return 'primary';
    }
    return super.buttonType;
  }

  public override get isEnabled(): boolean {
    if (this.rootDomainObject.getDescendantByType(AnnotationsDomainObject) === undefined) {
      return false;
    }
    return this.tool !== undefined;
  }

  public override get isChecked(): boolean {
    const { tool } = this;
    if (tool === undefined) {
      return false;
    }
    return tool.primitiveType === this._primitiveType && tool.isHorizontal === this._isHorizontal;
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
      tool.isHorizontal = this._isHorizontal;
    }
    return true;
  }

  public override equals(other: BaseCommand): boolean {
    if (!(other instanceof AnnotationEditTool)) {
      return false;
    }
    return this._primitiveType === other.primitiveType && this._isHorizontal === other.isHorizontal;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private get tool(): AnnotationEditTool | undefined {
    const { activeTool } = this;
    if (!(activeTool instanceof AnnotationEditTool)) {
      return undefined;
    }
    return activeTool;
  }
}

// ==================================================
// PRIMATE FUNCTIONS
// ==================================================

function getTooltipByPrimitiveType(
  primitiveType: PrimitiveType,
  isHorizontal: boolean
): TranslateKey {
  switch (primitiveType) {
    case PrimitiveType.Box:
      return {
        key: 'ANNOTATIONS_CREATE_BOX',
        fallback: 'Create a new box annotation'
      };
    case PrimitiveType.Cylinder:
      if (isHorizontal) {
        return {
          key: 'ANNOTATIONS_CREATE_HORIZONTAL_CYLINDER',
          fallback:
            'Create a new horizontal cylinder annotation. Click two times to get the center endpoints, the third defines the radius.'
        };
      } else {
        return {
          key: 'ANNOTATIONS_CREATE_VERTICAL_CYLINDER',
          fallback:
            'Create a new vertical cylinder annotation. Click two times to get the center endpoints, the third defines the radius.'
        };
      }
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

function getIconByPrimitiveType(primitiveType: PrimitiveType): string {
  switch (primitiveType) {
    case PrimitiveType.Box:
      return 'Cube';
    case PrimitiveType.Cylinder:
      return 'DataSource';
    case PrimitiveType.None:
      return 'Cursor';
    default:
      throw new Error('Unknown PrimitiveType');
  }
}
