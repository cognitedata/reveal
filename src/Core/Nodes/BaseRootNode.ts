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
import { DataFolder } from "./DataFolder";
import { BaseNode } from "./BaseNode";
import { BaseTargetNode } from "./BaseTargetNode";
import { TargetIdAccessor } from "../Interfaces/TargetIdAccessor";

export class BaseRootNode extends BaseNode
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor()
  {
    super();
    this.name = "Root";
  }

  //==================================================
  //PROPERTIES
  //==================================================

  public get dataFolder(): DataFolder
  {
    const child = this.getChildByType(DataFolder);
    if (!child)
      throw new Error("Cannot find the " + DataFolder.name);
    return child;
  }

  public get targetFolder(): TargetFolder 
  {
    const child = this.getChildByType(TargetFolder);
    if (!child)
      throw new Error("Cannot find the " + TargetFolder.name);
    return child;
  }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return BaseRootNode.name; }
  public /*override*/ isA(className: string): boolean { return className === BaseRootNode.name || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ get canChangeColor(): boolean { return false; }
  public /*override*/ get typeName(): string { return "Root" }

  protected /*override*/ get activeTargetIdAccessor(): TargetIdAccessor | null
  {
    const targetNode = this.activeTarget;
    return targetNode as TargetIdAccessor;
  }

  protected /*override*/ initializeCore(): void
  {
    super.initializeCore();
    this.addChild(new TargetFolder());
    this.addChild(new DataFolder());
  }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  public get activeTarget(): BaseTargetNode | null
  {
    return this.targetFolder.getActiveDescendantByType(BaseTargetNode);
  }
}