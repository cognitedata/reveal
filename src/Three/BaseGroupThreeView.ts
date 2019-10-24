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

import { NodeEventArgs } from "../Core/Views/NodeEventArgs";
import { Changes } from "../Core/Views/Changes";
import { BaseThreeView } from "./BaseThreeView";
import * as THREE from 'three';

export abstract class BaseGroupThreeView extends BaseThreeView
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // FIELDS
  //==================================================

  private _group: THREE.Object3D | null = null;

  //==================================================
  // OVERRIDES of BaseView
  //==================================================

  public /*override*/ get stayAliveIfInvisible(): boolean { return true; }

  protected /*override*/ updateCore(args: NodeEventArgs): void
  {
    super.updateCore(args);
    if (args.isChanged(Changes.geometry) || args.isChanged(Changes.renderStyle))
    {
      if (this.isVisible)
        this.updateAll();
      else
        this._group = null;
    }
  }

  protected /*override*/ clearMemoryCore(): void
  {
    if (!this.isVisible)
      this._group = null; // Remove the group from the memory
  }

  protected /*override*/ onShowCore(): void
  {
    super.onShowCore();
    // Create the group and add it to the scene
    if (!this._group)
      this._group = this.createGroup();

    const scene = this.scene;
    scene.add(this._group);
  }

  protected /*override*/ onHideCore(): void
  {
    if (!this._group)
      return;

    // Remove the group for the scene
    const scene = this.scene;
    scene.remove(this._group);
    if (!this.stayAliveIfInvisible)
      this._group = null;

    super.onHideCore();
  }

  //==================================================
  // VIRTUAL METHODS
  //==================================================

  protected abstract createGroup(): THREE.Object3D;

  //==================================================
  // INSTANCE METHODS
  //==================================================

  protected updateAll(): void
  {
    const scene = this.scene;
    if (this._group)
      scene.remove(this._group);
    this._group = this.createGroup();
    scene.add(this._group);
  }
}
