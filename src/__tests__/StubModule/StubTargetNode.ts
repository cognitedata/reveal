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

import { TargetNode } from "../../Core/Nodes/TargetNode";

export class StubTargetNode extends TargetNode
{
  //==================================================
  // FIELDS
  //==================================================

  public isInitialized = false;

  //==================================================
  // PROPERTIES
  //==================================================

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return StubTargetNode.name; }
  public /*override*/ isA(className: string): boolean { return className === StubTargetNode.name || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public initializeCore()
  {
    super.initializeCore();
    this.isInitialized = true;
  }
}
