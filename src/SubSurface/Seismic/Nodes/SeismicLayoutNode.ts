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

import Icon from "@images/Nodes/SeismicLayoutNode.png";
import { BaseVisualNode } from "@/Core/Nodes/BaseVisualNode";

export class SeismicLayoutNode extends BaseVisualNode
{
  //==================================================
  // STATIC FIELDS
  //==================================================

  static className = "SeismicLayoutNode";

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return SeismicLayoutNode.className; }

  public /*override*/ isA(className: string): boolean { return className === SeismicLayoutNode.className || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ get typeName(): string { return "Layout"; }

  public /*override*/ canChangeName(): boolean { return false; }

  public /*override*/ canChangeColor(): boolean { return false; }

  public /*override*/ getIcon(): string { return Icon; }
}