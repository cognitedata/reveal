/*!
 * Copyright 2021 Cognite AS
 */
import { Cognite3DViewer } from '@reveal/core';
import { ToolbarTool } from './ToolbarTool';
import { AxisViewTool } from '../AxisView/AxisViewTool';

import iconSet12 from './icons/Cognite_Icon_Set-12.png';
import iconSet14 from './icons/Cognite_Icon_Set-14.png';
import iconSet19 from './icons/Cognite_Icon_Set-19.png';
// import iconSet30 from './icons/Cognite_Icon_Set-30.png';
// import iconSet32 from './icons/Cognite_Icon_Set-32.png';
// import iconSet42 from './icons/Cognite_Icon_Set-42.png';
// import iconSet54 from './icons/Cognite_Icon_Set-54.png';
// import iconSet63 from './icons/Cognite_Icon_Set-63.png';

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
    this.toolbar.addToolbarItem('HTML Overlay', iconSet19, this.createAxisViewTool);
    // this.toolbar.addToolbarItem('Debug Camera', iconSet30, callbackMsg);
    // this.toolbar.addToolbarItem('Timeline', iconSet32, callbackMsg);
    // this.toolbar.addToolbarItem('Explode View', iconSet42, callbackMsg);
    // this.toolbar.addToolbarItem('Maps', iconSet54, callbackMsg);
    // this.toolbar.addToolbarItem('Settings', iconSet63, callbackMsg);
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
