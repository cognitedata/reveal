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

import { CameraNode } from "../Core/Nodes/CameraNode";
import * as THREE from 'three';

export class ThreeCameraNode extends CameraNode
{
  //==================================================
  // FIELDS
  //==================================================

  private _camera: THREE.Camera | null = null;

  //==================================================
  // PROPERTIES
  //==================================================

  public get camera(): THREE.Camera
  {
    if (!this._camera)
    {
      this._camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      this._camera.position.z = 50;
      this._camera.position.x = 50;
      this._camera.position.y = 50;
    }
    return this._camera;
  }

  public set camera(value: THREE.Camera)  { this._camera = value; }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return ThreeCameraNode.name; }
  public /*override*/ isA(className: string): boolean { return className === ThreeCameraNode.name || super.isA(className); }
}
