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
import { ViewAllCommand } from "@/Three/Commands/ViewAllCommand";
import { ToggleAxisVisibleCommand } from "@/Three/Commands/ToggleAxisVisibleCommand";
import { ToggleBgColorCommand } from "@/Three/Commands/ToggleBgColorCommand";
import { IToolbar } from "@/Core/Interfaces/IToolbar";
import { ViewFromCommand } from "@/Three/Commands/ViewFromCommand";
import { PerspectiveCamera } from "three";
import { SingleEntryPlugin } from "webpack";

export class ThreeRenderTargetNode extends BaseRenderTargetNode {
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private _scene: THREE.Scene | null = null;
  private _renderer: THREE.WebGLRenderer | null = null;
  private _overlay = new TreeOverlay();
  private _stats: any | null; // NILS: Why any here? Compiler error if not
  private isEmpty = true;
  private clock = new THREE.Clock();

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

  public get controls(): CameraControls | null {
    const cameraNode = this.activeCameraNode;
    return cameraNode ? cameraNode.controls : null;
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

    // Add light (TODO: move to TreeLightNode?)
    const scene = this.scene;
    const light = new THREE.DirectionalLight(ThreeConverter.toColor(Colors.white), 0.75);
    light.name = "DirectionalLight";

    scene.add(light);
    //camera.add(light);
    //scene.add(camera);

    const controls = this.controls;
    if (controls)
      controls.addEventListener("update", lightUpdate);

    var self = this;
    function lightUpdate() {
      ThreeRenderTargetNode.updateLightPositionStatic(self);
    }
    var ambientLight = new THREE.AmbientLight(0x404040, 0.25); // soft white light
    scene.add(ambientLight);
    //this.updateLightPosition();
  }

  //==================================================
  // OVERRIDES of RenderTargetNode
  //==================================================

  public /*override*/ viewRange(boundingBox: Range3 | undefined): void {
    if (!boundingBox)
      return;

    if (boundingBox.isEmpty)
      return;

    const controls = this.controls;
    if (!controls)
      return;


    //https://github.com/yomotsu/camera-controls
    // The below stuff doesn't work!!
    // controls.rotate(0, 0.8);
    const target = boundingBox.center;
    controls.setTarget(target.x, target.y, target.z);
    controls.fitTo(ThreeConverter.toBox(boundingBox));
  }

  public /*override*/ get domElement(): HTMLElement { return this.renderer.domElement; }

  protected /*override*/ setRenderSize(): void {
    const pixelRange = this.pixelRange;
    this.renderer.setSize(pixelRange.x.delta, pixelRange.y.delta);
  }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  public addTools(toolbar: IToolbar) {
    toolbar.add(new ViewAllCommand(this));
    toolbar.add(new ToggleAxisVisibleCommand(this));
    toolbar.add(new ToggleBgColorCommand(this));

    toolbar.beginOptionMenu();
    for (let viewFrom = 0; viewFrom < 6; viewFrom++)
      toolbar.add(new ViewFromCommand(this, viewFrom));
    toolbar.beginOptionMenu();
  }

  public viewFrom(index: number): boolean {

    const controls = this.controls;
    if (!controls)
      return false;

    const camera = this.activeCamera;
    if (!camera)
      return false;

    const boundingBox = this.getBoundingBoxFromViews();

    let distanceFactor = 1;
    if (camera instanceof PerspectiveCamera) {
      const perspectiveCamera = camera as PerspectiveCamera;
      
      const fov = Ma.toRad(perspectiveCamera.fov);
      distanceFactor = 0.66 / (camera.aspect * Math.tan(fov / 2));
      console.log(fov);
      console.log(distanceFactor);
    }
    const target = boundingBox.center;
    const position = boundingBox.center;

    // https://www.npmjs.com/package/camera-controls
    if (index < 0) {
      distanceFactor /= 2;
      const distanceX = Math.max(boundingBox.y.delta, boundingBox.z.delta) * distanceFactor * Math.sin(Math.PI / 4);
      const distanceY = Math.max(boundingBox.x.delta, boundingBox.z.delta) * distanceFactor * Math.sin(Math.PI / 4);
      const distanceZ = Math.max(boundingBox.x.delta, boundingBox.y.delta) * distanceFactor * Math.sin(Math.PI / 8);
      position.x = boundingBox.max.x + distanceX;
      position.y = boundingBox.max.y + distanceY;
      position.z = boundingBox.max.z + distanceZ;
    }
    else if (index === 0 || index === 1) {
      const distance = Math.max(boundingBox.x.delta, boundingBox.y.delta) * distanceFactor;
      if (index === 0) {
        // Top
        controls.rotateTo(0, Math.PI / 2, false)
        position.z = boundingBox.max.z + distance;
      }
      if (index === 1) {
        //Bottom
        controls.rotateTo(Math.PI, Math.PI / 2, false)
        position.z = boundingBox.min.z - distance;
      }
    }
    else if (index === 2 || index === 3) {
      const distance = Math.max(boundingBox.x.delta, boundingBox.z.delta) * distanceFactor;
      if (index === 2) {
        //South
        controls.rotateTo(Math.PI / 2, 0, false)
        position.y = boundingBox.min.y - distance;
      }
      else {
        //North
        controls.rotateTo(-Math.PI / 2, 0, false)
        position.y = boundingBox.max.y + distance;
      }
    }
    else if (index === 4 || index === 5) {
      const distance = Math.max(boundingBox.y.delta, boundingBox.z.delta) * distanceFactor;
      if (index === 4) {
        //West
        controls.rotateTo(0, 0, false)
        position.x = boundingBox.min.x - distance;
      }
      else {
        //East
        controls.rotateTo(Math.PI, 0, false)
        position.x = boundingBox.max.x + distance;
      }
    }
    controls.setTarget(target.x, target.y, target.z);
    controls.setPosition(position.x, position.y, position.z);
    this.updateLightPosition();
    return true;
  }


  private render(): void {

    requestAnimationFrame(() => { this.render(); });

    if (!this.isInitialized)
      return;

    const controls = this.controls;
    let needsUpdate = true;
    if (controls) {
      const delta = this.clock.getDelta();
      needsUpdate = controls.update(delta);
    }
    if (this.isInvalidated || needsUpdate) {

      if (this.isEmpty) {
        const boundingBox = this.getBoundingBoxFromViews();
        if (!boundingBox.isEmpty) {
          this.viewFrom(-1);
          this.isEmpty = false;
        }
      }
      this.stats.begin();

      const hasAxis = this.hasViewOfNodeType(AxisNode);
      this.scene.background = ThreeConverter.toColor(this.getBgColor(hasAxis));

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

    const controls = this.controls
    if (!controls)
      return;

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

  static updateLightPositionStatic(node: ThreeRenderTargetNode): void {
    node.updateLightPosition();
  }
}
