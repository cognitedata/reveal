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
import { BaseRenderTargetNode } from "@/Core/Nodes/BaseRenderTargetNode";
import { ViewFactory } from "@/Core/Views/ViewFactory";

export abstract class BaseModule
{
  //==================================================
  // VIRTUAL METHODS: 
  //==================================================

  protected /*virtual*/ installPackagesCore(): void { }
  protected /*virtual*/ registerViewsCore(factory: ViewFactory): void { }
  protected /*virtual*/ initializeWhenPopulatedCore(root: BaseRootNode): void { }

  protected /*virtual*/ abstract createRootCore(): BaseRootNode;

  //==================================================
  // INSTANCE METHODS: 
  //==================================================

  public install(): void
  {
    this.installPackagesCore();
    this.registerViewsCore(ViewFactory.instance);
  }

  public initializeWhenPopulated(root: BaseRootNode): void
  {
    this.initializeWhenPopulatedCore(root);
    root.initializeRecursive();
  }

  public createRoot(): BaseRootNode
  {
    const root = this.createRootCore();
    root.initializeRecursive();
    return root;
  }

  public *getDomElements(root: BaseRootNode): Iterable<HTMLElement>
  {
    for (const target of root.targets.getChildrenByType(BaseRenderTargetNode))
      yield target.domElement;
  }
}

