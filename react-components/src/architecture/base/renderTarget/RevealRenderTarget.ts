/*!
 * Copyright 2024 Cognite AS
 */

import {
  type CameraManager,
  CustomObject,
  isFlexibleCameraManager,
  type Cognite3DViewer,
  type IFlexibleCameraManager
} from '@cognite/reveal';
import { AxisGizmoTool } from '@cognite/reveal/tools';
import { NavigationTool } from '../commands/NavigationTool';
import {
  Vector3,
  AmbientLight,
  DirectionalLight,
  type PerspectiveCamera,
  type Box3,
  type WebGLRenderer
} from 'three';
import { ToolControllers } from './ToolController';
import { RootDomainObject } from '../domainObjects/RootDomainObject';
import { getOctDir } from '../utilities/extensions/vectorExtensions';
import { getResizeCursor } from '../utilities/geometry/getResizeCursor';
import { VisualDomainObject } from '../domainObjects/VisualDomainObject';
import { ThreeView } from '../views/ThreeView';

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

    const cameraManager = this.cameraManager;
    if (!isFlexibleCameraManager(cameraManager)) {
      throw new Error('Can not use RevealRenderTarget without the FlexibleCameraManager');
    }
    this._toolController = new ToolControllers(this.domElement);
    this._toolController.addEventListeners();
    this._rootDomainObject = new RootDomainObject();

    this.initializeLights();
    this._viewer.on('cameraChange', this.cameraChangeHandler);
    this._viewer.on('beforeSceneRendered', this.beforeSceneRenderedHandler);
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

  public get cursor(): string {
    return this.domElement.style.cursor;
  }

  public set cursor(value: string) {
    this.domElement.style.cursor = value;
  }

  public get cameraManager(): CameraManager {
    return this.viewer.cameraManager;
  }

  public get flexibleCameraManager(): IFlexibleCameraManager {
    const cameraManager = this.cameraManager;
    if (!isFlexibleCameraManager(cameraManager)) {
      throw new Error('Camera manager is not flexible');
    }
    return cameraManager;
  }

  public get camera(): PerspectiveCamera {
    return this.cameraManager.getCamera();
  }

  public get sceneBoundingBox(): Box3 {
    return this.viewer.getSceneBoundingBox();
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
    this.toolController.setDefaultTool(navigationTool);
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
    const camera = this.camera;

    // Get camera direction
    const cameraDirection = new Vector3();
    camera.getWorldDirection(cameraDirection);

    cameraDirection.negate();
    light.position.copy(cameraDirection);
  };

  beforeSceneRenderedHandler = (event: {
    frameNumber: number;
    renderer: WebGLRenderer;
    camera: PerspectiveCamera;
  }): void => {
    // TODO: Add beforeRender to the customObject in Reveal, so this can be general made.
    // This way is a little bit time consuming since we have to iterate over all domainObjects and all views.
    for (const domainObject of this._rootDomainObject.getDescendantsByType(VisualDomainObject)) {
      for (const view of domainObject.views.getByType(ThreeView)) {
        if (view.renderTarget === this) {
          view.beforeRender(event.camera);
        }
      }
    }
  };

  // ==================================================
  // INSTANCE METHODS: Cursor
  // See: https://developer.mozilla.org/en-US/docs/Web/CSS/cursor
  // ==================================================

  public setDefaultCursor(): void {
    this.cursor = 'default';
  }

  public setMoveCursor(): void {
    this.cursor = 'move';
  }

  public setNavigateCursor(): void {
    this.cursor = 'pointer';
  }

  public setGrabCursor(): void {
    this.cursor = 'grab';
  }

  public setCrosshairCursor(): void {
    this.cursor = 'crosshair';
  }

  /**
   * Sets the resize cursor based on two points in 3D space to the resize
   * // cursor has a correct direction.
   * @param point1 - The first point in 3D space.
   * @param point2 - The second point in 3D space.
   */
  public setResizeCursor(point1: Vector3, point2: Vector3): void {
    const screenPoint1 = this.viewer.worldToScreen(point1, false);
    if (screenPoint1 === null) {
      return;
    }
    const screenPoint2 = this.viewer.worldToScreen(point2, false);
    if (screenPoint2 === null) {
      return;
    }
    const screenVector = screenPoint2?.sub(screenPoint1).normalize();
    screenVector.y = -screenVector.y; // Flip y axis so the x-y axis is mathematically correct
    const cursor = getResizeCursor(getOctDir(screenVector));
    if (cursor !== undefined) {
      this.cursor = cursor;
    }
  }
}
