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

import * as THREE from "three";
import { Base3DView } from "@/Core/Views/Base3DView";
import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { NodeEventArgs } from "@/Core/Views/NodeEventArgs";

export abstract class BaseThreeView extends Base3DView {
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // OVERRIDES of BaseView
  //==================================================


  protected /*override*/ updateCore(args: NodeEventArgs): void {
    super.updateCore(args);
    this.invalidateTarget();
  }

  protected /*virtual*/ onShowCore(): void {
    super.onShowCore();
    this.invalidateTarget();
  }

  protected /*virtual*/ onHideCore(): void {
    super.onHideCore();
    this.invalidateTarget();
  }

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  protected get scene(): THREE.Scene { return this.renderTarget.scene; }
  protected get camera(): THREE.Camera { return this.renderTarget.camera; }
  protected get renderTarget(): ThreeRenderTargetNode { return super.getTarget() as ThreeRenderTargetNode; }

  protected invalidateTarget(): void {
    const target = this.renderTarget;
    if (target)
      target.invalidate();
  }
}
