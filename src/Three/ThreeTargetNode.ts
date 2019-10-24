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

  public get activeCameraNode(): ThreeCameraNode { return super.getActiveCameraNode() as ThreeCameraNode };

  public get activeCamera(): THREE.Camera
  {
    const cameraNode = this.activeCameraNode;
    if (!cameraNode)
      throw Error("The camera is not set");

    return cameraNode.camera;
  }

  public set activeCamera(value: THREE.Camera)
  {
    const cameraNode = this.activeCameraNode;
    if (!cameraNode)
      throw Error("The camera is not set");

    cameraNode.camera = value;
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

  public constructor() { super(); }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return ThreeTargetNode.name; }
  public /*override*/ isA(className: string): boolean { return className === ThreeTargetNode.name || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/  initializeCore()
  {
    super.initializeCore();

    // Add a ddefault active camera
    const cameraNode = new ThreeCameraNode();
    cameraNode.isActive = true;
    this.addChild(cameraNode);

    this.render();
  }

  //==================================================
  // INSTANCE FUNCTIONS
  //==================================================

  private render(): void
  {
    // This goes forever?
    requestAnimationFrame(() => { this.render(); });
    this.renderer.render(this.scene, this.activeCamera);
  }
}
