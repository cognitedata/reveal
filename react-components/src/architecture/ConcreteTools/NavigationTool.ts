/*!
 * Copyright 2024 Cognite AS
 * BaseTool: Base class for the tool are used to interact with the render target.
 */
/* eslint-disable @typescript-eslint/class-literal-property-style */

import { type RevealRenderTarget } from '../renderTarget/RevealRenderTarget';
import { BaseTool } from '../commands/BaseTool';

export class NavigationTool extends BaseTool {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(target: RevealRenderTarget) {
    super(target);
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get shortCutKey(): string | undefined {
    return 'N';
  }

  public override get name(): string {
    return 'Navigation';
  }

  public override get icon(): string {
    return 'Grab';
  }

  public override get tooltip(): string {
    return 'Navigation';
  }

  public override get tooltipKey(): string {
    return 'NAVIGATION';
  }

  public override async onClick(event: PointerEvent): Promise<void> {
    await this.renderTarget.cameraManager.onClick(event);
  }

  public override async onDoubleClick(event: PointerEvent): Promise<void> {
    await this.renderTarget.cameraManager.onDoubleClick(event);
  }

  public override async onPointerDown(event: PointerEvent, leftButton: boolean): Promise<void> {
    await this.renderTarget.cameraManager.onPointerDown(event, leftButton);
  }

  public override async onPointerDrag(event: PointerEvent, leftButton: boolean): Promise<void> {
    await this.renderTarget.cameraManager.onPointerDrag(event, leftButton);
  }

  public override async onPointerUp(event: PointerEvent, leftButton: boolean): Promise<void> {
    await this.renderTarget.cameraManager.onPointerUp(event, leftButton);
  }

  public override async onWheel(event: WheelEvent): Promise<void> {
    await this.renderTarget.cameraManager.onWheel(event);
  }

  public onKey(event: KeyboardEvent, down: boolean): void {
    this.renderTarget.cameraManager.onKey(event, down);
  }

  public override onFocusChanged(haveFocus: boolean): void {
    this.renderTarget.cameraManager.onFocusChanged(haveFocus);
  }
}
