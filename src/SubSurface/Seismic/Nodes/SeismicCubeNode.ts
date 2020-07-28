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

import SurfaceNodeIcon from "@images/Nodes/SurfaceNode.png";
import { DataNode } from "@/Core/Nodes/DataNode";
import { SeismicCube } from '@/SubSurface/Seismic/Data/SeismicCube';
import { ITarget } from "@/Core/Interfaces/ITarget";

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

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return SeismicCubeNode.className; }
  public /*override*/ isA(className: string): boolean { return className === SeismicCubeNode.className || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ get typeName(): string { return "Seismic Cube" }

  public /*override*/ getIcon(): string { return SurfaceNodeIcon }

  public /*override*/ isRadio(target: ITarget | null): boolean { return true; }

  public /*override*/ get boundingBox(): Range3 { return this.seismicCube ? this.seismicCube.boundingBox : new Range3(); }

  public /*override*/ createRenderStyle(targetId: TargetId): BaseRenderStyle | null
  {
    return new SurfaceRenderStyle(targetId);
  }
}