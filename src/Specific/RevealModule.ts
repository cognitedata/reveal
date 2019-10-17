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

import { PolylinesView3 } from "./PolylinesView3";
import { PolylinesNode } from "./PolylinesNode";
import { BaseModule } from "../Architecture/BaseModule";
import { ViewFactory } from "../Architecture/ViewFactory";
import { RevealTargetNode } from "./RevealTargetNode";

export class RevealModule extends BaseModule
{
  //==================================================
  // OVERRIDES of BaseModule
  //==================================================

  protected RegisterViewsCore(): void
  {
    let factory = ViewFactory.instance;
    factory.register(PolylinesNode.staticClassName, PolylinesView3, RevealTargetNode.staticClassName);
  }
}

