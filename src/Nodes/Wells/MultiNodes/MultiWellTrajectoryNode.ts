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

import { ColorType } from "@/Core/Enums/ColorType";

import { BaseRenderStyle } from "@/Core/Styles/BaseRenderStyle";
import { TargetId } from "@/Core/Primitives/TargetId";
import { WellRenderStyle } from "@/Nodes/Wells/Wells/WellRenderStyle";
import { MultiBaseLogNode } from "@/Nodes/Wells/MultiNodes/MultiBaseLogNode";

export class MultiWellTrajectoryNode extends MultiBaseLogNode
{
  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get renderStyle(): WellRenderStyle | null { return this.getRenderStyle() as WellRenderStyle; }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return MultiWellTrajectoryNode.name; }
  public /*override*/ isA(className: string): boolean { return className === MultiWellTrajectoryNode.name || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ get typeName(): string { return "WellTrajectory" }

  public /*override*/ createRenderStyle(targetId: TargetId): BaseRenderStyle | null
  {
    return new WellRenderStyle(targetId);
  }

  public /*override*/ verifyRenderStyle(style: BaseRenderStyle)
  {
    if (!(style instanceof WellRenderStyle))
      return;

    if (!this.supportsColorType(style.colorType))
      style.colorType = ColorType.NodeColor;
  }

  public /*override*/ supportsColorType(colorType: ColorType): boolean
  {
    switch (colorType)
    {
      case ColorType.NodeColor:
        return true;

      default:
        return false;
    }
  }
}