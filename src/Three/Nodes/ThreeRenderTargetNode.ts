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
import { Range3 } from "@/Core/Geometry/Range3";
import { Colors } from "@/Core/Primitives/Colors";
import { BaseRenderTargetNode } from "@/Core/Nodes/BaseRenderTargetNode";
import { AxisNode } from "@/Core/Nodes/Decorations/AxisNode";
import { ThreeConverter } from "@/Three/Utilities/ThreeConverter";
import { TreeOverlay } from "@/Three/Utilities/TreeOverlay";
import { Ma } from "@/Core/Primitives/Ma";
import { ViewAllCommand } from "@/Three/Commands/ViewAllCommand";
import { ToggleAxisVisibleCommand } from "@/Three/Commands/ToggleAxisVisibleCommand";
import { ToggleBgColorCommand } from "@/Three/Commands/ToggleBgColorCommand";
import { IToolbar } from "@/Core/Interfaces/IToolbar";
import { ViewFromCommand } from "@/Three/Commands/ViewFromCommand";
import { CameraControl } from "@/Three/Nodes/CameraControl";
import { ToggleCameraTypeCommand } from "@/Three/Commands/ToggleCameraTypeCommand";
import { CopyImageCommand } from "@/Three/Commands/CopyImageCommand";
import { MeasureDistanceTool } from "@/Three/Commands/Tools/MeasureDistanceTool";
import { ToggleFullscreenCommand } from "@/Three/Commands/ToggleFullscreenCommand";
import { PanToolCommand } from "@/Three/Commands/Tools/PanToolCommand";
import { SelectCommand } from "@/Three/Commands/Tools/SelectCommand";
import { ZoomToolCommand } from "@/Three/Commands/Tools/ZoomToolCommand";
import { ZoomToTargetToolCommand } from "@/Three/Commands/Tools/ZoomToTargetToolCommand";
import { ToolCommand } from "@/Three/Commands/Tools/ToolCommand";
import { ToolController } from "@/Three/Nodes/ToolController";
import { BaseNode } from "@/Core/Nodes/BaseNode";
import { BaseThreeView } from "@/Three/BaseViews/BaseThreeView";
import { ThreeTransformer } from "@/Three/Utilities/ThreeTransformer";
import { ZScaleCommand } from "@/Three/Commands/ZScaleCommand";
import { BaseGroupThreeView } from "@/Three/BaseViews/BaseGroupThreeView";
import { Vector3 } from '@/Core/Geometry/Vector3';
import { PlaneToolCommand } from '@/Three/Commands/Tools/PlaneToolCommand';

const DirectionalLightName = "DirectionalLight";

export class ThreeRenderTargetNode extends BaseRenderTargetNode
{
  //==================================================
  // STATIC FIELDS
  //==================================================

  static className = "ThreeRenderTargetNode";

  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private _scene: THREE.Scene | null = null;
  private _renderer: THREE.WebGLRenderer | null = null;
  private _overlay = new TreeOverlay();
  private isEmpty = true;
  private clock = new THREE.Clock();
  private _cameraControl: CameraControl | null = null;
  private _toolController = new ToolController();
  private _raycaster = new THREE.Raycaster();
  private _transformer = new ThreeTransformer();

  //==================================================
  // INSTANCE PROPERTIES: Tools
  //==================================================

  public setDefaultTool(tool: ToolCommand | null = null) { this._toolController.setDefaultTool(tool, this._cameraControl); }

  public set activeTool(tool: ToolCommand | null) { this._toolController.setActiveTool(tool, this._cameraControl); }
  public get activeTool(): ToolCommand | null { return this._toolController._activeTool; }

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get camera(): THREE.PerspectiveCamera | THREE.OrthographicCamera { return this.cameraControl.camera; }
  private get controls(): CameraControls { return this.cameraControl.controls; }
  public get transformer(): ThreeTransformer { return this._transformer; }
  private get directionalLight(): THREE.DirectionalLight | null { return this.scene.getObjectByName(DirectionalLightName) as THREE.DirectionalLight; }
  public get zScale(): number { return this._transformer.zScale; }

  public set zScale(value: number)
  {
    if (this._transformer.zScale <= 0)
      throw Error("ZScale cannot be less or equal 0");

    if (this._transformer.zScale === value)
      return;

    // Clear the views
    this._transformer.zScale = value;
    for (const view of this.viewsShownHere.list)
    {
      if (!(view instanceof BaseGroupThreeView))
        continue;
      view.touch();
    }
    this.invalidate();
  }

  public get scene(): THREE.Scene
  {
    if (!this._scene)
      throw Error("Scene is not set");
    return this._scene;
  }

  public get cameraControl(): CameraControl
  {
    if (!this._cameraControl)
      throw Error("Camera is not set");
    return this._cameraControl;
  }

  private get renderer(): THREE.WebGLRenderer
  {
    if (!this._renderer)
    {
      const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
      renderer.autoClear = false;
      renderer.gammaFactor = 2.2;
      this._renderer = renderer;
    }
    return this._renderer;
  }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(fractionRange: Range3 | undefined) { super(fractionRange); }

  //==================================================
  // OVERRIDES of TargetNode
  //==================================================

  public /*override*/ get className(): string { return ThreeRenderTargetNode.className; }

  public /*override*/ isA(className: string): boolean { return className === ThreeRenderTargetNode.className || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ initializeCore(): void
  {
    super.initializeCore();

    this._scene = new THREE.Scene();
    this._cameraControl = new CameraControl(this, true);

    // Create lights
    const ambientLight = new THREE.AmbientLight(0x404040, 0.25); // soft white light
    const directionalLight = new THREE.DirectionalLight(ThreeConverter.toThreeColor(Colors.white), 0.95);
    directionalLight.name = DirectionalLightName;
    this._scene.add(ambientLight);
    this._scene.add(directionalLight);

    this.controls.addEventListener("update", () => this.updateLightPosition());
    this.domElement.addEventListener('click', (event) => this._toolController.onMouseClick(this, event), false);
    this.domElement.addEventListener('mousedown', (event) => this._toolController.onMouseDown(this, event), false);
    this.domElement.addEventListener('mouseup', (event) => this._toolController.onMouseUp(this, event), false);
    this.domElement.addEventListener('mousemove', (event) => this._toolController.onMouseMove(this, event), false);
    //dblclick
    this.render();
  }

  //==================================================
  // OVERRIDES of RenderTargetNode
  //==================================================

  public /*override*/ get domElement(): HTMLCanvasElement { return this.renderer.domElement; }

  public /*override*/ onResize(): void
  {
    const {pixelRange} = this;
    this.renderer.setSize(pixelRange.x.delta, pixelRange.y.delta);
    if (this._cameraControl)
      this._cameraControl.onResize(this.aspectRatio);
    this.invalidate();
    this._prevPixelRange = pixelRange;
  }

  public /*override*/ viewAll(): boolean
  {
    const boundingBox = this.getBoundingBoxFromViews();
    this.transformer.transformRangeTo3D(boundingBox);
    return !this._cameraControl ? false : this._cameraControl.viewRange(boundingBox);
  }

  private updateNearAndFarPlane(): void
  {
    if (!this.isInitialized)
      return;

    const {camera} = this;
    const boundingBox = this.getBoundingBoxFromViews();
    if (!boundingBox || boundingBox.isEmpty)
      return;

    this.transformer.transformRangeTo3D(boundingBox);

    const {diagonal} = boundingBox;
    const near = 0.001 * diagonal;
    const far = 2 * diagonal + this.cameraControl.distance;
    if (!Ma.isAbsEqual(camera.near, near, 0.1 * near) || !Ma.isAbsEqual(camera.far, far, 0.1 * far))
    {
      camera.near = near;
      camera.far = far;
      camera.updateProjectionMatrix();
    }
  }

  //==================================================
  // INSTANCE METHODS: Render
  //==================================================

  private _prevPixelRange: Range3 = new Range3();

  private render(): void
  {
    requestAnimationFrame(() => { this.render(); });

    if (!this.isInitialized)
      return;

    if (!this.pixelRange.isEqual(this._prevPixelRange))
      this.onResize();

    const {controls} = this;
    let needsUpdate = true;
    if (controls)
    {
      const delta = this.clock.getDelta();
      needsUpdate = controls.update(delta);
    }
    if (!this.isInvalidated && !needsUpdate)
      return;

    this.updateNearAndFarPlane();

    if (this.isEmpty)
      this.isEmpty = !this.viewFrom(-1);

    const hasAxis = this.hasViewOfNodeType(AxisNode);
    this.scene.background = ThreeConverter.toThreeColor(this.getBgColor(hasAxis));

    for (const view of this.viewsShownHere.list)
      view.beforeRender();

    this.renderer.render(this.scene, this.camera);

    const viewInfo = this.fillViewInfo();
    this._overlay.render(this.renderer, viewInfo, this.pixelRange.delta, this.fgColor, this.bgColor);
    this.invalidate(false);
  }

  //==================================================
  // INSTANCE METHODS: Add toolbar
  //==================================================

  public addTools(toolbar: IToolbar)
  {
    const panTool = new PanToolCommand(this);
    this.setDefaultTool(panTool);

    // Tools
    toolbar.add(new ToggleFullscreenCommand(this));
    toolbar.add(panTool);
    toolbar.add(new SelectCommand(this));
    toolbar.add(new PlaneToolCommand(this));
    toolbar.add(new ZoomToolCommand(this));
    toolbar.add(new ZoomToTargetToolCommand(this));
    toolbar.add(new MeasureDistanceTool(this));

    // Views
    toolbar.add(new ViewAllCommand(this));
    toolbar.add(new ToggleAxisVisibleCommand(this));
    toolbar.add(new ToggleBgColorCommand(this));
    toolbar.add(new ToggleCameraTypeCommand(this));
    toolbar.add(new CopyImageCommand(this));

    toolbar.beginOptionMenu();
    for (let viewFrom = 0; viewFrom < 6; viewFrom++)
      toolbar.add(new ViewFromCommand(this, viewFrom));
    toolbar.beginOptionMenu();

    toolbar.add(new ZScaleCommand(this));
  }

  //==================================================
  // INSTANCE METHODS: Operations on camera or light
  //==================================================

  public viewFrom(index: number): boolean
  {
    const boundingBox = this.getBoundingBoxFromViews();
    this.transformer.transformRangeTo3D(boundingBox);
    return !this._cameraControl ? false : this._cameraControl.viewFrom(boundingBox, index);
  }

  public switchCamera(isPerspectiveMode: boolean)
  {
    const {azimuthAngle} = this.cameraControl.controls;
    const {polarAngle} = this.cameraControl.controls;

    this._cameraControl = new CameraControl(this, isPerspectiveMode);

    const boundingBox = this.getBoundingBoxFromViews();
    this.transformer.transformRangeTo3D(boundingBox);
    const boundingBoxZRange = boundingBox.z.max - boundingBox.z.min;
    const pixelYRange = this.pixelRange.y.max - this.pixelRange.y.min;

    // Set camera status to match with previous selected camera
    if(!isPerspectiveMode)
      this.cameraControl.controls.zoomTo(pixelYRange / boundingBoxZRange);
    
    this._cameraControl.controls.rotateTo(azimuthAngle, polarAngle, false);
    this._cameraControl.viewRange(boundingBox);
  }

  private updateLightPosition(): void
  {
    const {camera} = this;
    const {controls} = this;
    const light = this.directionalLight;
    if (!light)
      return;

    // The idea of this function is letting the light track the camera,
    let position = new THREE.Vector3();
    let target = new THREE.Vector3();
    position = controls.getPosition(position);
    target = controls.getTarget(target);

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
    vectorToCenter.applyAxisAngle(horizontalAxis, -Ma.toRad(0)); //Dip angle

    vectorLength = Math.max(vectorLength, 100_000); // Move the light far away
    vectorToCenter.multiplyScalar(vectorLength);
    vectorToCenter.add(target);

    light.position.copy(vectorToCenter);
  }

  //==================================================
  // INSTANCE METHODS: Getters
  //==================================================

  public getRay(pixel: THREE.Vector2): THREE.Ray | null
  {
    //https://threejsfundamentals.org/threejs/lessons/threejs-picking.html
    this._raycaster.setFromCamera(pixel, this.camera);
    return this._raycaster.ray;
  }

  public getIntersection(pixel: THREE.Vector2): THREE.Intersection | null
  {
    //https://threejsfundamentals.org/threejs/lessons/threejs-picking.html
    this._raycaster.setFromCamera(pixel, this.camera);

    const intersects = this._raycaster.intersectObjects(this.scene.children, true);

    if (intersects.length > 0)
      return intersects[0];
    return null;
  }

  public getClickPosition(pixelCoords: THREE.Vector2): THREE.Vector3 | null
  {
    const intersection = this.getIntersection(pixelCoords);
    return intersection ? intersection.point : null;
  }

  public getMouseRelativePositionThree(event: MouseEvent): THREE.Vector2
  {
    const rect = this.domElement.getBoundingClientRect();
    let x = (event.clientX - rect.left) / rect.width;
    let y = (event.clientY - rect.top) / rect.height;
    x = +x * 2 - 1;
    y = -y * 2 + 1;
    return new THREE.Vector2(x, y);
  }

  public getMouseRelativePosition(event: MouseEvent): Vector3
  {
    const rect = this.domElement.getBoundingClientRect();
    let x = (event.clientX - rect.left) / rect.width;
    let y = (event.clientY - rect.top) / rect.height;
    x = +x * 2 - 1;
    y = -y * 2 + 1;
    return new Vector3(x, y, 0);
  }

  public getViewByObject(object: THREE.Object3D): BaseThreeView | null
  {
    while (true)
    {
      // If the object is marked by noPicking, no picking should be done
      if (object.userData[BaseThreeView.noPicking])
        return null;

      if (object.name)
      {
        for (const view of this.viewsShownHere.list)
        {
          if (!(view instanceof BaseThreeView))
            continue;

          if (!view.shouldPick())
            continue;

          const node = view.getNode();
          if (!node)
            continue;

          if (node.uniqueId.equalString(object.name))
            return view;
        }
      }
      if (!object.parent)
        break;

      object = object.parent;
    }
    return null;
  }

  public getNodeByObject(object: THREE.Object3D): BaseNode | null
  {
    const view = this.getViewByObject(object);
    return view ? view.getNode() : null;
  }
}
