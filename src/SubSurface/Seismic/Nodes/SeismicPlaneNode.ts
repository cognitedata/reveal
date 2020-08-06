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

import IconI from "@images/Nodes/SeismicPlaneNodeI.png";
import IconJ from "@images/Nodes/SeismicPlaneNodeJ.png";
import { BaseVisualNode } from "@/Core/Nodes/BaseVisualNode";
import { SurveyNode } from "@/SubSurface/Seismic/Nodes/SurveyNode";
import { RegularGrid3 } from "@/Core/Geometry/RegularGrid3";
import { Vector3 } from '@/Core/Geometry/Vector3';
import { Index2 } from "@/Core/Geometry/Index2";
import { Index3 } from "@/Core/Geometry/Index3";
import { PropertyFolder } from "@/Core/Property/Concrete/Folder/PropertyFolder";

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
    const { surveyNode } = this;
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

  public set perpendicularIndex(value: number)
  {
    if (this.isArbitrary)
      throw Error(this.generalName);

    this._perpendicularIndex = value;
  }

  private get maxPerpendicularIndex(): number
  {
    const { surveyCube } = this;
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
      case 1: return "Crossline";
      case 2: return "Time Slice";
      default: return "Arbitrary";
    }
  }

  public get unrotatedNormal(): Vector3
  {
    switch (this.perpendicularAxis)
    {
      case 0:
      case 1:
      case 2: return Vector3.getAxis(this.perpendicularAxis);
      default: return Vector3.newEmpty;
    }
  }

  public get normal(): Vector3
  {
    if (this.perpendicularAxis == 2)
      return Vector3.newUp;

    const cube = this.surveyCube;
    if (!cube)
      throw Error("surveyCube not found");

    return cube.getAxis(this.perpendicularAxis);
  }

  public get vectorInPlane(): Vector3
  {
    if (this.perpendicularAxis == 2)
      return new Vector3(1, 0, 0);

    const normal = this.normal;
    normal.rotatePiHalf();
    return normal;
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
  public /*override*/ canChangeColor(): boolean { return false; }
  public /*override*/ canChangeName(): boolean { return false; }

  public /*override*/ getName(): string
  {
    return this.generalName;
  }

  public /*override*/ getNameExtension(): string | null
  {
    if (this.perpendicularAxis < 0 || this.perpendicularAxis >= 3)
      return this.getNameExtension();
    return `${this.perpendicularIndex}`;
  }

  public /*override*/ getIcon(): string 
  {
    switch (this.perpendicularAxis)
    {
      case 0: return IconI;
      case 1: return IconJ;
      case 2: return IconJ;
      default: return IconJ;
    }
  }

  public /*override*/ createRenderStyle(targetId: TargetId): BaseRenderStyle | null
  {
    return new SurfaceRenderStyle(targetId);
  }

  protected /*override*/ populateStatisticsCore(folder: PropertyFolder): void
  {
    super.populateStatisticsCore(folder);

    if (this.isArbitrary)
      folder.addReadOnlyStrings("Along", this.generalName);
    else
      folder.addReadOnlyStrings("Along/Index", this.generalName, this.perpendicularIndex.toString());
  }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  public moveTo(perpendicularIndex: number): boolean
  {
    if (this.isArbitrary)
      throw Error(this.generalName);

    if (perpendicularIndex < 0)
      perpendicularIndex = 0;
    else if (perpendicularIndex > this.maxPerpendicularIndex)
      perpendicularIndex = this.maxPerpendicularIndex;

    if (this._perpendicularIndex === perpendicularIndex)
      return false;

    this._perpendicularIndex = perpendicularIndex;
    return true;
  }

  public createCells(useIndex: boolean = true): Index2[]
  {
    const { surveyCube } = this;
    if (!surveyCube)
      throw Error("surveyCube is not set");

    const cells: Index2[] = [];
    const index = useIndex ? this.perpendicularIndex : 0;
    if (this.perpendicularAxis === 0)
    {
      for (let j = 0; j < surveyCube.cellSize.j; j++)
        cells.push(new Index2(index, j));
    }
    else if (this.perpendicularAxis === 1)
    {
      for (let i = 0; i < surveyCube.cellSize.i; i++)
        cells.push(new Index2(i, index));
    }
    return cells;
  }

  public getMinCell(): Index3
  {
    if (this.perpendicularAxis === 0)
      return new Index3(this.perpendicularIndex, 0, 0);
    if (this.perpendicularAxis === 1)
      return new Index3(0, this.perpendicularIndex, 0);
    throw new Error("getMinCell is not implemented for this case");
  }

  public getMaxCell(): Index3
  {
    const { surveyCube } = this;
    if (!surveyCube)
      throw Error("surveyCube is not set");

    if (this.perpendicularAxis === 0)
      return new Index3(this.perpendicularIndex, surveyCube.cellSize.j - 1, surveyCube.cellSize.k - 1);
    if (this.perpendicularAxis === 1)
      return new Index3(surveyCube.cellSize.i - 1, this.perpendicularIndex, surveyCube.cellSize.k - 1);
    throw new Error("getMinCell is not implemented for this case");
  }
}