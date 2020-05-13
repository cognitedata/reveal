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

import * as THREE from 'three';
import { NodeEventArgs } from "../Core/Views/NodeEventArgs";
import { Changes } from "../Core/Views/Changes";
import { BaseThreeView } from "./BaseThreeView";

export abstract class BaseGroupThreeView extends BaseThreeView
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private _object3D: THREE.Object3D | null = null;
  protected get object3D(): THREE.Object3D | null { return this._object3D; }

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
        this._object3D = null;
    }
  }

  protected /*override*/ clearMemoryCore(): void
  {
    if (!this.isVisible)
      this._object3D = null; // Remove the group from the memory
  }

  protected /*override*/ onShowCore(): void
  {
    super.onShowCore();
    // Create the group and add it to the scene
    if (!this._object3D)
    {
      this._object3D = this.createObject3D();
      if (this._object3D != null)
        this.scene.add(this._object3D);
    }
    else
      this._object3D.visible = true;
  }

  protected /*override*/ onHideCore(): void
  {
    if (!this._object3D)
      return;

    if (!this.stayAliveIfInvisible)
    {
      // Remove the group for the scene
      this.scene.remove(this._object3D);
      this._object3D = null;
    }
    else
      this._object3D.visible = false;
    super.onHideCore();
  }

  //==================================================
  // VIRTUAL METHODS
  //==================================================

  protected abstract createObject3D(): THREE.Object3D | null;

  //==================================================
  // INSTANCE METHODS
  //==================================================

  private updateAll(): void
  {
    const scene = this.scene;
    if (this._object3D)
      scene.remove(this._object3D);

    this._object3D = this.createObject3D();
    if (this._object3D === null)
      return;

    this._object3D.visible = true;
    scene.add(this._object3D);
  }
}
