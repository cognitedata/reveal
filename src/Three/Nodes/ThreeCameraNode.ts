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

import CameraControls from "camera-controls";
import * as THREE from "three";

import { BaseRenderTargetNode } from "@/Core/Nodes/BaseRenderTargetNode";

export class Camera
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private _camera: THREE.Camera | null = null;
  private _controls: CameraControls | null = null;

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get camera(): THREE.Camera | null
  {

    if (!this._camera)
    {
      const target = this.getTarget();
      if (!target)
        return null;

      const camera = this.createPerspectiveCamera();
      this._camera = camera;
    }
    return this._camera;
  }

  public get controls(): CameraControls | null
  {
    if (!this._controls)
    {
      const target = this.getTarget();
      if (!target)
        return null;;

      const camera = this.camera as THREE.PerspectiveCamera | THREE.OrthographicCamera;
      if (!camera)
        return null;

      // https://andreasrohner.at/posts/Web%20Development/JavaScript/Simple-orbital-camera-controls-for-THREE-js/
      this._controls = new CameraControls(camera, target.domElement);
      this._controls.setPosition(0, 0, 20);
    }
    return this._controls;
  }

  //==================================================
  // OVERRIDES of BaseCameraNode
  //==================================================

  public /*override*/ updateAspect(value: number)
  {
    const camera = this._camera;
    if (this._camera === null)
      return;

    if (!(camera instanceof THREE.PerspectiveCamera))
      return;

    camera.aspect = value;
    camera.updateProjectionMatrix();
  }

  //==================================================
  // INSTANCE METHODS: 
  //==================================================


  public createPerspectiveCamera(): THREE.Camera | null
  {
    const target = this.getTarget();
    if (!target)
      return null;

    const aspectRatio = target ? target.aspectRatio : undefined;
    const camera = new THREE.PerspectiveCamera(45, aspectRatio, 0.1, 10_000);
    camera.up.set(0, 0, 1);
    return camera;
  }

  public createOrthographicCamera(): THREE.Camera | null
  {
    const target = this.getTarget();
    if (!target)
      return null;

    const range = target.pixelRange;
    const camera = new THREE.OrthographicCamera(-range.x.delta / 2, range.x.delta / 2, range.x.delta / 2, -range.x.delta / 2, 0.1, 10_000);
    camera.up.set(0, 0, 1);
    return camera;
  }



  // public switchCamera(isOrthographic) {

  //   if (!this._camera)
  //     return;
  //   if (!this._controls)
  //     return;

  //   var cameraPosition = this._camera.position.clone();
  //   var cameraMatrix = this._camera.matrix.clone();



  //   var oControlsTarget = oControls.target.clone();
  //   var oControlsPosition = oControls.position0.clone();
  //   if (isOrthographic == false) {
  //     aCamera = pCamera;
  //   } else {
  //     aCamera = oCamera;
  //   }
  //   aCamera.position.copy(cameraPosition);
  //   aCamera.matrix.copy(cameraMatrix);
  //   aCamera.updateProjectionMatrix();
  //   this._controls.object = aCamera;
  //   this._cControls.update();
  //   render();
  // }


  //==================================================
  // INSTANCE METHODS
  //==================================================

  public getTarget(): BaseRenderTargetNode | null { return super.getTarget() as BaseRenderTargetNode; }

}
