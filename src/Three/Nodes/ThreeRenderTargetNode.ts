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
import { ThreeCameraNode } from "@/Three/Nodes/ThreeCameraNode";
import { TreeOverlay } from "@/Three/Utilities/TreeOverlay";
import { Ma } from "@/Core/Primitives/Ma";

export class ThreeRenderTargetNode extends BaseRenderTargetNode {
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

  public get scene(): THREE.Scene {
    if (!this._scene)
      this._scene = new THREE.Scene();
    return this._scene;
  }

  public get activeCameraNode(): ThreeCameraNode { return super.getActiveCameraNode() as ThreeCameraNode };

  public get activeCamera(): THREE.Camera {
    const cameraNode = this.activeCameraNode;
    if (!cameraNode)
      throw Error("The camera is not set");

    return cameraNode.camera;
  }

  public set activeCamera(value: THREE.Camera) {
    const cameraNode = this.activeCameraNode;
    if (!cameraNode)
      throw Error("The camera is not set");

    cameraNode.camera = value;
  }

  public get activeControls(): CameraControls | null {
    const cameraNode = this.activeCameraNode;
    if (!cameraNode)
      throw Error("The camera is not set");

    return cameraNode.controls;
  }

  private get directionalLight(): THREE.DirectionalLight | null {
    if (!this._scene)
      return null;
    return this._scene.getObjectByName("DirectionalLight") as THREE.DirectionalLight;
  }

  private get renderer(): THREE.WebGLRenderer {

    if (!this._renderer) {
      const renderer = new THREE.WebGLRenderer({ antialias: true, });
      renderer.autoClear = false;
      renderer.gammaFactor = 2.2;
      renderer.gammaOutput = true;

      this._renderer = renderer;
      this.setRenderSize();

    }
    return this._renderer;
  }

  public get stats(): any {
    if (!this._stats) {
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

  public /*override*/ initializeCore() {
    super.initializeCore();

    this.addCameraNode(new ThreeCameraNode(), true);
    this.render();

    // Set background
    const hasAxis = this.hasViewOfNodeType(AxisNode);
    this.scene.background = ThreeConverter.toColor(this.getBgColor(hasAxis));

    // Add light (TODO: move to TreeLightNode?)
    const scene = this.scene;
    const light = new THREE.DirectionalLight(ThreeConverter.toColor(Colors.white), 0.75);
    light.name = "DirectionalLight";

    scene.add(light);
    //camera.add(light);
    //scene.add(camera);
    var self = this;
    function lightUpdate() {
      ThreeRenderTargetNode.updateLightPositionStatic(self);
    }
    this.domElement.addEventListener("mousemove", lightUpdate);
    this.domElement.addEventListener("wheel", lightUpdate);

    var ambientLight = new THREE.AmbientLight(0x404040, 0.25); // soft white light
    scene.add(ambientLight);
    this.updateLightPosition();
  }

  //==================================================
  // OVERRIDES of RenderTargetNode
  //==================================================

  public /*override*/ viewRange(boundingBox: Range3 | undefined): void {
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
    controls.update(0);
    this.updateLightPosition();
  }

  public /*override*/ get domElement(): HTMLElement { return this.renderer.domElement; }

  protected /*override*/ setRenderSize(): void {
    const pixelRange = this.pixelRange;
    this.renderer.setSize(pixelRange.x.delta, pixelRange.y.delta);
  }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  private render(): void {

    requestAnimationFrame(() => { this.render(); });

    if (!this.isInitialized)
      return;

    const controls = this.activeControls;
    let needsUpdate = true;
    if (controls) {
      const delta = this._clock.getDelta();
      needsUpdate = controls.update(delta);
    }
    if (this.isInvalidated || needsUpdate) {
      this.stats.begin();

      for (const view of this.viewsShownHere.list)
        view.beforeRender();

      this.renderer.render(this.scene, this.activeCamera);
      this.stats.end();

      const viewInfo = this.getViewInfo();

      this._overlay.render(this.renderer, viewInfo, this.pixelRange.delta);
      this.invalidate(false);
    }
  }

  //==================================================
  // STATIC METHODS
  //==================================================

  public updateLightPosition(): void {

    const camera = this.activeCamera
    if (!camera)
      return;

      const controls = this.activeControls
    if (!controls)
      return;

    const light = this.directionalLight
    if (!light)
      return;
      
    //The idea of this function is letting the light track the camera, 
    if (!camera || !controls || !light)
      return;

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

  static updateLightPositionStatic(node: ThreeRenderTargetNode): void {
    node.updateLightPosition();
  }
}
