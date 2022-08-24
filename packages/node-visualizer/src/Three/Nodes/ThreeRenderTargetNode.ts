// =====================================================================================
// This code is part of the Reveal Viewer architecture, made by Nils Petter Fremming
// in October 2019. It is suited for flexible and customizable visualization of
// multiple dataset in multiple viewers.
//
// It is a C# to typescript port from the Modern Model architecture,
// based on the experience when building Petrel.
//
// NOTE: Always keep the code according to the code style already applied in the file.
// Put new code under the correct section, and make more sections if needed.
// Copyright (c) Cognite AS. All rights reserved.
// =====================================================================================

import CameraControls from 'camera-controls';
import * as THREE from 'three';

import { BaseCommand } from '../../Core/Commands/BaseCommand';
import { ThreeOverlay } from '../Utilities/ThreeOverlay';

import { Range3 } from '../../Core/Geometry/Range3';
import { IToolbar } from '../../Core/Interfaces/IToolbar';
import { BaseNode } from '../../Core/Nodes/BaseNode';
import { BaseRenderTargetNode } from '../../Core/Nodes/BaseRenderTargetNode';
import { AxisNode } from '../../Core/Nodes/Decorations/AxisNode';
import { Colors } from '../../Core/Primitives/Colors';
import { Ma } from '../../Core/Primitives/Ma';
import { BaseGroupThreeView } from '../BaseViews/BaseGroupThreeView';
import { BaseThreeView } from '../BaseViews/BaseThreeView';
import { CopyImageCommand } from '../Commands/CopyImageCommand';
import { Toggle3Dand2DCommand } from '../Commands/Toggle3Dand2DCommand';
import { ToggleAxisVisibleCommand } from '../Commands/ToggleAxisVisibleCommand';
import { ToggleBgColorCommand } from '../Commands/ToggleBgColorCommand';
import { ToggleCameraTypeCommand } from '../Commands/ToggleCameraTypeCommand';
import { ToggleCompassVisibleCommand } from '../Commands/ToggleCompassVisibleCommand';
import { ToggleFullscreenCommand } from '../Commands/ToggleFullscreenCommand';
import { BaseTool } from '../Commands/Tools/BaseTool';
import { EditTool } from '../Commands/Tools/EditTool';
import { MeasureDistanceTool } from '../Commands/Tools/MeasureDistanceTool';
import { NavigationTool } from '../Commands/Tools/NavigationTool';
import { ZoomToTargetTool } from '../Commands/Tools/ZoomToTargetTool';
import { ViewAllCommand } from '../Commands/ViewAllCommand';
import { ViewFromCommand } from '../Commands/ViewFromCommand';
import { ZScaleCommand } from '../Commands/ZScaleCommand';
import { CameraControl } from '../Nodes/CameraControl';
import { ToolbarGroupIds } from '../Nodes/ToolbarGroupIds';
import { ToolController } from '../Nodes/ToolController';
import { ThreeConverter } from '../Utilities/ThreeConverter';
import { ThreeMiniWindow } from '../Utilities/ThreeMiniWindow';
import { ThreeTransformer } from '../Utilities/ThreeTransformer';
import { ViewModeCommand } from '../Commands/ViewModeCommand';
import { ViewModes } from './ViewModes';

const directionalLightName = 'DirectionalLight';

export class ThreeRenderTargetNode extends BaseRenderTargetNode {
  // =================================================
  // STATIC FIELDS
  // =================================================

  static className = '..RenderTargetNode';

  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private _scene: THREE.Scene | null = null;

  private _renderer: THREE.WebGLRenderer | null = null;

  private _overlay = new ThreeOverlay();

  private _miniWindow = new ThreeMiniWindow();

  private isEmpty = true;

  private clock = new THREE.Clock();

  private _cameraControl: CameraControl | null = null;

  private _toolController = new ToolController();

  private _raycaster = new THREE.Raycaster();

  private _transformer = new ThreeTransformer();

  private _viewMode: ViewModes = ViewModes.Normal;

  // ==================================================
  // INSTANCE PROPERTIES: Tools
  // ==================================================

  public setPreviousTool() {
    this._toolController.setPreviousTool(this._cameraControl);
  }

  public set activeTool(tool: BaseTool | null) {
    this._toolController.setActiveTool(tool, this._cameraControl);
  }

  public get activeTool(): BaseTool | null {
    return this._toolController.activeTool;
  }

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get is2D(): boolean {
    return this.cameraControl.is2D;
  }

  public get camera(): THREE.PerspectiveCamera | THREE.OrthographicCamera {
    return this.cameraControl.camera;
  }

  private get controls(): CameraControls {
    return this.cameraControl.controls;
  }

  public get transformer(): ThreeTransformer {
    return this._transformer;
  }

  private get directionalLight(): THREE.DirectionalLight | null {
    return this.scene.getObjectByName(
      directionalLightName
    ) as THREE.DirectionalLight;
  }

  public get zScale(): number {
    return this._transformer.zScale;
  }

  public set zScale(value: number) {
    if (this._transformer.zScale <= 0)
      throw Error('ZScale cannot be less or equal 0');

    if (this._transformer.zScale === value) return;

    // Clear the views
    this._transformer.zScale = value;
    this.updateAllViews();
  }

  public get viewMode(): ViewModes {
    return this._viewMode;
  }

  public set viewMode(value: ViewModes) {
    if (this._viewMode === value) return;

    this._viewMode = value;
    this.updateAllViews();

    this.viewFrom(-1);
  }

  public get scene(): THREE.Scene {
    if (!this._scene) throw Error('Scene is not set');
    return this._scene;
  }

  public get miniWindowScene(): THREE.Scene {
    if (!this._miniWindow) throw Error('Mini window scene is not set');
    return this._miniWindow.scene;
  }

  public get cameraControl(): CameraControl {
    if (!this._cameraControl) throw Error('Camera is not set');
    return this._cameraControl;
  }

  private get renderer(): THREE.WebGLRenderer {
    if (!this._renderer) {
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        preserveDrawingBuffer: true,
      });
      renderer.autoClear = false;
      renderer.gammaFactor = 2.2;
      this._renderer = renderer;
    }
    return this._renderer;
  }

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(fractionRange: Range3 | undefined) {
    super(fractionRange);
  }

  // ==================================================
  // OVERRIDES of TargetNode
  // ==================================================

  public get /* override */ className(): string {
    return ThreeRenderTargetNode.className;
  }

  public /* override */ isA(className: string): boolean {
    return (
      className === ThreeRenderTargetNode.className || super.isA(className)
    );
  }

  // ==================================================
  // OVERRIDES of BaseNode
  // ==================================================

  protected /* override */ initializeCore(): void {
    super.initializeCore();

    this._scene = new THREE.Scene();
    this._cameraControl = new CameraControl(this, true);

    // Create lights
    {
      const ambientLight = new THREE.AmbientLight(0x404040, 0.25); // soft white light
      const directionalLight = new THREE.DirectionalLight(
        ThreeConverter.toThreeColor(Colors.white),
        0.95
      );
      directionalLight.name = directionalLightName;
      this._scene.add(ambientLight);
      this._scene.add(directionalLight);
    }
    this.domElement.tabIndex = 1; // Trick to let keydown works!
    this.addOrRemoveUpdateEvent(true);
    this.domElement.addEventListener(
      'click',
      (event) => this._toolController.onMouseClick(this, event),
      false
    );
    this.domElement.addEventListener(
      'mousedown',
      (event) => this._toolController.onMouseDown(this, event),
      false
    );
    this.domElement.addEventListener(
      'mouseup',
      (event) => this._toolController.onMouseUp(this, event),
      false
    );
    this.domElement.addEventListener(
      'mousemove',
      (event) => this._toolController.onMouseMove(this, event),
      false
    );
    this.domElement.addEventListener(
      'keydown',
      (event) => this._toolController.onKeyDown(this, event),
      false
    );
    this.render();
  }

  // ==================================================
  // OVERRIDES of BaseRenderTargetNode
  // ==================================================

  public get /* override */ domElement(): HTMLCanvasElement {
    return this.renderer.domElement;
  }

  public /* override */ onResize(): void {
    const { pixelRange } = this;
    this.renderer.setSize(pixelRange.x.delta, pixelRange.y.delta);
    if (this._cameraControl) this._cameraControl.onResize(this);
    this.invalidate();
    this._prevPixelRange = pixelRange;
  }

  public /* override */ viewAll(): boolean {
    const boundingBox = this.getBoundingBoxFromViews();
    this.transformer.transformRangeTo3D(boundingBox);
    return !this._cameraControl
      ? false
      : this._cameraControl.viewRange(boundingBox);
  }

  public /* override */ addTools(toolbar: IToolbar): void {
    const navigationTool = new NavigationTool(this);
    this.activeTool = navigationTool;

    this.addTool(toolbar, ToolbarGroupIds.Tools, navigationTool);
    this.addTool(toolbar, ToolbarGroupIds.Tools, new EditTool(this));
    // this.addTool(toolbar, ToolbarGroupIds.Tools, new ZoomTool(this)); TODO(PP-2548)
    this.addTool(toolbar, ToolbarGroupIds.Tools, new ZoomToTargetTool(this));
    this.addTool(toolbar, ToolbarGroupIds.Tools, new MeasureDistanceTool(this));

    this.addTool(toolbar, ToolbarGroupIds.Actions, new ViewAllCommand(this));
    this.addTool(
      toolbar,
      ToolbarGroupIds.Actions,
      new ToggleAxisVisibleCommand(this)
    );
    this.addTool(
      toolbar,
      ToolbarGroupIds.Actions,
      new ToggleCompassVisibleCommand(this)
    );
    this.addTool(toolbar, ToolbarGroupIds.Actions, new CopyImageCommand(this));
    this.addTool(
      toolbar,
      ToolbarGroupIds.Actions,
      new ToggleBgColorCommand(this)
    );
    this.addTool(
      toolbar,
      ToolbarGroupIds.Actions,
      new ToggleFullscreenCommand(this)
    );
    this.addTool(
      toolbar,
      ToolbarGroupIds.Actions,
      new Toggle3Dand2DCommand(this)
    );
    this.addTool(
      toolbar,
      ToolbarGroupIds.Actions,
      new ToggleCameraTypeCommand(this)
    );

    for (let viewFrom = 0; viewFrom < 6; viewFrom++)
      this.addTool(
        toolbar,
        ToolbarGroupIds.ViewFrom,
        new ViewFromCommand(this, viewFrom)
      );

    this.addTool(toolbar, ToolbarGroupIds.Settings, new ViewModeCommand(this));
    this.addTool(toolbar, ToolbarGroupIds.Settings, new ZScaleCommand(this));
  }

  // ==================================================
  // INSTANCE METHODS: Getters
  // ==================================================

  public getRayFromEvent(event: MouseEvent): THREE.Ray {
    const pixel = this.getMouseRelativePosition(event);
    // https://threejsfundamentals.org/threejs/lessons/threejs-picking.html
    this._raycaster.setFromCamera(pixel, this.camera);
    return this._raycaster.ray;
  }

  private getIntersections(pixel: THREE.Vector2): THREE.Intersection[] {
    // https://threejsfundamentals.org/threejs/lessons/threejs-picking.html
    this._raycaster.setFromCamera(pixel, this.camera);
    return this._raycaster.intersectObjects(this.scene.children, true);
  }

  public getClickPosition(event: MouseEvent): THREE.Vector3 | null {
    const [, intersection] = this.getViewByMouseEvent(event);
    return intersection ? intersection.point : null;
  }

  public getMouseRelativePosition(event: MouseEvent): THREE.Vector2 {
    const rect = this.domElement.getBoundingClientRect();
    let x = (event.clientX - rect.left) / rect.width;
    let y = (event.clientY - rect.top) / rect.height;
    x = +x * 2 - 1;
    y = -y * 2 + 1;
    return new THREE.Vector2(x, y);
  }

  private getViewByObject(object: THREE.Object3D): BaseThreeView | null {
    for (;;) {
      if (!object.visible) return null;

      // If the object is marked by noPicking, no picking should be done
      if (object.userData[BaseThreeView.noPicking]) return null;

      if (object.name) {
        for (const view of this.viewsShownHere.list) {
          if (!(view instanceof BaseThreeView)) continue;

          if (!view.shouldPick()) continue;

          const node = view.getNode();
          if (!node) continue;

          if (node.uniqueId.equalString(object.name)) return view;
        }
      }
      if (!object.parent) break;

      // eslint-disable-next-line no-param-reassign
      object = object.parent;
    }
    return null;
  }

  public getNodeByMouseEvent(
    event: MouseEvent
  ): [BaseNode | null, THREE.Intersection | null] {
    const [view, intersection] = this.getViewByMouseEvent(event);
    return view ? [view.getNode(), intersection] : [null, null];
  }

  public getViewByMouseEvent(
    event: MouseEvent
  ): [BaseThreeView | null, THREE.Intersection | null] {
    const pixel = this.getMouseRelativePosition(event);
    const intersections = this.getIntersections(pixel);
    for (const intersection of intersections) {
      const view = this.getViewByObject(intersection.object);
      if (view) return [view, intersection];
    }
    return [null, null];
  }

  // ==================================================
  // INSTANCE METHODS: Add toolbar
  // ==================================================

  public addTool(toolbar: IToolbar, groupId: string, command: BaseCommand) {
    if (command instanceof BaseTool) this._toolController.add(command);

    toolbar.add(groupId, command);
  }

  // ==================================================
  // INSTANCE METHODS: Operations on camera or light
  // ==================================================

  public updateLightPosition(): void {
    const { camera } = this;
    const { controls } = this;
    const light = this.directionalLight;
    if (!light) return;

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
    vectorToCenter.applyAxisAngle(horizontalAxis, -Ma.toRad(0)); // Dip angle

    vectorLength = Math.max(vectorLength, 100_000); // Move the light far away
    vectorToCenter.multiplyScalar(vectorLength);

    if (this.viewMode !== ViewModes.Overlay) {
      vectorToCenter.add(target);
    }

    light.position.copy(vectorToCenter);
  }

  // ==================================================
  // INSTANCE METHODS: Perspective mode
  // ==================================================

  public get isPerspectiveMode(): boolean {
    if (this.camera instanceof THREE.PerspectiveCamera) return true;
    return false;
  }

  public set isPerspectiveMode(isPerspectiveMode: boolean) {
    if (isPerspectiveMode === this.isPerspectiveMode) return;

    const { azimuthAngle } = this.cameraControl.controls;
    const { polarAngle } = this.cameraControl.controls;

    const is2D = this._cameraControl ? this._cameraControl.is2D : false;

    this.addOrRemoveUpdateEvent(false);
    this._cameraControl = new CameraControl(this, isPerspectiveMode);
    this.addOrRemoveUpdateEvent(true);

    this._cameraControl.is2D = is2D;
    this._cameraControl.setLeftButton(this.activeTool);

    const boundingBox = this.getBoundingBoxFromViews();
    this.transformer.transformRangeTo3D(boundingBox);
    const boundingBoxZRange = boundingBox.z.max - boundingBox.z.min;
    const pixelYRange = this.pixelRange.y.max - this.pixelRange.y.min;

    // Set camera status to match with previous selected camera
    if (!isPerspectiveMode)
      this.cameraControl.controls.zoomTo(pixelYRange / boundingBoxZRange);

    this._cameraControl.controls.rotateTo(azimuthAngle, polarAngle, false);
    this._cameraControl.viewRange(boundingBox);
  }

  // ==================================================
  // INSTANCE METHODS: Others
  // ==================================================

  public viewFrom(index: number): boolean {
    const boundingBox = this.getBoundingBoxFromViews();
    this.transformer.transformRangeTo3D(boundingBox);
    return !this._cameraControl
      ? false
      : this._cameraControl.viewFrom(boundingBox, index);
  }

  public updateAllViews(): void {
    for (const view of this.viewsShownHere.list) {
      if (!(view instanceof BaseGroupThreeView)) continue;
      view.touch();
    }
    this.invalidate();
  }

  private addOrRemoveUpdateEvent(add: boolean): void {
    if (add)
      this.controls.addEventListener('update', () =>
        this.updateLightPosition()
      );
    else
      this.controls.removeEventListener('update', () =>
        this.updateLightPosition()
      );
  }

  private updateNearAndFarPlane(): void {
    if (!this.isInitialized) return;

    const { camera } = this;
    const boundingBox = this.getBoundingBoxFromViews();
    if (!boundingBox || boundingBox.isEmpty) return;

    this.transformer.transformRangeTo3D(boundingBox);

    const { diagonal } = boundingBox;
    const near = 0.001 * diagonal;
    const far = 2 * diagonal + this.cameraControl.distance;
    if (
      !Ma.isAbsEqual(camera.near, near, 0.1 * near) ||
      !Ma.isAbsEqual(camera.far, far, 0.1 * far)
    ) {
      camera.near = near;
      camera.far = far;
      camera.updateProjectionMatrix();
    }
  }

  // ==================================================
  // INSTANCE METHODS: Render
  // ==================================================

  private _prevPixelRange: Range3 = new Range3();

  public render(): void {
    requestAnimationFrame(() => {
      this.render();
    });

    if (!this.isInitialized) return;

    if (!this.pixelRange.isEqual(this._prevPixelRange)) this.onResize();

    const { controls } = this;
    let needsUpdate = true;
    if (controls) {
      const delta = this.clock.getDelta();
      needsUpdate = controls.update(delta);
    }
    if (!this.isInvalidated && !needsUpdate) return;

    this.updateNearAndFarPlane();

    if (this.isEmpty) this.isEmpty = !this.viewFrom(-1);

    const hasAxis = this.hasViewOfNodeType(AxisNode);
    const background = ThreeConverter.toThreeColor(this.getBgColor(hasAxis));
    this.scene.background = background;

    for (const view of this.viewsShownHere.list) view.beforeRender();

    this.renderFast();
    this.invalidate(false);
  }

  public renderFast(): void {
    this.renderer.render(this.scene, this.camera);
    this._miniWindow.render(this.renderer);
    const viewInfo = this.fillViewInfo();
    this._overlay.render(
      this.renderer,
      viewInfo,
      this.pixelRange.delta,
      this.fgColor,
      this.bgColor
    );
  }
}
