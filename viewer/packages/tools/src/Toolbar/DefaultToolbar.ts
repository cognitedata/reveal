/*!
 * Copyright 2021 Cognite AS
 */
import { Cognite3DModel, Cognite3DViewer } from '@reveal/core';
import { ToolbarTool } from './ToolbarTool';
import { AxisViewTool } from '../AxisView/AxisViewTool';
import { CameraControlsOptions } from '@reveal/core';

import iconSet12 from './icons/Cognite_Icon_Set-12.png';
import iconSet14 from './icons/Cognite_Icon_Set-14.png';
import iconSet19 from './icons/Cognite_Icon_Set-19.png';
import iconSet30 from './icons/Cognite_Icon_Set-30.png';
import iconSet32 from './icons/Cognite_Icon_Set-32.png';

/**
 * Default toolbar provides few of the Camera & other features in Reveal to enable/disable.
 */
export class DefaultToolbar {
  private readonly viewer: Cognite3DViewer;
  private readonly model: Cognite3DModel;
  private readonly toolbar: ToolbarTool;
  private axisTool: AxisViewTool | undefined;
  private cameraControlOption: CameraControlsOptions;

  constructor(viewer: Cognite3DViewer, model: Cognite3DModel) {
    this.viewer = viewer;
    this.model = model;
    this.toolbar = new ToolbarTool(this.viewer);
    this.cameraControlOption = {
      onClickTargetChange: false,
      mouseWheelAction: 'zoomPastCursor'
    }
    this.createDefaultToolbar();
  }

  /**
   * Create a Default Toolbar using Toolbar Tool
   */
  private createDefaultToolbar() {
    this.toolbar.addToolbarItem('Take Screenshot', iconSet12, this.screenShot);
    this.toolbar.addToolbarItem('Axis Tool', iconSet14, this.axisView);
    this.toolbar.addToolbarItem('Enable/Disable Camera Target on Click', iconSet19, this.changeCameraTargetOnClick);
    this.toolbar.addToolbarItem('Toggle Zoom past/Zoom to Cursor', iconSet30, this.toggleCameraZoomPastToCursor);
    this.toolbar.addToolbarItem('Fit Camera to Model', iconSet32, this.fitCameraToModel);
  }

  /**
   * Enable or Disable Axis view tool
   */
  private readonly axisView = (): void => {
    if (this.axisTool === undefined) {
      this.axisTool = new AxisViewTool(this.viewer);
    } else {
      this.axisTool.dispose();
      this.axisTool = undefined;
    }
  };

  /**
   * Save the screenshot of the canvas been rendered
   */
  private readonly screenShot = async (): Promise<void> => {
    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('download', 'ScreenshotImage.png');
    const url = await this.viewer.getScreenshot();
    downloadLink.setAttribute('href', url);
    downloadLink.click();
  };

  /**
   * Toggle enabling/disabling the Camera target on mouse click
   */
  private readonly changeCameraTargetOnClick = (): void => {
    this.cameraControlOption.onClickTargetChange = !this.cameraControlOption.onClickTargetChange;
    this.viewer.setCameraControlsOptions(this.cameraControlOption);
  };

  /**
   * Toggle camera for "Zoom Past Cursor" and "Zoom To Cursor"
   */
  private readonly toggleCameraZoomPastToCursor = (): void => {
    if (this.cameraControlOption.mouseWheelAction === 'zoomPastCursor') {
      this.cameraControlOption.mouseWheelAction = 'zoomToCursor';
    } else {
      this.cameraControlOption.mouseWheelAction = 'zoomPastCursor';
    }
    this.viewer.setCameraControlsOptions(this.cameraControlOption);
  };

  /**
   * Fit Camera to Model
   */
  private readonly fitCameraToModel = (): void => {
    this.viewer.fitCameraToModel(this.model);
  };

  public getToolbar(): ToolbarTool {
    return this.toolbar;
  }
}
