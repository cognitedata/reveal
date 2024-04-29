/*!
 * Copyright 2024 Cognite AS
 */

/* eslint-disable @typescript-eslint/consistent-type-imports */

import {
  isFlexibleCameraManager,
  type Cognite3DViewer,
  type IFlexibleCameraManager
} from '@cognite/reveal';
import { AxisGizmoTool } from '@cognite/reveal/tools';
import { NavigationTool } from '../concreteTools/NavigationTool';
import {
  type Object3D,
  Group,
  Vector3,
  AmbientLight,
  DirectionalLight,
  WebGLRenderer,
  PerspectiveCamera
} from 'three';
import { ToolControllers } from './ToolController';
import { RootDomainObject } from '../domainObjects/RootDomainObject';
import { CommandController } from './CommandController';
import { VisualDomainObject } from '../domainObjects/VisualDomainObject';

const DIRECTIONAL_LIGHT_NAME = 'DirectionalLight';

export class RevealRenderTarget {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _viewer: Cognite3DViewer;
  private readonly _toolController: ToolControllers;
  private readonly _commandController: CommandController;
  private readonly _rootObject3D: Object3D;
  private readonly _rootDomainObject: RootDomainObject;
  private _axisGizmoTool: AxisGizmoTool | undefined;

  // ==================================================
  // CONTRUCTORS
  // ==================================================

  constructor(viewer: Cognite3DViewer) {
    this._viewer = viewer;
    this._toolController = new ToolControllers(this.domElement);
    this._toolController.addEventListeners();
    this._commandController = new CommandController();

    this._rootObject3D = this.createRootGroup();
    this._viewer.addObject3D(this._rootObject3D);

    this._viewer.on('cameraChange', this.updateLightPosition);
    this._viewer.on('beforeSceneRendered', this.beforeSceneRenderedDelegate);

    this._rootDomainObject = new RootDomainObject();
  }

  beforeSceneRenderedDelegate = (event: {
    frameNumber: number;
    renderer: WebGLRenderer;
    camera: PerspectiveCamera;
  }): void => {
    for (const domainObject of this._rootDomainObject.getDescendantsByType(VisualDomainObject)) {
      for (const view of domainObject.views) {
        view.beforeRender();
      }
    }
  };

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get viewer(): Cognite3DViewer {
    return this._viewer;
  }

  public get rootObject3D(): Object3D {
    return this._rootObject3D;
  }

  public get rootDomainObject(): RootDomainObject {
    return this._rootDomainObject;
  }

  public get canvas(): HTMLCanvasElement {
    return this._viewer.canvas;
  }

  public get domElement(): HTMLElement {
    return this._viewer.domElement;
  }

  public get toolController(): ToolControllers {
    return this._toolController;
  }

  public get commandController(): CommandController {
    return this._commandController;
  }

  public get cameraManager(): IFlexibleCameraManager {
    const cameraManager = this.viewer.cameraManager;
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

  public updateToolsAndCommands(): void {
    this._toolController.update();
    this._commandController.update();
  }

  public test(): void {}

  private createRootGroup(): Group {
    const group = new Group();
    const ambientLight = new AmbientLight(0xffffff, 0.25); // soft white light
    const directionalLight = new DirectionalLight(0xffffff, 2.5);
    directionalLight.name = DIRECTIONAL_LIGHT_NAME;
    directionalLight.position.set(0, 1, 0);
    group.add(ambientLight);
    group.add(directionalLight);
    return group;
  }

  private get directionalLight(): DirectionalLight | undefined {
    return this._rootObject3D.getObjectByName(DIRECTIONAL_LIGHT_NAME) as DirectionalLight;
  }

  updateLightPosition = (_position: Vector3, _target: Vector3): void => {
    const light = this.directionalLight;
    if (light === undefined) {
      return;
    }
    const camera = this.viewer.cameraManager.getCamera();

    // Get camera direction
    const cameraDirection = new Vector3();
    camera.getWorldDirection(cameraDirection);

    light.position.copy(cameraDirection);
  };
}
