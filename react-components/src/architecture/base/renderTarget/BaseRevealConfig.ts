/*!
 * Copyright 2024 Cognite AS
 */

import { type AxisGizmoTool } from '@cognite/reveal/tools';
import { type BaseCommand } from '../commands/BaseCommand';
import { PopupStyle } from '../domainObjectsHelpers/PopupStyle';
import { NavigationTool } from '../commands/NavigationTool';
import { type BaseTool } from '../commands/BaseTool';
import { type RevealRenderTarget } from './RevealRenderTarget';

export abstract class BaseRevealConfig {
  // ==================================================
  // VIRTUAL METHODS: Override these to config the viewer
  // ==================================================

  public createMainToolbar(): Array<BaseCommand | undefined> {
    return [];
  }

  public createMainToolbarStyle(): PopupStyle {
    return new PopupStyle({ right: 0, top: 0, horizontal: false });
  }

  public createAxisGizmoTool(): AxisGizmoTool | undefined {
    return undefined;
  }

  public createDefaultTool(): BaseTool {
    return new NavigationTool();
  }

  public onStartup(_renderTarget: RevealRenderTarget): void {}
}
