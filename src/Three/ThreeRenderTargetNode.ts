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
import CameraControls from 'camera-controls';

const Stats = require('stats-js');

import { BaseRenderTargetNode } from "../Core/Nodes/BaseRenderTargetNode";
import { ThreeCameraNode as ThreeCameraNode } from "./ThreeCameraNode";
import { ThreeConverter } from "./ThreeConverter";
import { Range3 } from '../Core/Geometry/Range3';
import { TreeOverlay } from './TreeOverlay';
import { AxisNode } from './../Nodes/AxisNode';
import { Colors } from '../Core/PrimitiveClasses/Colors';
import * as Color from 'color'

export class ThreeRenderTargetNode extends BaseRenderTargetNode
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private _scene: THREE.Scene | null = null;
  private _renderer: THREE.WebGLRenderer | null = null;
  private _clock = new THREE.Clock();
  private _overlay = new TreeOverlay();
  private _stats: any | null; // NILS: Why any here? Compiler error if not

  //==================================================
  // INSTANCE PROPERTIES
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
      this._renderer = new THREE.WebGLRenderer({ antialias: true });
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


    // Light from the sky
    const directions = new Array<THREE.Vector3>();
    directions.push(new THREE.Vector3(2000, 0, 2000));
    directions.push(new THREE.Vector3(-2000, 0, 2000));
    directions.push(new THREE.Vector3(0, 2000, 2000));
    directions.push(new THREE.Vector3(0, -2000, 2000));

    const hasAxis = this.hasViewOfNodeType(AxisNode);
    this.scene.background = ThreeConverter.toColor(this.getBgColor(hasAxis));

    const lightColor = ThreeConverter.toColor(Colors.white);
    const group = new THREE.Group();

    for (const direction of directions)
    {
      const intensity = 0.25;
      const light = new THREE.DirectionalLight(lightColor, intensity);
      light.position.copy(direction);
      group.add(light);
    }
    {
      const light = new THREE.AmbientLight(lightColor, 0.25)
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
    // controls.setLookAt(boundingBox.x.center, boundingBox.y.center, boundingBox.z.center, 0, 0, 0);
    controls.moveTo(boundingBox.x.center, boundingBox.y.center, boundingBox.z.center);
  }

  public /*override*/ get domElement(): HTMLElement { return this.renderer.domElement; }

  protected /*override*/ setRenderSize(): void
  {
    const pixelRange = this.pixelRange;
    this.renderer.setSize(pixelRange.x.delta, pixelRange.y.delta);
  }

  //==================================================
  // INSTANCE METHODS
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

      for (const view of this.viewsShownHere.list)
        view.beforeRender();

      this.renderer.render(this.scene, this.activeCamera);
      this.stats.end();

      const viewInfo = this.getViewInfo();

      this._overlay.render(this.renderer, viewInfo, this.pixelRange.delta);
      this.Invalidate(false);
    }
  }
}
