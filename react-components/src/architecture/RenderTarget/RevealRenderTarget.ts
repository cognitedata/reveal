/*!
 * Copyright 2024 Cognite AS
 */

import {
  type Cognite3DViewer
  // type IFlexibleCameraManager,
  // asFlexibleCameraManager
} from '@cognite/reveal';
// import { ToolController } from './ToolController';
import { AxisGizmoTool } from '@cognite/reveal/tools';
// import { NavigationTool } from '../ConcreteTools/NavigationTool';

// Note: ToolController will be added later
export class RevealRenderTarget {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _viewer: Cognite3DViewer;
  // private readonly _toolController: ToolController;
  private _axisGizmoTool: AxisGizmoTool | undefined;

  // ==================================================
  // CONTRUCTORS
  // ==================================================

  constructor(viewer: Cognite3DViewer) {
    this._viewer = viewer;
    // this._toolController = new ToolController(this.domElement);
    // this._toolController.addEventListeners();
  }

  public initialize(): void {
    this._axisGizmoTool = new AxisGizmoTool();
    this._axisGizmoTool.connect(this._viewer);

    // const navigationTool = new NavigationTool(this);
    // this.toolController.add(navigationTool);
    // this.toolController.setActiveTool(navigationTool);
  }

  public dispose(): void {
    // this.toolController.removeEventListeners();
    this._axisGizmoTool?.dispose();
  }

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get /* override */ viewer(): Cognite3DViewer {
    return this._viewer;
  }

  public get /* override */ canvas(): HTMLCanvasElement {
    return this._viewer.canvas;
  }

  public get /* override */ domElement(): HTMLElement {
    return this._viewer.domElement;
  }

  // public get toolController(): ToolController {
  //   return this._toolController;
  // }

  // public get cameraManager(): IFlexibleCameraManager {
  //   const cameraManager = asFlexibleCameraManager(this.viewer.cameraManager);
  //   if (cameraManager === undefined) {
  //     throw new Error('Camera manager is not flexible');
  //   }
  //   return cameraManager;
  // }
}
