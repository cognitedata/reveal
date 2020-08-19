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
import { TargetId } from "@/Core/Primitives/TargetId";
import { SurfaceRenderStyle } from "@/SubSurface/Basics/SurfaceRenderStyle";

import Icon from "@images/Nodes/SurveyNode.png";
import { BaseVisualNode } from "@/Core/Nodes/BaseVisualNode";
import { RegularGrid3 } from "@/Core/Geometry/RegularGrid3";
import { SeismicPlaneFolder } from "@/SubSurface/Seismic/Nodes/SeismicPlaneFolder";
import { SeismicOutlineNode } from "@/SubSurface/Seismic/Nodes/SeismicOutlineNode";
import { ExpanderProperty } from "@/Core/Property/Concrete/Folder/ExpanderProperty";
import { Ma } from "@/Core/Primitives/Ma";
import { Range3 } from '@/Core/Geometry/Range3';

export class SurveyNode extends BaseVisualNode
{
  //==================================================
  // STATIC FIELDS
  //==================================================

  static className = "SurveyNode";

  public surveyCube: RegularGrid3 | null = null;

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get renderStyle(): SurfaceRenderStyle | null { return this.getRenderStyle() as SurfaceRenderStyle; }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return SurveyNode.className; }

  public /*override*/ isA(className: string): boolean { return className === SurveyNode.className || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ get typeName(): string { return "Survey"; }

  public /*override*/ getIcon(): string { return Icon; }

  public /*override*/ canChangeColor(): boolean { return false; }

  public /*override*/ createRenderStyle(targetId: TargetId): BaseRenderStyle | null
  {
    return new SurfaceRenderStyle(targetId);
  }

  public /*override*/ get boundingBox(): Range3 { return this.surveyCube ? this.surveyCube.boundingBox : new Range3(); }

  protected /*override*/ initializeCore()
  {
    super.initializeCore();

    if (!this.hasChildByType(SeismicOutlineNode))
      this.addChild(new SeismicOutlineNode());

    if (!this.hasChildByType(SeismicPlaneFolder))
      this.addChild(new SeismicPlaneFolder());
  }

  protected /*override*/ populateStatisticsCore(folder: ExpanderProperty): void
  {
    super.populateStatisticsCore(folder);

    const { surveyCube } = this;
    if (!surveyCube)
      return;

    folder.addReadOnlyIndex3("# Nodes", surveyCube.nodeSize);
    folder.addReadOnlyVector3("Spacing", surveyCube.inc);
    folder.addReadOnlyVector3("Origin", surveyCube.origin);
    folder.addReadOnlyAngle("Rotation", surveyCube.rotationAngle);
    folder.addReadOnlyRange3(surveyCube.boundingBox);
  }
}