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

import Icon from "@images/Nodes/SeismicOutlineNode.png";
import { BaseVisualNode } from "@/Core/Nodes/BaseVisualNode";
import { RegularGrid3 } from "@/Core/Geometry/RegularGrid3";
import { SurveyNode } from "@/SubSurface/Seismic/Nodes/SurveyNode";

export class SeismicOutlineNode extends BaseVisualNode
{
  //==================================================
  // STATIC FIELDS
  //==================================================

  static className = "SeismicOutlineNode";

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get surveyNode(): SurveyNode | null { return this.getAncestorByType(SurveyNode); }

  public get surveyCube(): RegularGrid3 | null
  {
    const { surveyNode } = this;
    return surveyNode ? surveyNode.surveyCube : null;
  }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return SeismicOutlineNode.className; }
  public /*override*/ isA(className: string): boolean { return className === SeismicOutlineNode.className || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ get typeName(): string { return "Outline"; }
  public /*override*/ canChangeName(): boolean { return false; }
  public /*override*/ canChangeColor(): boolean { return false; }
  public /*override*/ getIcon(): string { return Icon; }
}