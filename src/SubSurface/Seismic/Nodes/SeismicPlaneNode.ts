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

import SurfaceNodeIcon from "@images/Nodes/SurfaceNode.png";
import { BaseVisualNode } from "@/Core/Nodes/BaseVisualNode";
import { SurveyNode } from "@/SubSurface/Seismic/Nodes/SurveyNode";
import { RegularGrid3 } from "@/Core/Geometry/RegularGrid3";
import { Vector3 } from '@/Core/Geometry/Vector3';

export class SeismicPlaneNode extends BaseVisualNode
{
  //==================================================
  // STATIC FIELDS
  //==================================================

  static className = "SeismicPlaneNode";

  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private _perpendicularAxis = 0;

  private _perpendicularIndex = -1; // Not used if arbitrary plane

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get surveyNode(): SurveyNode | null { return this.getAncestorByType(SurveyNode); }

  public get surveyCube(): RegularGrid3 | null
  {
    const {surveyNode} = this;
    return surveyNode ? surveyNode.surveyCube : null;
  }

  public get isArbitrary(): boolean { return this.perpendicularAxis < 0; }

  public get isHorizontal(): boolean { return this.perpendicularAxis === 2; }

  public get perpendicularAxis(): number { return this._perpendicularAxis; }

  public get perpendicularIndex(): number
  {
    if (this.isArbitrary)
      throw Error(this.generalName);

    if (this._perpendicularIndex < 0)
      this._perpendicularIndex = this.maxPerpendicularIndex / 2;
    return this._perpendicularIndex;
  }

  public set perpendicularIndex(value: number) { this._perpendicularIndex = value; }

  private get maxPerpendicularIndex(): number
  {
    const {surveyCube} = this;
    if (!surveyCube)
      return -1;

    if (this.isArbitrary)
      throw Error(this.generalName);

    return surveyCube.cellSize.getAt(this.perpendicularAxis) - 1;
  }

  public get shortName(): string
  {
    switch (this.perpendicularAxis)
    {
      case 0: return "I"; // Inline
      case 1: return "X"; // X-line
      case 2: return "T"; // Time slice
      default: return "A";
    }
  }

  public get generalName(): string
  {
    switch (this.perpendicularAxis)
    {
      case 0: return "Inline";
      case 1: return "X-line";
      case 2: return "Time Slice";
      default: return "Arbitrary";
    }
  }

  public get normal(): Vector3
  {
    switch (this.perpendicularAxis)
    {
      case 0:
      case 1:
      case 2: return Vector3.getAxis(this.perpendicularAxis);
      default: return Vector3.newEmpty;
    }
  }
  
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(perpendicularAxis = 0)
  {
    super();
    this._perpendicularAxis = perpendicularAxis;
  }

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get renderStyle(): SurfaceRenderStyle | null { return this.getRenderStyle() as SurfaceRenderStyle; }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return SeismicPlaneNode.className; }

  public /*override*/ isA(className: string): boolean { return className === SeismicPlaneNode.className || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ get typeName(): string { return "Plane"; }

  public /*override*/ getName(): string
  {
    if (this.perpendicularAxis < 0 || this.perpendicularAxis >= 3)
      return this.generalName;
    return `${this.generalName} ${this.perpendicularIndex}`;
  }

  public /*override*/ getIcon(): string { return SurfaceNodeIcon; }

  public /*override*/ createRenderStyle(targetId: TargetId): BaseRenderStyle | null
  {
    return new SurfaceRenderStyle(targetId);
  }
}