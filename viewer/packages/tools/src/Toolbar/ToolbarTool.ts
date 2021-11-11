/*!
 * Copyright 2021 Cognite AS
 */

import { Cognite3DViewer } from '@reveal/core';
import { Cognite3DViewerToolBase } from '../Cognite3DViewerToolBase';
import { Toolbar, ToolbarPosition } from './Toolbar';

export class ToolbarTool extends Cognite3DViewerToolBase {
  private readonly _viewer: Cognite3DViewer;
  private readonly _toolbar: Toolbar;

  constructor(viewer: Cognite3DViewer) {
    super();

    this._viewer = viewer;
    this._toolbar = new Toolbar(this._viewer);
  }

  /**
   * Add a Icon button into the Toolbar container
   * @param toolTip Tooltip for the Icon button
   * @param backgroundImage background image to be placed onto icon
   * @param onClick Click event callback function which will be used to perform custom functionlity of the user
   */
  public addToolbarItem(toolTip: string, backgroundImage: string, onClick: () => void): void {
    this._toolbar.addToolbarItem(toolTip, backgroundImage, onClick);
  }

  public setPosition(position: ToolbarPosition) {
    this._toolbar.setPosition(position);
  }

  public dispose(): void {
    super.dispose();
  }
}
