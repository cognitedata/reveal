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

import { RootNode } from "../Nodes/RootNode";
import { RevealTargetNode } from "./RevealTargetNode";
import { TargetNode } from "../Nodes/TargetNode";

export class RevealRootNode extends RootNode
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return RevealRootNode.name; }
  public /*override*/ isA(className: string): boolean { return className === RevealRootNode.name || super.isA(className); }

  //==================================================
  // OVERRIDES of VisualNode
  //==================================================

  protected /*override*/ initializeCore(): void
  {
    super.initializeCore();

    const target = new RevealTargetNode();
    target.isActive = true;

    const targetFolder = this.targetFolder;
    if (!targetFolder)
      throw Error("targetFolder is not added");

    this.addChild(target)

    if (!TargetNode.getActive(this))
      throw Error("target is not added properly");
  }
}