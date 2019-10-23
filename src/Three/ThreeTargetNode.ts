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

import { TargetNode } from "../Core/Nodes/TargetNode";
import { ThreeCameraNode as ThreeCameraNode } from "./ThreeCameraNode";
import * as THREE from 'three';
import * as color from 'color'
import { ThreeConverter } from "./ThreeConverter";

export class ThreeTargetNode extends TargetNode
{
  //==================================================
  // FIELDS
  //==================================================

  private _scene: THREE.Scene | null = null;
  private _renderer: THREE.WebGLRenderer | null = null;

  //==================================================
  // PROPERTIES
  //==================================================

  public get domElement(): HTMLElement { return this.renderer.domElement; }

  public get scene(): THREE.Scene
  {
    if (!this._scene)
      this._scene = new THREE.Scene();
    return this._scene;
  }

  public get activeCamera(): THREE.Camera
  {
    const camera = this.getActiveChildByType(ThreeCameraNode);
    if (!camera)
      throw Error("The camera is not set");

    return camera.camera;
  }

  private get renderer(): THREE.WebGLRenderer
  {
    if (!this._renderer)
    {
      this._renderer = new THREE.WebGLRenderer();
      this._renderer.setClearColor(ThreeConverter.toColor(this.color));
      this._renderer.setSize(window.innerWidth, window.innerHeight);
    }
    return this._renderer;
  }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { 
    super(); 
    this.color = color.rgb(0, 0, 0);
  }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return ThreeTargetNode.name; }
  public /*override*/ isA(className: string): boolean { return className === ThreeTargetNode.name || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*virtual*/ get canBeActive() { return true; }

 public initializeCore()
  {
    super.initializeCore();

    // Add a ddefault active camera
    const cameraNode = new ThreeCameraNode();
    cameraNode.isActive = true;
    this.addChild(cameraNode);

    // Start the rendering
    const renderer = this.renderer;
    const camera = this.activeCamera;
    const scene = this.scene;

    const render = () =>
    {
      requestAnimationFrame(render);
      renderer.render(scene, camera);
    };
    render();
  }
}
