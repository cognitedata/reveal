/*!
 * Copyright 2021 Cognite AS
 */
import { Cognite3DViewer } from '@reveal/core';
import { ToolbarTool } from './ToolbarTool';
import { AxisViewTool } from '../AxisView/AxisViewTool';

import iconSet12 from './icons/Cognite_Icon_Set-12.png';
import iconSet14 from './icons/Cognite_Icon_Set-14.png';

export class DefaultToolbar {
  private readonly viewer: Cognite3DViewer;
  private readonly toolbar: ToolbarTool;
  private axisTool: AxisViewTool | undefined;

  constructor(viewer: Cognite3DViewer) {
    this.viewer = viewer;
    this.toolbar = new ToolbarTool(this.viewer);
    this.createDefaultToolbar();
  }

  private createDefaultToolbar() {
    this.toolbar.addToolbarItem('Take Screenshot', iconSet12, this.screenShot);
    this.toolbar.addToolbarItem('Axis Tool', iconSet14, this.createAxisViewTool);
  }

  private readonly createAxisViewTool = (): void => {
    if (this.axisTool === undefined) {
      this.axisTool = new AxisViewTool(this.viewer);
    } else {
      this.axisTool.dispose();
      this.axisTool = undefined;
    }
  }

  private readonly screenShot = async (): Promise<void> => {
    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('download', 'ScreenshotImage.png');
    const url = await this.viewer.getScreenshot();
    downloadLink.setAttribute('href', url);
    downloadLink.click();
  }

  public getToolbar(): ToolbarTool {
    return this.toolbar;
  }
}
