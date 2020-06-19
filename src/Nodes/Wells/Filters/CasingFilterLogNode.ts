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
import { CasingLogStyle } from "@/Nodes/Wells/Styles/CasingLogStyle";
import { TargetId } from "@/Core/Primitives/TargetId";
import { BaseFilterLogNode } from "@/Nodes/Wells/Filters/BaseFilterLogNode";
import { WellLogType } from "@/Nodes/Wells/Logs/WellLogType";
import CasingLogNodeIcon from "@images/Nodes/CasingLogNode.png";
import { ColorType } from "@/Core/Enums/ColorType";

export class CasingFilterLogNode extends BaseFilterLogNode
{
  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get renderStyle(): CasingLogStyle | null { return this.getRenderStyle() as CasingLogStyle; }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return CasingFilterLogNode.name; }
  public /*override*/ isA(className: string): boolean { return className === CasingFilterLogNode.name || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ get typeName(): string { return "Casing" }

  public /*override*/ getIcon(): string { return CasingLogNodeIcon }

  public /*override*/ createRenderStyle(targetId: TargetId): BaseRenderStyle | null
  {
    return new CasingLogStyle(targetId);
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

  public /*override*/  get wellLogType(): WellLogType { return WellLogType.Casing; }
}