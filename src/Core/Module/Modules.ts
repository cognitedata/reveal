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
import { BaseModule } from "@/Core/Module/BaseModule";

export class Modules
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  modules: BaseModule[] = [];

  //==================================================
  // STATIC METHODS: Instance pattern
  //==================================================

  private static _instance: Modules | null = null;

  public static get instance(): Modules
  {
    if (!Modules._instance)
      Modules._instance = new Modules();
    return Modules._instance;
  }

  //==================================================
  // CONSTRUCTORS:
  //==================================================

  private constructor()
  {
    if (Modules._instance)
      throw new Error("Error - use Modules.instance");
  }

  //==================================================
  // INSTANCE METHODS:
  //==================================================

  public add(module: BaseModule): void
  {
    this.modules.push(module);
  }

  public install(): void
  {
    this.installPackages();
    this.registerViews();
  }

  public clearModules() {
    this.modules = [];
  }

  public initializeWhenPopulated(root: BaseRootNode): void
  {
    root.initializeRecursive();
    for (const module of this.modules)
      module.initializeWhenPopulated(root);

    for (const module of this.modules)
      module.setDefaultVisible(root);

    const target = root.activeTarget as BaseRenderTargetNode;
    if (target)
      target.viewAll();
  }

  public startAnimate(root: BaseRootNode): void
  {
    for (const module of this.modules)
      module.startAnimate(root);
  }

  public createRoot(): BaseRootNode
  {
    // Create the root from the last installed
    let root: BaseRootNode | null = null;
    for (let i = this.modules.length - 1; i >= 0; --i) {
      const module = this.modules[i];
      root = module.createRoot();
      if (root)
        break;
    }
    if (!root)
      throw Error("No module has implemented createRoot()");

    // Load the data
    root.initializeRecursive();
    for (const module of this.modules)
      module.loadData(root);

    return root;
  }

  public *getDomElements(root: BaseRootNode): Generator<HTMLElement>
  {
    for (const target of root.targets.getChildrenByType(BaseRenderTargetNode))
      yield target.domElement;
  }

  //==================================================
  // INSTANCE METHODS: Helpers
  //==================================================

  private installPackages(): void
  {
    for (const module of this.modules)
      module.installPackages();
  }

  private registerViews(): void
  {
    const factory = ViewFactory.instance;
    for (const module of this.modules)
      module.registerViews(factory);
  }
}

