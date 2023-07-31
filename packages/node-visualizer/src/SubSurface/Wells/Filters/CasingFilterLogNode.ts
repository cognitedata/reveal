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
import CasingLogNodeIcon from '../../../images/Nodes/CasingLogNode.png';
import { BaseFilterLogNode } from '../../Wells/Filters/BaseFilterLogNode';
import { WellLogType } from '../../Wells/Logs/WellLogType';
import { CasingLogStyle } from '../../Wells/Styles/CasingLogStyle';

export class CasingFilterLogNode extends BaseFilterLogNode {
  //= =================================================
  // STATIC FIELDS
  //= =================================================

  static className = 'CasingFilterLogNode';

  //= =================================================
  // INSTANCE PROPERTIES
  //= =================================================

  public get renderStyle(): CasingLogStyle | null {
    return this.getRenderStyle() as CasingLogStyle;
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
    return CasingFilterLogNode.className;
  }

  public /* override */ isA(className: string): boolean {
    return className === CasingFilterLogNode.className || super.isA(className);
  }

  //= =================================================
  // OVERRIDES of BaseNode
  //= =================================================

  public get /* override */ typeName(): string {
    return 'Casing';
  }

  public /* override */ getIcon(): string {
    return CasingLogNodeIcon;
  }

  public /* override */ createRenderStyle(
    targetId: TargetId
  ): BaseRenderStyle | null {
    return new CasingLogStyle(targetId);
  }

  public /* override */ supportsColorType(
    colorType: ColorType,
    _: boolean
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
    return WellLogType.Casing;
  }
}
