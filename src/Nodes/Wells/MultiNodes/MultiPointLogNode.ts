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
import { WellRenderStyle } from "@/Nodes/Wells/Wells/WellRenderStyle";
import { TargetId } from "@/Core/Primitives/TargetId";
import { MultiBaseLogNode } from "@/Nodes/Wells/MultiNodes/MultiBaseLogNode";

export class MultiPointLogNode extends MultiBaseLogNode
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

  public /*override*/ get className(): string { return MultiPointLogNode.name; }
  public /*override*/ isA(className: string): boolean { return className === MultiPointLogNode.name || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ get typeName(): string { return "PointLog" }

  public /*override*/ createRenderStyle(targetId: TargetId): BaseRenderStyle | null
  {
    return new WellRenderStyle(targetId);
  }
}