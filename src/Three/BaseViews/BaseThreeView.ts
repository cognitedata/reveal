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
import { ThreeTransformer } from "@/Three/Utilities/ThreeTransformer";

export abstract class BaseThreeView extends Base3DView
{
  public static readonly noPicking = "noPicking";

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  protected get scene(): THREE.Scene { return this.renderTarget.scene; }
  protected get camera(): THREE.Camera { return this.renderTarget.camera; }
  public get transformer(): ThreeTransformer { return this.renderTarget.transformer; }
  protected get renderTarget(): ThreeRenderTargetNode { return super.getTarget() as ThreeRenderTargetNode; }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // OVERRIDES of BaseView
  //==================================================

  protected /*override*/ updateCore(args: NodeEventArgs): void
  {
    super.updateCore(args);
    this.invalidateTarget();
  }

  protected /*override*/ onShowCore(): void
  {
    super.onShowCore();
    this.invalidateTarget();
  }

  protected /*override*/ onHideCore(): void
  {
    super.onHideCore();
    this.invalidateTarget();
  }

  //==================================================
  // VIRTUAL METHODS
  //==================================================

  public /*virtual*/ shouldPick(): boolean { return true; }
  public /*virtual*/ onMouseClick(intersection: THREE.Intersection): void { }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  protected invalidateTarget(): void
  {
    const target = this.renderTarget;
    if (!target)
      return;

    target.invalidate();
  }
}
