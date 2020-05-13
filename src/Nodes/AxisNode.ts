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

import { BaseVisualNode } from "../Core/Nodes/BaseVisualNode";
import { BaseRenderStyle } from "../Core/Styles/BaseRenderStyle";
import { TargetId } from "../Core/PrimitiveClasses/TargetId";
import { PointsRenderStyle } from "./PointsRenderStyle";

export class AxisNode extends BaseVisualNode
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // INSTANCE FIELDS
  //==================================================

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get renderStyle(): PointsRenderStyle | null { return this.getRenderStyle() as PointsRenderStyle; }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return AxisNode.name; }
  public /*override*/ isA(className: string): boolean { return className === AxisNode.name || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ get typeName(): string { return "Axis" }

  public /*override*/ createRenderStyle(targetId: TargetId): BaseRenderStyle | null
  {
    return new PointsRenderStyle(targetId);
  }
}