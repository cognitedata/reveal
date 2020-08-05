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

import { Range3 } from "@/Core/Geometry/Range3";

import { NodeEventArgs } from "@/Core/Views/NodeEventArgs";
import { Changes } from "@/Core/Views/Changes";
import { BaseThreeView } from "@/Three/BaseViews/BaseThreeView";
import { BoundingBoxKit } from "@/Three/Utilities/BoundingBoxKit";

export abstract class BaseGroupThreeView extends BaseThreeView
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  protected _object3D: THREE.Object3D | null = null;

  protected get object3D(): THREE.Object3D | null
  {
    if (this.mustTouch())
      this.touchPart();
    if (!this._object3D)
      this.makeObject();
    return this._object3D;
  }

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
    if (args.isChanged(Changes.geometry) || args.isChanged(Changes.renderStyle))
      this.touch();
  }

  protected /*override*/ clearMemoryCore(): void
  {
    if (!this.isVisible)
      this.touch(); // Remove the group from the memory
  }

  protected /*override*/ onShowCore(): void
  {
    super.onShowCore();
    // Create the group and add it to the scene
    if (this._object3D)
      this._object3D.visible = true;
  }

  protected /*override*/ onHideCore(): void
  {
    if (!this._object3D)
      return;

    this._object3D.visible = false;
    super.onHideCore();
  }

  public /*override*/ beforeRender(): void
  {
    super.beforeRender();

    if (this.isVisible)
    {
      const object = this.object3D; // In order to regenerate it
      if (object)
        object.visible = true;
    }
    else
    {
      if (!this._object3D)
        return;

      this._object3D.visible = this.isVisible;
    }
  }

  //==================================================
  // OVERRIDES of Base3DView
  //==================================================

  public /*override*/ calculateBoundingBoxCore(): Range3 | undefined
  {
    if (!this.object3D)
      return undefined;

    const boundingBox = BoundingBoxKit.getBoundingBox(this.object3D, this.transformer);
    if (!boundingBox)
      return undefined;

    return boundingBox;
  }

  //==================================================
  // VIRTUAL METHODS
  //==================================================

  protected abstract createObject3DCore(): THREE.Object3D | null;

  protected /*virtual*/ mustTouch(): boolean { return false; }

  protected /*virtual*/ touchPart(): void { this.touch(); }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  private makeObject(): void
  {
    this._object3D = this.createObject3DCore();
    if (!this._object3D)
      return;

    this._object3D.name = this.getNode().uniqueId.toString();
    this._object3D.visible = true;
    this.scene.add(this._object3D);
    this.touchBoundingBox();
  }

  public touch(): void
  {
    const {scene} = this;
    if (this._object3D)
      scene.remove(this._object3D);

    this._object3D = null;
    this.touchBoundingBox();
  }
}
