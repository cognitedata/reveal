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
import { DiscreteLogStyle } from "@/Nodes/Wells/Styles/DiscreteLogStyle";
import { TargetId } from "@/Core/Primitives/TargetId";
import { BaseFilterLogNode } from "@/Nodes/Wells/Filters/BaseFilterLogNode";
import { WellLogType } from "@/Nodes/Wells/Logs/WellLogType";
import DiscreteLogNodeIcon from "@images/Nodes/DiscreteLogNode.png";
import { ColorType } from "@/Core/Enums/ColorType";

export class DiscreteFilterLogNode extends BaseFilterLogNode
{
  //==================================================
  // STATIC FIELDS
  //==================================================

  static className = "DiscreteFilterLogNode";

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get renderStyle(): DiscreteLogStyle | null { return this.getRenderStyle() as DiscreteLogStyle; }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return DiscreteFilterLogNode.className; }
  public /*override*/ isA(className: string): boolean { return className === DiscreteFilterLogNode.className || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ get typeName(): string { return "DiscreteLog" }
  public /*override*/ getIcon(): string { return DiscreteLogNodeIcon }
  public /*override*/ canChangeColor(): boolean { return false; }

  public /*override*/ createRenderStyle(targetId: TargetId): BaseRenderStyle | null
  {
    return new DiscreteLogStyle(targetId);
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

  public /*override*/  get wellLogType(): WellLogType { return WellLogType.Discrete; }

}