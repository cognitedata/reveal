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

import { TargetNode } from "../Nodes/TargetNode";
import * as THREE from 'three';

export class ThreeTargetNode extends TargetNode
{
  //==================================================
  // FIELDS
  //==================================================

  private _scene: THREE.Scene | null = null;
  private _camera: THREE.Camera | null = null;
  private _renderer: THREE.WebGLRenderer | null = null;

  //==================================================
  // PROPERTIES
  //==================================================

  public get domElement(): HTMLElement { return this.renderer.domElement; }

  public get scene(): THREE.Scene
  {
    if (this._scene == null)
      this._scene = new THREE.Scene();
    return this._scene;
  }

  public get camera(): THREE.Camera
  {
    if (this._camera == null)
    {
      this._camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      this._camera.position.z = 4;
    }
    return this._camera;
  }


  private get renderer(): THREE.WebGLRenderer
  {
    if (this._renderer == null)
    {
      this._renderer = new THREE.WebGLRenderer();
      this._renderer.setClearColor("#000000");
      this._renderer.setSize(window.innerWidth, window.innerHeight);
    }
    return this._renderer;
  }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return ThreeTargetNode.name; }
  public /*override*/ isA(className: string): boolean { return className === ThreeTargetNode.name || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public initializeCore()
  {
    super.initializeCore();

    const renderer = this.renderer;
    const camera = this.camera;
    const scene = this.scene;

    const render = function ()
    {
      requestAnimationFrame(render);
      renderer.render(scene, camera);
    };
    render();
  }
}
