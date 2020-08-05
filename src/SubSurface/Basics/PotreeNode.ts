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

import { BaseVisualNode } from "@/Core/Nodes/BaseVisualNode";
import { BaseRenderStyle } from "@/Core/Styles/BaseRenderStyle";
import { TargetId } from "@/Core/Primitives/TargetId";
import { PotreeRenderStyle } from "@/SubSurface/Basics/PotreeRenderStyle";

export class PotreeNode extends BaseVisualNode
{
  //==================================================
  // STATIC FIELDS
  //==================================================

  static className = "PotreeNode";

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private _url: string = "";

  private _boundingBox: Range3 | undefined = undefined;

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get url(): string { return this._url; }

  public set url(value: string) { this._url = value; }

  public get renderStyle(): PotreeRenderStyle | null { return this.getRenderStyle() as PotreeRenderStyle; }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return PotreeNode.className; }

  public /*override*/ isA(className: string): boolean { return className === PotreeNode.className || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ get typeName(): string { return "Potree"; }

  public /*override*/ get boundingBox(): Range3 | undefined { return this._boundingBox; }

  public /*override*/ createRenderStyle(targetId: TargetId): BaseRenderStyle | null
  {
    return new PotreeRenderStyle(targetId);
  }

  public /*override*/ verifyRenderStyle(style: BaseRenderStyle)
  {
    if (!(style instanceof PotreeRenderStyle))
      return;
  }
}