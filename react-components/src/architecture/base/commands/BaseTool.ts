/*!
 * Copyright 2024 Cognite AS
 * BaseTool: Base class for the tool are used to interact with the render target.
 */
/* eslint-disable @typescript-eslint/class-literal-property-style */

import { Raycaster, type Vector2 } from 'three';
import { RenderTargetCommand } from './RenderTargetCommand';
import {
  CustomObjectIntersectInput,
  type CustomObjectIntersection,
  type AnyIntersection
} from '@cognite/reveal';
import { ObjectThreeView } from '../views/ObjectThreeView';
import {
  type DomainObjectIntersection,
  isDomainObjectIntersection
} from '../domainObjectsHelpers/DomainObjectIntersection';
import { type Class } from '../domainObjectsHelpers/Class';
import { type DomainObject } from '../domainObjects/DomainObject';

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
    this.renderTarget.toolController.setActiveTool(this);
    return true;
  }

  // ==================================================
  // VIRTUAL METHODS: To be overridden
  // ==================================================

  public onActivate(): void {
    this.update();
  }

  public onDeactivate(): void {
    this.update();
  }

  public onHover(_event: PointerEvent): void {}

  public async onClick(_event: PointerEvent): Promise<void> {
    await Promise.resolve();
  }

  public async onDoubleClick(_event: PointerEvent): Promise<void> {
    await Promise.resolve();
  }

  public async onPointerDown(_event: PointerEvent, leftButton: boolean): Promise<void> {
    await Promise.resolve();
  }

  public async onPointerDrag(event: PointerEvent, leftButton: boolean): Promise<void> {
    await Promise.resolve();
  }

  public async onPointerUp(_event: PointerEvent, leftButton: boolean): Promise<void> {
    await Promise.resolve();
  }

  public async onWheel(event: WheelEvent): Promise<void> {
    await Promise.resolve();
  }

  public onFocusChanged(haveFocus: boolean): void {}

  public onKey(event: KeyboardEvent, down: boolean): void {}

  // ==================================================
  // INSTANCE METHODS: Intersections
  // ==================================================

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
    const normalizedCoords = this.getNormalizedPixelCoordinates(event);
    const intersectInput = new CustomObjectIntersectInput(
      normalizedCoords,
      renderTarget.cameraManager.getCamera(),
      renderTarget.viewer.getGlobalClippingPlanes()
    );

    let closestIntersection: CustomObjectIntersection | undefined;
    let closestDistanceToCamera: number | undefined;
    for (const domainObject of rootDomainObject.getDescendantsByType(classType)) {
      for (const view of domainObject.views) {
        if (!(view instanceof ObjectThreeView)) {
          continue;
        }
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

  protected getRaycaster(event: PointerEvent): Raycaster {
    const { renderTarget } = this;
    const { cameraManager } = renderTarget;
    const normalizedCoords = this.getNormalizedPixelCoordinates(event);
    const raycaster = new Raycaster();
    raycaster.setFromCamera(normalizedCoords, cameraManager.getCamera());
    return raycaster;
  }

  protected getNormalizedPixelCoordinates(event: PointerEvent): Vector2 {
    const { renderTarget } = this;
    const { viewer } = renderTarget;
    const point = viewer.getPixelCoordinatesFromEvent(event);
    return viewer.getNormalizedPixelCoordinates(point);
  }
}
