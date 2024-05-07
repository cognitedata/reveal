/*!
 * Copyright 2024 Cognite AS
 */

/* eslint-disable @typescript-eslint/consistent-type-imports */

import {
  CustomObject,
  isFlexibleCameraManager,
  type Cognite3DViewer,
  type IFlexibleCameraManager
} from '@cognite/reveal';
import { AxisGizmoTool } from '@cognite/reveal/tools';
import { NavigationTool } from '../concreteCommands/NavigationTool';
import { Vector3, AmbientLight, DirectionalLight } from 'three';
import { ToolControllers } from './ToolController';
import { RootDomainObject } from '../domainObjects/RootDomainObject';

const DIRECTIONAL_LIGHT_NAME = 'DirectionalLight';

export class RevealRenderTarget {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _viewer: Cognite3DViewer;
  private readonly _toolController: ToolControllers;
  private readonly _rootDomainObject: RootDomainObject;
  private _axisGizmoTool: AxisGizmoTool | undefined;
  private _ambientLight: AmbientLight | undefined;
  private _directionalLight: DirectionalLight | undefined;

  // ==================================================
  // CONTRUCTORS
  // ==================================================

  constructor(viewer: Cognite3DViewer) {
    this._viewer = viewer;
    this._toolController = new ToolControllers(this.domElement);
    this._toolController.addEventListeners();
    this._rootDomainObject = new RootDomainObject();

    this.initializeLights();
    this._viewer.on('cameraChange', this.cameraChangeHandler);
  }

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get viewer(): Cognite3DViewer {
    return this._viewer;
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

    const navigationTool = new NavigationTool();
    navigationTool.attach(this);
    this.toolController.add(navigationTool);
    this.toolController.setActiveTool(navigationTool);
  }

  public dispose(): void {
    if (this._ambientLight !== undefined) {
      this._viewer.removeObject3D(this._ambientLight);
    }
    if (this._directionalLight !== undefined) {
      this._viewer.removeObject3D(this._directionalLight);
    }
    this.toolController.removeEventListeners();
    this.toolController.dispose();
    this._axisGizmoTool?.dispose();
  }

  public invalidate(): void {
    this._viewer.requestRedraw();
  }

  private initializeLights(): void {
    this._ambientLight = new AmbientLight(0xffffff, 0.25); // soft white light
    this._directionalLight = new DirectionalLight(0xffffff, 2);
    this._directionalLight.name = DIRECTIONAL_LIGHT_NAME;
    this._directionalLight.position.set(0, 1, 0);

    const ambientLight = new CustomObject(this._ambientLight);
    const directionalLight = new CustomObject(this._directionalLight);
    ambientLight.isPartOfBoundingBox = false;
    directionalLight.isPartOfBoundingBox = false;

    this.viewer.addCustomObject(ambientLight);
    this.viewer.addCustomObject(directionalLight);
  }

  // ==================================================
  // EVENT HANDLERS
  // ==================================================

  cameraChangeHandler = (_position: Vector3, _target: Vector3): void => {
    const light = this._directionalLight;
    if (light === undefined) {
      return;
    }
    const camera = this.viewer.cameraManager.getCamera();

    // Get camera direction
    const cameraDirection = new Vector3();
    camera.getWorldDirection(cameraDirection);

    cameraDirection.negate();
    light.position.copy(cameraDirection);
  };
}
