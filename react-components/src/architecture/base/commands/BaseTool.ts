/*!
 * Copyright 2024 Cognite AS
 * BaseTool: Base class for the tool are used to interact with the render target.
 */

import { type Ray, Raycaster, type Vector2 } from 'three';
import { RenderTargetCommand } from './RenderTargetCommand';
import {
  type CustomObjectIntersection,
  type AnyIntersection,
  CDF_TO_VIEWER_TRANSFORMATION
} from '@cognite/reveal';
import { GroupThreeView } from '../views/GroupThreeView';
import {
  type DomainObjectIntersection,
  isDomainObjectIntersection
} from '../domainObjectsHelpers/DomainObjectIntersection';
import { type Class } from '../domainObjectsHelpers/Class';
import { type DomainObject } from '../domainObjects/DomainObject';
import { type BaseCommand } from './BaseCommand';
import { ActiveToolUpdater } from '../reactUpdaters/ActiveToolUpdater';
import { PopupStyle } from '../domainObjectsHelpers/PopupStyle';

/**
 * Base class for intraction in the 3D viewer
 * Provides common functionality and virtual methods to be overridden by derived classes.
 */
export abstract class BaseTool extends RenderTargetCommand {
  // ==================================================
  // OVERRIDES
  // =================================================

  public override get isCheckable(): boolean {
    return true;
  }

  public override get isChecked(): boolean {
    return this.renderTarget.toolController.activeTool === this;
  }

  protected override invokeCore(): boolean {
    if (this.isChecked) {
      this.renderTarget.toolController.activateDefaultTool();
    } else {
      this.renderTarget.toolController.setActiveTool(this);
    }
    return true;
  }

  // ==================================================
  // VIRTUAL METHODS: To be overridden
  // ==================================================

  public get defaultCursor(): string {
    return 'default';
  }

  public getToolbar(): Array<BaseCommand | undefined> | undefined {
    return undefined; // Override this to add extra buttons to a separate toolbar
  }

  public getToolbarStyle(): PopupStyle {
    // Override this to pclase the extra separate toolbar
    // Default lower left corner
    return new PopupStyle({ bottom: 0, left: 0 });
  }

  public onActivate(): void {
    this.update();
    this.setDefaultCursor();
    this.clearDragging();
    ActiveToolUpdater.update();
  }

  public onDeactivate(): void {
    this.update();
    this.clearDragging();
    ActiveToolUpdater.update();
  }

  public clearDragging(): void {
    // Override this to clear any temporary objects in the tool, like the dragger
  }

  public onHover(_event: PointerEvent): void {}

  public async onClick(_event: PointerEvent): Promise<void> {
    await Promise.resolve();
  }

  public async onDoubleClick(_event: PointerEvent): Promise<void> {
    await Promise.resolve();
  }

  public async onPointerDown(_event: PointerEvent, _leftButton: boolean): Promise<void> {
    await Promise.resolve();
  }

  public async onPointerDrag(_event: PointerEvent, _leftButton: boolean): Promise<void> {
    await Promise.resolve();
  }

  public async onPointerUp(_event: PointerEvent, _leftButton: boolean): Promise<void> {
    await Promise.resolve();
  }

  public async onWheel(_event: WheelEvent): Promise<void> {
    await Promise.resolve();
  }

  public onFocusChanged(_haveFocus: boolean): void {}

  public onKey(_event: KeyboardEvent, _down: boolean): void {}

  // ==================================================
  // INSTANCE METHODS: Intersections
  // ==================================================

  public setDefaultCursor(): void {
    this.renderTarget.cursor = this.defaultCursor;
  }

  protected async getIntersection(event: PointerEvent): Promise<AnyIntersection | undefined> {
    const { renderTarget } = this;
    const { viewer } = renderTarget;
    const point = viewer.getPixelCoordinatesFromEvent(event);
    const intersection = await viewer.getAnyIntersectionFromPixel(point);
    if (intersection === undefined) {
      return undefined;
    }
    return intersection;
  }

  protected getSpecificIntersection<T extends DomainObject>(
    event: PointerEvent,
    classType: Class<T>
  ): DomainObjectIntersection | undefined {
    // This function is similar to getIntersection, but it only considers a specific DomainObject
    const { renderTarget } = this;
    const { rootDomainObject } = renderTarget;
    const { viewer } = renderTarget;

    const point = viewer.getPixelCoordinatesFromEvent(event);
    const intersectInput = viewer.createCustomObjectIntersectInput(point);

    let closestIntersection: CustomObjectIntersection | undefined;
    let closestDistanceToCamera: number | undefined;
    for (const domainObject of rootDomainObject.getDescendantsByType(classType)) {
      for (const view of domainObject.views.getByType(GroupThreeView)) {
        if (view.renderTarget !== renderTarget) {
          continue;
        }
        const intersection = view.intersectIfCloser(intersectInput, closestDistanceToCamera);
        if (intersection === undefined) {
          continue;
        }
        closestDistanceToCamera = intersection.distanceToCamera;
        closestIntersection = intersection;
      }
    }
    if (!isDomainObjectIntersection(closestIntersection)) {
      return undefined;
    }
    return closestIntersection;
  }

  // ==================================================
  // INSTANCE METHODS: Getters
  // ==================================================

  protected getRaycaster(event: PointerEvent | WheelEvent): Raycaster {
    const { renderTarget } = this;
    const normalizedCoords = this.getNormalizedPixelCoordinates(event);
    const raycaster = new Raycaster();
    raycaster.setFromCamera(normalizedCoords, renderTarget.camera);
    return raycaster;
  }

  protected getRay(event: PointerEvent | WheelEvent, convertToCdf: boolean = false): Ray {
    const ray = this.getRaycaster(event).ray;
    if (convertToCdf) {
      ray.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION.clone().invert());
    }
    return ray;
  }

  protected getNormalizedPixelCoordinates(event: PointerEvent | WheelEvent): Vector2 {
    const { renderTarget } = this;
    const { viewer } = renderTarget;
    const point = viewer.getPixelCoordinatesFromEvent(event);
    return viewer.getNormalizedPixelCoordinates(point);
  }
}
