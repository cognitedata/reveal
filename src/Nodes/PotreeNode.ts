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
import { TargetId } from "../Core/PrimitivClasses/TargetId";
import { PotreeRenderStyle } from "./PotreeRenderStyle";

export class PotreeNode extends BaseVisualNode
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // FIELDS
  //==================================================

  private _url: string = "";

  //==================================================
  // PROPERTIES
  //==================================================

  public get url(): string { return this._url; }
  public set url(value: string) { this._url = value; }
  public get renderStyle(): PotreeRenderStyle | null { return this.getRenderStyle() as PotreeRenderStyle; }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return PotreeNode.name; }
  public /*override*/ isA(className: string): boolean { return className === PotreeNode.name || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ get typeName(): string { return "Potree" }

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