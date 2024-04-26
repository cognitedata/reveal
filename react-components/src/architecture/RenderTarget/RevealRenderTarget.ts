/*!
 * Copyright 2024 Cognite AS
 */

import {
  isFlexibleCameraManager,
  type Cognite3DViewer,
  type IFlexibleCameraManager
} from '@cognite/reveal';
import { AxisGizmoTool } from '@cognite/reveal/tools';
import { NavigationTool } from '../concreteTools/NavigationTool';
import { type Object3D, Group, Vector3, AmbientLight, DirectionalLight } from 'three';
import { ToolControllers } from './ToolController';
import { RootDomainObject } from '../domainObjects/RootDomainObject';
import { Range3 } from '../utilities/geometry/Range3';
import { createFractalRegularGrid2 } from '../utilities/geometry/createFractalRegularGrid2';
import { SurfaceDomainObject } from '../surfaceDomainObject/SurfaceDomainObject';

const DIRECTIONAL_LIGHT_NAME = 'DirectionalLight';

export class RevealRenderTarget {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _viewer: Cognite3DViewer;
  private readonly _toolController: ToolControllers;
  private _axisGizmoTool: AxisGizmoTool | undefined;
  protected readonly _rootObject3D: Object3D;

  // ==================================================
  // CONTRUCTORS
  // ==================================================

  constructor(viewer: Cognite3DViewer) {
    this._viewer = viewer;
    this._toolController = new ToolControllers(this.domElement);
    this._toolController.addEventListeners();

    this._rootObject3D = this.createRootGroup();
    this._viewer.addObject3D(this._rootObject3D);

    this._viewer.on('cameraChange', this.updateLightPosition);
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

  public test(): void {
    const root = RootDomainObject.active;
    const surfaceDomainObject = new SurfaceDomainObject();
    root.addChildInteractive(surfaceDomainObject);

    const range = new Range3(new Vector3(0, 0, 0), new Vector3(1000, 1000, 200));
    surfaceDomainObject.surface = createFractalRegularGrid2(range, 8, 0.7, 3);

    surfaceDomainObject.setVisibleInteractive(true, this);
  }

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
