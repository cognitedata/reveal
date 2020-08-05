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

import { BaseRenderStyle } from "@/Core/Styles/BaseRenderStyle";
import { FloatLogStyle } from "@/SubSurface/Wells/Styles/FloatLogStyle";
import { TargetId } from "@/Core/Primitives/TargetId";
import { BaseFilterLogNode } from "@/SubSurface/Wells/Filters/BaseFilterLogNode";
import { WellLogType } from "@/SubSurface/Wells/Logs/WellLogType";
import FloatLogNodeIcon from "@images/Nodes/FloatLogNode.png";
import { ColorType } from "@/Core/Enums/ColorType";

export class FloatFilterLogNode extends BaseFilterLogNode
{
  //==================================================
  // STATIC FIELDS
  //==================================================

  static className = "FloatFilterLogNode";

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get renderStyle(): FloatLogStyle | null { return this.getRenderStyle() as FloatLogStyle; }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return FloatFilterLogNode.className; }

  public /*override*/ isA(className: string): boolean { return className === FloatFilterLogNode.className || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ get typeName(): string { return "FloatLog"; }

  public /*override*/ getIcon(): string { return FloatLogNodeIcon; }

  public /*override*/ createRenderStyle(targetId: TargetId): BaseRenderStyle | null
  {
    return new FloatLogStyle(targetId);
  }

  public /*override*/ supportsColorType(colorType: ColorType): boolean
  {
    switch (colorType)
    {
      case ColorType.Specified:
      case ColorType.Parent:
      case ColorType.Black:
      case ColorType.White:
        return true;

      default:
        return false;
    }
  }

  //==================================================
  // OVERRIDES of BaseLogNode
  //==================================================

  public /*override*/ get wellLogType(): WellLogType { return WellLogType.Float; }
}