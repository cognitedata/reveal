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

import CameraControls from 'camera-controls';
import * as THREE from 'three';

const Stats = require('stats-js');

import { BaseRenderTargetNode } from "../Core/Nodes/BaseRenderTargetNode";
import { ThreeCameraNode as ThreeCameraNode } from "./ThreeCameraNode";
import { ThreeConverter } from "./ThreeConverter";
import { Range3 } from '../Core/Geometry/Range3';
import { TreeOverlay } from './TreeOverlay';

export class ThreeRenderTargetNode extends BaseRenderTargetNode
{
  //==================================================
  // FIELDS
  //==================================================

  private _scene: THREE.Scene | null = null;
  private _renderer: THREE.WebGLRenderer | null = null;
  private _clock = new THREE.Clock();
  private _overlay = new TreeOverlay();
  private _stats: any | null; // NILS: Why any here? Compiler error if not


  // scene.background = new THREE.Color('white');

  //==================================================
  // PROPERTIES
  //==================================================

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

  public get activeControls(): CameraControls | null
  {
    const cameraNode = this.activeCameraNode;
    if (!cameraNode)
      throw Error("The camera is not set");

    return cameraNode.controls;
  }

  private get renderer(): THREE.WebGLRenderer
  {
    if (!this._renderer)
    {
      this._renderer = new THREE.WebGLRenderer();
      this._renderer.setClearColor(ThreeConverter.toColor(this.color));
      this.setRenderSize();
      this._renderer.autoClear = false;
    }
    return this._renderer;
  }

  public get stats(): any
  {
    if (!this._stats)
    {
      this._stats = new Stats();
      this._stats.showPanel(0);
    }
    return this._stats;
  }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(fractionRange: Range3 | undefined) { super(fractionRange); }

  //==================================================
  // OVERRIDES of TargetNode
  //==================================================

  public /*override*/ get className(): string { return ThreeRenderTargetNode.name; }
  public /*override*/ isA(className: string): boolean { return className === ThreeRenderTargetNode.name || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ initializeCore()
  {
    super.initializeCore();
    this.addCameraNode(new ThreeCameraNode(), true);
    this.render();

    // Add lights (TODO: move to TreeLightNode?)
    const scene = this.scene;
    const direction = new THREE.Vector3(0.5, -0.5, 1);
    const color = 0xFFFFFF;

    const group = new THREE.Group();
    // Light from the sky
    {
      const intensity = 1;
      const light = new THREE.DirectionalLight(color, intensity);
      light.position.set(direction.x, direction.y, direction.z);
      group.add(light);
    }
    // Light from the ground
    {
      const intensity = 0.75;
      const light = new THREE.DirectionalLight(color, intensity);
      light.position.set(-direction.x, -direction.y, -direction.z);
      group.add(light);
    }
    scene.add(group);
  }

  //==================================================
  // OVERRIDES of RenderTargetNode
  //==================================================

  public /*override*/ viewRange(boundingBox: Range3 | undefined): void
  {
    if (!boundingBox)
      return;

    if (boundingBox.isEmpty)
      return;

    const controls = this.activeControls;
    if (!controls)
      return;

    //https://github.com/yomotsu/camera-controls
    controls.fitTo(ThreeConverter.toBox(boundingBox));
    // The below stuff doesn't work!!
    // controls.rotate(0, 0.8);
    //controls.setLookAt(0, 0, 0);
    controls.moveTo(boundingBox.x.center, boundingBox.y.center, boundingBox.z.center);
  }

  public /*override*/ get domElement(): HTMLElement { return this.renderer.domElement; }

  protected /*override*/ setRenderSize(): void
  {
    const pixelRange = this.pixelRange;
    this.renderer.setSize(pixelRange.x.delta, pixelRange.y.delta);
  }

  //==================================================
  // INSTANCE FUNCTIONS
  //==================================================

  private render(): void
  {
    requestAnimationFrame(() => { this.render(); });

    if (!this.isInitialized)
      return;

    const controls = this.activeControls;
    let needsUpdate = true;
    if (controls)
    {
      const delta = this._clock.getDelta();
      needsUpdate = controls.update(delta);
    }
    if (this.isInvalidated || needsUpdate)
    {
      this.stats.begin();
      this.renderer.render(this.scene, this.activeCamera);
      this.stats.end();

      var viewInfo = this.getViewInfo();

      this._overlay.render(this.renderer, viewInfo, this.pixelRange.delta);
      this.Invalidate(false);
    }
  }
}
