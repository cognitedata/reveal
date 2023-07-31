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

import { ColorType } from '../../../Core/Enums/ColorType';
import { TargetId } from '../../../Core/Primitives/TargetId';
import { BaseRenderStyle } from '../../../Core/Styles/BaseRenderStyle';
import PointLogNodeIcon from '../../../images/Nodes/PointLogNode.png';
import { BaseFilterLogNode } from '../../Wells/Filters/BaseFilterLogNode';
import { WellLogType } from '../../Wells/Logs/WellLogType';
import { PointLogStyle } from '../../Wells/Styles/PointLogStyle';

export class PointFilterLogNode extends BaseFilterLogNode {
  //= =================================================
  // STATIC FIELDS
  //= =================================================

  static className = 'PointFilterLogNode';

  //= =================================================
  // INSTANCE PROPERTIES
  //= =================================================

  public get renderStyle(): PointLogStyle | null {
    return this.getRenderStyle() as PointLogStyle;
  }

  //= =================================================
  // CONSTRUCTOR
  //= =================================================

  public constructor() {
    super();
  }

  //= =================================================
  // OVERRIDES of Identifiable
  //= =================================================

  public get /* override */ className(): string {
    return PointFilterLogNode.className;
  }

  public /* override */ isA(className: string): boolean {
    return className === PointFilterLogNode.className || super.isA(className);
  }

  //= =================================================
  // OVERRIDES of BaseNode
  //= =================================================

  public get /* override */ typeName(): string {
    return 'PointLog';
  }

  public /* override */ getIcon(): string {
    return PointLogNodeIcon;
  }

  public /* override */ createRenderStyle(
    targetId: TargetId
  ): BaseRenderStyle | null {
    return new PointLogStyle(targetId);
  }

  public /* override */ supportsColorType(
    colorType: ColorType,
    _solid: boolean
  ): boolean {
    switch (colorType) {
      case ColorType.Specified:
      case ColorType.Parent:
      case ColorType.Black:
      case ColorType.White:
        return true;

      default:
        return false;
    }
  }

  //= =================================================
  // OVERRIDES of BaseLogNode
  //= =================================================

  public get /* override */ wellLogType(): WellLogType {
    return WellLogType.Point;
  }
}
