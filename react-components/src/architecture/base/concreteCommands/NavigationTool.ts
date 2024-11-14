/*!
 * Copyright 2024 Cognite AS
 */

import { BaseTool } from '../commands/BaseTool';
import { Image360Action, type IFlexibleCameraManager } from '@cognite/reveal';
import { type TranslateKey } from '../utilities/TranslateKey';
import { type IconName } from '../../base/utilities/IconName';
import { CommandsUpdater } from '../reactUpdaters/CommandsUpdater';

/**
 * Represents a tool navigation tool used for camera manipulation.
 * Inherit from this class if you like to have some camera manipulation in your tool.
 */
export class NavigationTool extends BaseTool {
  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  private get cameraManager(): IFlexibleCameraManager {
    return this.renderTarget.flexibleCameraManager;
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get icon(): IconName {
    return 'Grab';
  }

  public override get tooltip(): TranslateKey {
    return { key: 'NAVIGATION', fallback: 'Navigation' };
  }

  public override onHoverByDebounce(_event: PointerEvent): void {}

  public override onHover(event: PointerEvent): void {
    this.renderTarget.viewer.onHover360Images(event);
  }

  public override async onClick(event: PointerEvent): Promise<void> {
    const promise = this.renderTarget.viewer.onClick360Images(event).then((isEntered) => {
      if (isEntered) {
        CommandsUpdater.update(this.renderTarget);
      }
      return isEntered;
    });
    if (await promise) {
      return;
    }
    await super.onClick(event);
    await this.cameraManager.onClick(event);
  }

  public override async onDoubleClick(event: PointerEvent): Promise<void> {
    await this.cameraManager.onDoubleClick(event);
  }

  public override async onLeftPointerDown(event: PointerEvent): Promise<void> {
    await this.cameraManager.onPointerDown(event, true);
  }

  public override async onLeftPointerDrag(event: PointerEvent): Promise<void> {
    await this.cameraManager.onPointerDrag(event, true);
  }

  public override async onLeftPointerUp(event: PointerEvent): Promise<void> {
    await this.cameraManager.onPointerUp(event, true);
  }

  public override async onRightPointerDown(event: PointerEvent): Promise<void> {
    await this.cameraManager.onPointerDown(event, false);
  }

  public override async onRightPointerDrag(event: PointerEvent): Promise<void> {
    await this.cameraManager.onPointerDrag(event, false);
  }

  public override async onRightPointerUp(event: PointerEvent): Promise<void> {
    await this.cameraManager.onPointerUp(event, false);
  }

  public override async onWheel(event: WheelEvent, delta: number): Promise<void> {
    await this.cameraManager.onWheel(event, delta);
  }

  public override onKey(event: KeyboardEvent, down: boolean): void {
    this.cameraManager.onKey(event, down);
  }

  public override onEscapeKey(): void {
    if (this.renderTarget.isInside360Image) {
      void this.renderTarget.viewer.image360Action(Image360Action.Exit).then(() => {
        CommandsUpdater.update(this.renderTarget);
      });
    } else {
      super.onEscapeKey();
    }
  }

  public override onFocusChanged(haveFocus: boolean): void {
    this.cameraManager.onFocusChanged(haveFocus);
  }
}
