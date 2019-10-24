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

import { BaseCameraNode } from "../Core/Nodes/BaseCameraNode";
import { RenderTargetNode } from "../Core/Nodes/RenderTargetNode";
import CameraControls from 'camera-controls';
import * as THREE from 'three';

export class ThreeCameraNode extends BaseCameraNode
{
  //==================================================
  // FIELDS
  //==================================================

  private _camera: THREE.Camera | null = null;
  private _controls: CameraControls | null = null;

  //==================================================
  // PROPERTIES
  //==================================================

  public get camera(): THREE.Camera
  {
    if (!this._camera)
    {
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 100;
      camera.position.x = 0;
      camera.position.y = 0;
      this._camera = camera;
    }
    return this._camera;
  }

  public set camera(value: THREE.Camera) { this._camera = value; this._controls = null; }

  public get controls(): CameraControls | null
  {
    if (!this._controls)
    {
      const target = this.getTarget() as RenderTargetNode;
      if (!target)
        return null;;

      const camera = this.camera as THREE.PerspectiveCamera | THREE.OrthographicCamera
      if (!camera)
        return null;


      this._controls = new CameraControls(camera, target.domElement);
    }
    return this._controls;
  }

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
