//= ====================================================================================
// This code is part of the Reveal Viewer architecture, made by Nils Petter Fremming
// in October 2019. It is suited for flexible and customizable visualization of
// multiple dataset in multiple viewers.
//
// It is a C# to typescript port from the Modern Model architecture,
// based on the experience when building Petrel.
//
// NOTE: Always keep the code according to the code style already applied in the file.
// Put new code under the correct section, and make more sections if needed.
// Copyright (c) Cognite AS. All rights reserved.
//= ====================================================================================

import AxisNodeIcon from '../../../images/Nodes/AxisNode.png';
import { BaseVisualNode } from '../../Nodes/BaseVisualNode';
import { AxisRenderStyle } from '../../Nodes/Decorations/AxisRenderStyle';
import { TargetId } from '../../Primitives/TargetId';
import { BaseRenderStyle } from '../../Styles/BaseRenderStyle';

export class AxisNode extends BaseVisualNode {
  //= =================================================
  // STATIC FIELDS
  //= =================================================

  static className = 'AxisNode';

  //= =================================================
  // CONSTRUCTOR
  //= =================================================

  public constructor() {
    super();
  }

  //= =================================================
  // INSTANCE PROPERTIES
  //= =================================================

  public get renderStyle(): AxisRenderStyle | null {
    return this.getRenderStyle() as AxisRenderStyle;
  }

  //= =================================================
  // OVERRIDES of Identifiable
  //= =================================================

  public get /* override */ className(): string {
    return AxisNode.className;
  }

  public /* override */ isA(className: string): boolean {
    return className === AxisNode.className || super.isA(className);
  }

  //= =================================================
  // OVERRIDES of BaseNode
  //= =================================================

  public get /* override */ typeName(): string {
    return 'Axis';
  }

  public /* override */ getIcon(): string {
    return AxisNodeIcon;
  }

  public /* override */ createRenderStyle(
    targetId: TargetId
  ): BaseRenderStyle | null {
    return new AxisRenderStyle(targetId);
  }
}
