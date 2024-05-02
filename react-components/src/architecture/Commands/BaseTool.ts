/*!
 * Copyright 2024 Cognite AS
 * BaseTool: Base class for the tool are used to interact with the render target.
 */
/* eslint-disable @typescript-eslint/class-literal-property-style */

import { RenderTargetCommand } from './RenderTargetCommand';
import { type AnyIntersection } from '@cognite/reveal';
import { BaseView } from '../views/BaseView';
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
    if (intersection === null) {
      return undefined;
    }
    return intersection;
  }

  protected getDomainObject(intersection: AnyIntersection | undefined): DomainObject | undefined {
    if (intersection === undefined) {
      return undefined;
    }
    if (intersection?.type !== 'customObject') {
      return undefined;
    }
    const customObject = intersection.customObject;
    if (customObject === undefined) {
      return;
    }
    if (!(customObject instanceof BaseView)) {
      return;
    }
    return customObject.domainObject;
  }
}
