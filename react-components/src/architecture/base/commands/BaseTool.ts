/*!
 * Copyright 2024 Cognite AS
 * BaseTool: Base class for the tool are used to interact with the render target.
 */
/* eslint-disable @typescript-eslint/class-literal-property-style */

import { Raycaster } from 'three';
import { RenderTargetCommand } from './RenderTargetCommand';
import { getNormalizedPixelCoordinates, type AnyIntersection } from '@cognite/reveal';

export abstract class BaseTool extends RenderTargetCommand {
  private _raycaster = new Raycaster();
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
  // VIRTUAL METHODS: To be overridded
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
  // INSTANCE METHODS: Getters
  // ==================================================

  protected async getIntersection(event: PointerEvent): Promise<AnyIntersection | undefined> {
    const { renderTarget } = this;
    const { viewer } = renderTarget;
    const intersection = await viewer.getAnyIntersectionFromPixel(event.offsetX, event.offsetY);
    if (intersection === undefined) {
      return undefined;
    }
    return intersection;
  }

  protected getRaycaster(event: PointerEvent): Raycaster {
    const { renderTarget } = this;
    const { cameraManager } = renderTarget;
    const { domElement } = renderTarget;

    const normalizedCoords = getNormalizedPixelCoordinates(
      domElement,
      event.offsetX,
      event.offsetY
    );
    this._raycaster.setFromCamera(normalizedCoords, cameraManager.getCamera());
    return this._raycaster;
  }
}
