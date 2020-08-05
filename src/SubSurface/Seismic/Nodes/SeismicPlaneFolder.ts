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

import SurfaceNodeIcon from "@images/Nodes/SurfaceNode.png";
import { BaseNode } from "@/Core/Nodes/BaseNode";
import { SeismicPlaneNode } from "@/SubSurface/Seismic/Nodes/SeismicPlaneNode";

export class SeismicPlaneFolder extends BaseNode
{
  //==================================================
  // STATIC FIELDS
  //==================================================

  static className = "SeismicPlaneFolder";

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return SeismicPlaneFolder.className; }

  public /*override*/ isA(className: string): boolean { return className === SeismicPlaneFolder.className || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ get typeName(): string { return "Planes"; }

  public /*override*/ canChangeName(): boolean { return false; }

  public /*override*/ canChangeColor(): boolean { return false; }

  public /*override*/ getIcon(): string { return SurfaceNodeIcon; }

  public /*override*/ initializeCore()
  {
    super.initializeCore();
    if (!this.hasChildByType(SeismicPlaneNode))
    {
      this.addChild(new SeismicPlaneNode(0));
      this.addChild(new SeismicPlaneNode(1));
    }
  }
}