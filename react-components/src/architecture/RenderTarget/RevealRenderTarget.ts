/*!
 * Copyright 2024 Cognite AS
 */

import {
  type Cognite3DViewer,
  type IFlexibleCameraManager,
  isFlexibleCameraManager
} from '@cognite/reveal';
import { ToolController } from './ToolController';
import { AxisGizmoTool } from '@cognite/reveal/tools';
import { NavigationTool } from '../ConcreteTools/NavigationTool';
import { type Object3D, Group } from 'three';

export class RevealRenderTarget {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _viewer: Cognite3DViewer;
  private readonly _toolController: ToolController;
  private _axisGizmoTool: AxisGizmoTool | undefined;
  protected readonly _rootObject3D: Object3D;

  // ==================================================
  // CONTRUCTORS
  // ==================================================

  constructor(viewer: Cognite3DViewer) {
    this._viewer = viewer;
    this._toolController = new ToolController(this.domElement);
    this._toolController.addEventListeners();

    this._rootObject3D = new Group();
    this._rootObject3D.visible = true;
    this._viewer.addObject3D(this._rootObject3D);
  }

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get viewer(): Cognite3DViewer {
    return this._viewer;
  }

  public get rootObject3D(): Object3D {
    return this._rootObject3D;
  }

  public get canvas(): HTMLCanvasElement {
    return this._viewer.canvas;
  }

  public get domElement(): HTMLElement {
    return this._viewer.domElement;
  }

  public get toolController(): ToolController {
    return this._toolController;
  }

  public get cameraManager(): IFlexibleCameraManager {
    const cameraManager = isFlexibleCameraManager(this.viewer.cameraManager);
    if (!isFlexibleCameraManager(cameraManager)) {
      throw new Error('Camera manager is not flexible');
    }
    return cameraManager;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public initialize(): void {
    this._axisGizmoTool = new AxisGizmoTool();
    this._axisGizmoTool.connect(this._viewer);

    const navigationTool = new NavigationTool(this);
    this.toolController.add(navigationTool);
    this.toolController.setActiveTool(navigationTool);
  }

  public dispose(): void {
    this._viewer.removeObject3D(this._rootObject3D);
    this.toolController.removeEventListeners();
    this._axisGizmoTool?.dispose();
  }

  public invalidate(): void {
    this._viewer.requestRedraw();
  }
}
