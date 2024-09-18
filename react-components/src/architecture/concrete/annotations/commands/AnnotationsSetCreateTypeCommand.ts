/*!
 * Copyright 2024 Cognite AS
 */

import { type TranslateKey } from '../../../base/utilities/TranslateKey';
import { type BaseCommand } from '../../../base/commands/BaseCommand';
import { PrimitiveType } from '../../primitives/common/PrimitiveType';
import { RenderTargetCommand } from '../../../base/commands/RenderTargetCommand';
import { AnnotationsDomainObject } from '../AnnotationsDomainObject';
import { AnnotationsCreateTool } from './AnnotationsCreateTool';

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

  public override get icon(): string {
    return getIconByPrimitiveType(this._primitiveType);
  }

  public override get tooltip(): TranslateKey {
    return getTooltipByPrimitiveType(this._primitiveType);
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
    return tool.primitiveType === this._primitiveType;
  }

  protected override invokeCore(): boolean {
    const { tool } = this;
    if (tool === undefined) {
      return false;
    }
    tool.handleEscape();
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
    const { activeTool } = this;
    if (!(activeTool instanceof AnnotationsCreateTool)) {
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
        key: 'ANNOTATIONS_CREATE_BOX',
        fallback: 'Create a new box annotation'
      };
    case PrimitiveType.HorizontalCylinder:
      return {
        key: 'ANNOTATIONS_CREATE_HORIZONTAL_CYLINDER',
        fallback:
          'Create a new horizontal cylinder annotation. Click two times to get the center endpoints, the third defines the radius.'
      };
    case PrimitiveType.VerticalCylinder:
      return {
        key: 'ANNOTATIONS_CREATE_VERTICAL_CYLINDER',
        fallback:
          'Create a new vertical cylinder annotation. Click two times to get the center endpoints, the third defines the radius.'
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

function getIconByPrimitiveType(primitiveType: PrimitiveType): string {
  switch (primitiveType) {
    case PrimitiveType.Box:
      return 'Cube';
    case PrimitiveType.Cylinder:
      return 'DataSource';
    case PrimitiveType.HorizontalCylinder:
      return 'SplitViewHorizontal';
    case PrimitiveType.VerticalCylinder:
      return 'SplitView';
    case PrimitiveType.None:
      return 'Cursor';
    default:
      throw new Error('Unknown PrimitiveType');
  }
}
