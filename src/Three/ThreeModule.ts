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

import { PolylinesView3 } from "./PolylinesThreeView";
import { PolylinesNode } from "../Example/PolylinesNode";
import { BaseModule } from "../Core/Module/BaseModule";
import { ViewFactory } from "../Core/Views/ViewFactory";
import { ThreeTargetNode } from "./ThreeTargetNode";
import { RootNode } from "../Core/Nodes/RootNode";
import { ThreeRootNode } from "./ThreeRootNode";

export class ThreeModule extends BaseModule
{
  //==================================================
  // OVERRIDES of BaseModule
  //==================================================

  protected /*override*/ registerViewsCore(factory: ViewFactory): void
  {
    factory.register(PolylinesNode.name, PolylinesView3, ThreeTargetNode.name);
  }

  protected /*override*/ createRootCore(): RootNode
  {
    return new ThreeRootNode();
  }
}

