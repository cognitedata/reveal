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

import { BaseRootNode } from "@/Core/Nodes/BaseRootNode";
import { ViewFactory } from "@/Core/Views/ViewFactory";

export abstract class BaseModule
{
  //==================================================
  // VIRTUAL METHODS: 
  //==================================================

  public /*virtual*/ installPackages(): void { }
  public /*virtual*/ registerViews(factory: ViewFactory): void { }
  public /*virtual*/ createRoot(): BaseRootNode | null { return null; }
  public /*virtual*/ loadData(root: BaseRootNode): void { }
  public /*virtual*/ initializeWhenPopulated(root: BaseRootNode): void { }
  public /*virtual*/ setDefaultVisible(root: BaseRootNode): void { }
  public /*virtual*/ startAnimate(root: BaseRootNode) :void { }
}
