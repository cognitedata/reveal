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

import { Range3 } from "@/Core/Geometry/Range3";
import { BaseRenderStyle } from "@/Core/Styles/BaseRenderStyle";
import { TargetId } from "@/Core/Primitives/TargetId";
import { SurfaceRenderStyle } from "@/SubSurface/Basics/SurfaceRenderStyle";

import Icon from "@images/Nodes/SeismicCubeNode.png";
import { DataNode } from "@/Core/Nodes/DataNode";
import { SeismicCube } from '@/SubSurface/Seismic/Data/SeismicCube';
import { ITarget } from "@/Core/Interfaces/ITarget";
import { SurveyNode } from '@/SubSurface/Seismic/Nodes/SurveyNode';
import { Ma } from "@/Core/Primitives/Ma";
import { PropertyFolder } from "@/Core/Property/Concrete/Folder/PropertyFolder";

export class SeismicCubeNode extends DataNode
{
  //==================================================
  // STATIC FIELDS
  //==================================================

  static className = "SeismicCubeNode";

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get seismicCube(): SeismicCube | null { return this.anyData; }
  public set seismicCube(value: SeismicCube | null) { this.anyData = value; }
  public get renderStyle(): SurfaceRenderStyle | null { return this.getRenderStyle() as SurfaceRenderStyle; }
  public get surveyNode(): SurveyNode | null { return this.getAncestorByType(SurveyNode); }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return SeismicCubeNode.className; }
  public /*override*/ isA(className: string): boolean { return className === SeismicCubeNode.className || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ get typeName(): string { return "Seismic Cube"; }
  public /*override*/ getIcon(): string { return Icon; }
  public /*override*/ isRadio(target: ITarget | null): boolean { return true; }
  public /*override*/ canChangeColor(): boolean { return false; }

  public /*override*/ get boundingBox(): Range3 { return this.seismicCube ? this.seismicCube.boundingBox : new Range3(); }
  public /*override*/ createRenderStyle(targetId: TargetId): BaseRenderStyle | null
  {
    return new SurfaceRenderStyle(targetId);
  }

  protected /*override*/ populateStatisticsCore(folder: PropertyFolder): void
  {
    super.populateStatisticsCore(folder);

    const { seismicCube } = this;
    if (!seismicCube)
      return;

    folder.addReadOnlyIndex3("# Cells", seismicCube.cellSize);
    folder.addReadOnlyVector3("Spacing", seismicCube.inc);
    folder.addReadOnlyVector3("Origin", seismicCube.origin);
    folder.addReadOnlyAngle("Rotation", seismicCube.rotationAngle);
    folder.addReadOnlyRange3(seismicCube.boundingBox);
  }
}