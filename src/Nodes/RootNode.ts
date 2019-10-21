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

import { TargetFolder } from "./TargetFolder";
import { DataFolder as DataFolder } from "./DataFolder";
import { BaseNode } from "./BaseNode";
import { IVisibilityContext } from "../Architecture/IVisibilityContext";
import { TargetNode } from "./TargetNode";

export class RootNode extends BaseNode
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor()
  {
    super();
  }

  //==================================================
  //PROPERTIES
  //==================================================

  public get dataFolder(): DataFolder | null { return this.getChildOfType(DataFolder); }
  public get targetFolder(): TargetFolder | null { return this.getChildOfType(TargetFolder); }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return RootNode.name; }
  public /*override*/ isA(className: string): boolean { return className === RootNode.name || super.isA(className); }

  //==================================================
  // OVERRIDES of VisualNode
  //==================================================

  protected /*override*/ initializeCore(): void
  {
    super.initializeCore();
    this.addChild(new TargetFolder())
    this.addChild(new DataFolder())
  }

  //==================================================
  // VIRTUAL FUNCTIONS
  //==================================================

  public /*virtual*/ getActiveTarget(): IVisibilityContext | null
  {
    const targetFolder = this.targetFolder;
    if (!targetFolder)
      return null;
    return targetFolder.getActiveDescendantByClassName(TargetNode.name) as TargetNode;
  }
}