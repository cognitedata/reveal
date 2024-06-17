/*!
 * Copyright 2024 Cognite AS
 */

import {
  type CameraManager,
  CustomObject,
  isFlexibleCameraManager,
  type Cognite3DViewer,
  type IFlexibleCameraManager,
  CDF_TO_VIEWER_TRANSFORMATION
} from '@cognite/reveal';
import {
  Vector3,
  AmbientLight,
  DirectionalLight,
  type PerspectiveCamera,
  type Box3,
  type Plane
} from 'three';
import { CommandsController } from './CommandsController';
import { RootDomainObject } from '../domainObjects/RootDomainObject';
import { getOctDir } from '../utilities/extensions/vectorExtensions';
import { getResizeCursor } from '../utilities/geometry/getResizeCursor';
import { type DomainObject } from '../domainObjects/DomainObject';
import { type AxisGizmoTool } from '@cognite/reveal/tools';
import { type BaseRevealConfig } from './BaseRevealConfig';
import { DefaultRevealConfig } from './DefaultRevealConfig';
import { CommandsUpdater } from '../reactUpdaters/CommandsUpdater';
import { Range3 } from '../utilities/geometry/Range3';
import { getBoundingBoxFromPlanes } from '../utilities/geometry/getBoundingBoxFromPlanes';

const DIRECTIONAL_LIGHT_NAME = 'DirectionalLight';

export class RevealRenderTarget {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _viewer: Cognite3DViewer;
  private readonly _commandsController: CommandsController;
  private readonly _rootDomainObject: RootDomainObject;
  private _ambientLight: AmbientLight | undefined;
  private _directionalLight: DirectionalLight | undefined;
  private _clippedBoundingBox: Box3 | undefined;
  private _cropBoxUniqueId: number | undefined = undefined;
  private _axisGizmoTool: AxisGizmoTool | undefined;
  private _config: BaseRevealConfig | undefined = undefined;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  constructor(viewer: Cognite3DViewer) {
    this._viewer = viewer;

    const cameraManager = this.cameraManager;
    if (!isFlexibleCameraManager(cameraManager)) {
      throw new Error('Can not use RevealRenderTarget without the FlexibleCameraManager');
    }
    this._commandsController = new CommandsController(this.domElement);
    this._commandsController.addEventListeners();
    this._rootDomainObject = new RootDomainObject(this);

    this.initializeLights();
    this._viewer.on('cameraChange', this.cameraChangeHandler);

    this.setConfig(new DefaultRevealConfig());
  }

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get viewer(): Cognite3DViewer {
    return this._viewer;
  }

  public get config(): BaseRevealConfig | undefined {
    return this._config;
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

  public get commandsController(): CommandsController {
    return this._commandsController;
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

  public get clippedSceneBoundingBox(): Box3 {
    if (this._clippedBoundingBox === undefined) {
      return this.sceneBoundingBox;
    }
    const boundingBox = this.sceneBoundingBox.clone();
    boundingBox.intersect(this._clippedBoundingBox);
    return boundingBox;
  }

  public get sceneBoundingBox(): Box3 {
    return this.viewer.getSceneBoundingBox();
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public setConfig(config: BaseRevealConfig): void {
    this._config = config;

    const defaultTool = config.createDefaultTool();
    defaultTool.attach(this);
    this.commandsController.add(defaultTool);
    this.commandsController.setDefaultTool(defaultTool);

    const axisGizmoTool = config.createAxisGizmoTool();
    if (axisGizmoTool !== undefined) {
      axisGizmoTool.connect(this._viewer);
      this._axisGizmoTool = axisGizmoTool;
    }
  }

  public onStartup(): void {
    this._config?.onStartup(this);
  }

  public dispose(): void {
    this._viewer.dispose();
    if (this._ambientLight !== undefined) {
      this._viewer.removeObject3D(this._ambientLight);
    }
    if (this._directionalLight !== undefined) {
      this._viewer.removeObject3D(this._directionalLight);
    }
    this.commandsController.removeEventListeners();
    this.commandsController.dispose();
    this._axisGizmoTool?.dispose();
    CommandsUpdater.dispose();
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

  // ==================================================
  // INSTANCE METHODS: Fit operations
  // ==================================================

  public fitView(): boolean {
    const boundingBox = this.clippedSceneBoundingBox;
    if (boundingBox.isEmpty()) {
      return false;
    }
    this.viewer.fitCameraToBoundingBox(this.clippedSceneBoundingBox);
    return true;
  }

  // ==================================================
  // INSTANCE METHODS: Clipping operations (Experimental code)
  // ==================================================

  public setGlobalClipping(clippingPlanes: Plane[], domainObject?: DomainObject): void {
    if (clippingPlanes.length === 0) {
      this.clearGlobalClipping();
      return;
    }
    const sceneBoundingBox = this.sceneBoundingBox.clone();
    sceneBoundingBox.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION.clone().invert());
    const sceneRange = new Range3();
    sceneRange.copy(sceneBoundingBox);
    const clippedRange = getBoundingBoxFromPlanes(clippingPlanes, sceneRange);
    const clippedBoundingBox = clippedRange.getBox();

    for (const plane of clippingPlanes) {
      plane.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
    }
    clippedBoundingBox.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);

    // Set the values
    this.viewer.setGlobalClippingPlanes(clippingPlanes);
    this._clippedBoundingBox = clippedBoundingBox;
    this._cropBoxUniqueId = domainObject?.uniqueId;
  }

  public isGlobalCropBox(domainObject: DomainObject): boolean {
    return this._cropBoxUniqueId !== undefined && domainObject.uniqueId === this._cropBoxUniqueId;
  }

  public clearGlobalClipping(): void {
    this.viewer.setGlobalClippingPlanes([]);
    this._clippedBoundingBox = undefined;
    this._cropBoxUniqueId = undefined;
  }

  public get isGlobalCropBoxActive(): boolean {
    return this.isGlobalClippingActive && this._cropBoxUniqueId !== undefined;
  }

  public get isGlobalClippingActive(): boolean {
    return this.viewer.getGlobalClippingPlanes().length > 0;
  }

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
