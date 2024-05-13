/*!
 * Copyright 2024 Cognite AS
 * BaseTool: Base class for the tool are used to interact with the render target.
 */
/* eslint-disable @typescript-eslint/class-literal-property-style */

import { BaseTool } from '../commands/BaseTool';
import { type Tooltip } from '../commands/BaseCommand';
import { type IFlexibleCameraManager } from '@cognite/reveal';

export class NavigationTool extends BaseTool {
  // ==================================================
  // INSTANVE PROPERTIES
  // ==================================================

  private get cameraManager(): IFlexibleCameraManager {
    return this.renderTarget.flexibleCameraManager;
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get shortCutKey(): string | undefined {
    return 'N';
  }

  public override get icon(): string {
    return 'Grab';
  }

  public override get tooltip(): Tooltip {
    return { key: 'NAVIGATION', fallback: 'Navigation' };
  }

  public override async onClick(event: PointerEvent): Promise<void> {
    await this.cameraManager.onClick(event);
  }

  public override async onDoubleClick(event: PointerEvent): Promise<void> {
    await this.cameraManager.onDoubleClick(event);
  }

  public override async onPointerDown(event: PointerEvent, leftButton: boolean): Promise<void> {
    await this.cameraManager.onPointerDown(event, leftButton);
  }

  public override async onPointerDrag(event: PointerEvent, leftButton: boolean): Promise<void> {
    await this.cameraManager.onPointerDrag(event, leftButton);
  }

  public override async onPointerUp(event: PointerEvent, leftButton: boolean): Promise<void> {
    await this.cameraManager.onPointerUp(event, leftButton);
  }

  public override async onWheel(event: WheelEvent): Promise<void> {
    await this.cameraManager.onWheel(event);
  }

  public override onKey(event: KeyboardEvent, down: boolean): void {
    this.cameraManager.onKey(event, down);
  }

  public override onFocusChanged(haveFocus: boolean): void {
    this.cameraManager.onFocusChanged(haveFocus);
  }
}
