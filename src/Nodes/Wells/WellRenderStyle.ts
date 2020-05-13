//=====================================================================================
// This code is part of the Reveal Viewer architecture, made by Nils Petter Fremming
// in October 2019. It is suited for flexible and customizable visualization of
// multiple dataset in multiple viewers.
//
// It is a C# to typescript port from the Modern Model architecture,
// based on the experience when building Petrel.
//
// NOTE: Always keep the code according to the code style already applied in the file.
// Put new code under the correct section, and make more sections if needed.
// Copyright (c) Cognite AS. All rights reserved.
//=====================================================================================

import { TargetId } from "../../Core/PrimitiveClasses/TargetId";
import { BaseRenderStyle } from "../../Core/Styles/BaseRenderStyle";
import { ColorType } from "../../Core/Enums/ColorType";

export class WellRenderStyle extends BaseRenderStyle
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public radius: number = 10;
  public colorType: ColorType = ColorType.DifferentColor;

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(targetId: TargetId) { super(targetId); }

  public /*copy constructor*/ copy(): BaseRenderStyle
  {
    const style = new WellRenderStyle(this.targetId);
    style.radius = this.radius;
    style.colorType = this.colorType;
    return style;
  }

}



