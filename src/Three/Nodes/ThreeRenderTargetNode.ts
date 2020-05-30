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
import CameraControls from "camera-controls";

const Stats = require("stats-js");

import { Range3 } from "@/Core/Geometry/Range3";
import { Colors } from "@/Core/Primitives/Colors";

import { BaseRenderTargetNode } from "@/Core/Nodes/BaseRenderTargetNode";
import { AxisNode } from "@/Nodes/Decorations/AxisNode";

import { ThreeConverter } from "@/Three/Utilities/ThreeConverter";
import { TreeOverlay } from "@/Three/Utilities/TreeOverlay";
import { Ma } from "@/Core/Primitives/Ma";
import { ViewAllCommand } from "@/Three/Commands/ViewAllCommand";
import { ToggleAxisVisibleCommand } from "@/Three/Commands/ToggleAxisVisibleCommand";
import { ToggleBgColorCommand } from "@/Three/Commands/ToggleBgColorCommand";
import { IToolbar } from "@/Core/Interfaces/IToolbar";
import { ViewFromCommand } from "@/Three/Commands/ViewFromCommand";
import { Camera } from "@/Three/Nodes/Camera";

const DirectionalLightName = "DirectionalLight";

export class ThreeRenderTargetNode extends BaseRenderTargetNode
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private _scene: THREE.Scene | null = null;
  private _renderer: THREE.WebGLRenderer | null = null;
  private _overlay = new TreeOverlay();
  private _stats: any | null; // NILS: Why any here? Compiler error if not
  private isEmpty = true;
  private clock = new THREE.Clock();
  private _camera: Camera | null = null;

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get scene(): THREE.Scene
  {
    if (!this._scene)
      throw Error("Scene is not set");
    return this._scene;
  }

  public get camera(): THREE.Camera
  {
    if (!this._camera)
      throw Error("Camera is not set");
    return this._camera.camera;
  }

  private get controls(): CameraControls
  {
    if (!this._camera)
      throw Error("CameraControls is not set");
    return this._camera.controls;
  }

  private get directionalLight(): THREE.DirectionalLight | null
  {
    return this.scene.getObjectByName(DirectionalLightName) as THREE.DirectionalLight;
  }

  private get renderer(): THREE.WebGLRenderer
  {

    if (!this._renderer)
    {
      const renderer = new THREE.WebGLRenderer({ antialias: true, });
      renderer.autoClear = false;
      renderer.gammaFactor = 2.2;
      renderer.gammaOutput = true;

      this._renderer = renderer;
      this.setRenderSize();
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

    this._scene = new THREE.Scene();
    this._camera = new Camera(this);

    // Create lights
    const ambientLight = new THREE.AmbientLight(0x404040, 0.25); // soft white light
    const directionalLight = new THREE.DirectionalLight(ThreeConverter.toColor(Colors.white), 0.95);
    directionalLight.name = DirectionalLightName;
    const controls = this.controls;
    var self = this;
    if (controls)
      controls.addEventListener("update", () => ThreeRenderTargetNode.updateLightPositionStatic(self));

    this._scene.add(ambientLight);
    this._scene.add(directionalLight);
    this.render();
  }

  //==================================================
  // OVERRIDES of RenderTargetNode
  //==================================================

  public /*override*/ get domElement(): HTMLElement { return this.renderer.domElement; }

  protected /*override*/ setRenderSize(): void
  {
    const pixelRange = this.pixelRange;
    this.renderer.setSize(pixelRange.x.delta, pixelRange.y.delta);
  }

  public /*override*/ onResize()
  {
    super.onResize();
    if (this._camera)
      this._camera.onResize(this);
    this.invalidate();
  }

  //==================================================
  // INSTANCE METHODS: Render
  //==================================================

  private render(): void
  {
    requestAnimationFrame(() => { this.render(); });

    if (!this.isInitialized)
      return;

    const controls = this.controls;
    let needsUpdate = true;
    if (controls)
    {
      const delta = this.clock.getDelta();
      needsUpdate = controls.update(delta);
    }
    if (this.isInvalidated || needsUpdate)
    {
      if (this.isEmpty)
        this.isEmpty = !this.viewFrom(-1);

      this.stats.begin();

      const hasAxis = this.hasViewOfNodeType(AxisNode);
      this.scene.background = ThreeConverter.toColor(this.getBgColor(hasAxis));

      for (const view of this.viewsShownHere.list)
        view.beforeRender();

      this.renderer.render(this.scene, this.camera);
      this.stats.end();

      const viewInfo = this.getViewInfo();
      this._overlay.render(this.renderer, viewInfo, this.pixelRange.delta);
      this.invalidate(false);
    }
  }

  //==================================================
  // INSTANCE METHODS: Add toolbar
  //==================================================

  public addTools(toolbar: IToolbar)
  {
    toolbar.add(new ViewAllCommand(this));
    toolbar.add(new ToggleAxisVisibleCommand(this));
    toolbar.add(new ToggleBgColorCommand(this));

    toolbar.beginOptionMenu();
    for (let viewFrom = 0; viewFrom < 6; viewFrom++)
      toolbar.add(new ViewFromCommand(this, viewFrom));
    toolbar.beginOptionMenu();
  }

  //==================================================
  // INSTANCE METHODS: Operations on camera or light
  //==================================================

  public viewAll(): boolean 
  {
    return !this._camera ? false : this._camera.viewRange(this.getBoundingBoxFromViews());
  }

  public viewFrom(index: number): boolean
  {
    return !this._camera ? false : this._camera.viewFrom(this.getBoundingBoxFromViews(), index);
  }

  private updateLightPosition(): void
  {
    const camera = this.camera
    const controls = this.controls
    const light = this.directionalLight
    if (!light)
      return;

    // The idea of this function is letting the light track the camera, 
    const position = controls.getPosition();
    const target = controls.getTarget();

    const vectorToCenter = position.clone();
    vectorToCenter.sub(target);

    // Get camera direction
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);

    let vectorLength = vectorToCenter.length();
    vectorToCenter.normalize();
    // Vector direction is opposite to camera direction

    const horizontalAxis = vectorToCenter.clone();
    const verticalAxis = new THREE.Vector3(0, 0, 1);

    horizontalAxis.z = 0;
    horizontalAxis.normalize();
    horizontalAxis.applyAxisAngle(verticalAxis, Math.PI / 2);

    verticalAxis.crossVectors(horizontalAxis, vectorToCenter);

    vectorToCenter.applyAxisAngle(verticalAxis, Ma.toRad(0)); // Azimuth angle
    vectorToCenter.applyAxisAngle(horizontalAxis, -Ma.toRad(30)); //Dip angle

    vectorLength = Math.max(vectorLength, 5000); // Move the light far away
    vectorToCenter.multiplyScalar(vectorLength);
    vectorToCenter.add(target)

    light.position.copy(vectorToCenter);
  }

  //==================================================
  // STATIC METHODS
  //==================================================

  static updateLightPositionStatic(node: ThreeRenderTargetNode): void
  {
    node.updateLightPosition();
  }
}
