
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

import { BaseModule } from "../../Core/Module/BaseModule";
import { ViewFactory } from "../../Core/Views/ViewFactory";
import { PolylinesNode } from "../../Core/Geometry/PolylinesNode";
import { TestPolylinesView } from "./TestPolylinesView";
import { TestTargetNode } from "./TestTargetNode";
import { RootNode } from "../../Core/Nodes/RootNode";
import { TestRootNode } from "./TestRootNode";

export class TestModule extends BaseModule
{
  //==================================================
  // OVERRIDES of BaseModule
  //==================================================

  protected /*override*/ registerViewsCore(factory: ViewFactory): void
  {
    factory.register(PolylinesNode.name, TestPolylinesView, TestTargetNode.name);
  }

  protected /*override*/ createRootCore(): RootNode
  {
    return new TestRootNode();
  }
}

