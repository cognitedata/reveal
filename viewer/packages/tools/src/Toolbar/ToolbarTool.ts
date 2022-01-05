/*!
 * Copyright 2021 Cognite AS
 */

import { CogniteModelBase, Cognite3DViewer } from '@reveal/core';
import { Cognite3DViewerToolBase } from '../Cognite3DViewerToolBase';
import { Toolbar, ToolbarPosition } from './Toolbar';
import { AxisViewTool } from '../AxisView/AxisViewTool';
import { CameraControlsOptions } from '@reveal/core';

import iconSet12 from './icons/Cognite_Icon_Set-12.png';
import iconSet14 from './icons/Cognite_Icon_Set-14.png';
import iconSet19 from './icons/Cognite_Icon_Set-19.png';
import iconSet30 from './icons/Cognite_Icon_Set-30.png';
import iconSet32 from './icons/Cognite_Icon_Set-32.png';

/**
 * Tool to help user to use the default toolbar items such as Camera & other features in Reveal to enable/disable it.
 * The tool also helps in adding or create custom toolbar.
 */
export class ToolbarTool extends Cognite3DViewerToolBase {
  private readonly _viewer: Cognite3DViewer;
  private readonly _model: CogniteModelBase;
  private readonly _toolbar: Toolbar;
  private axisTool: AxisViewTool | undefined;
  private cameraControlOption: CameraControlsOptions;

  constructor(viewer: Cognite3DViewer, model: CogniteModelBase) {
    super();

    this._viewer = viewer;
    this._model = model;
    this._toolbar = new Toolbar(this._viewer);
    this.cameraControlOption = {
      onClickTargetChange: false,
      mouseWheelAction: 'zoomPastCursor'
    };
  }

  /**
   * Add a Icon button into the Toolbar container
   * @param toolTip Tooltip for the Icon button
   * @param backgroundImageUri background image to be placed onto icon
   * @param isToggle Is the icon button used as toggle
   * @param onClick Click event callback function which will be used to perform custom functionlity of the user
   */
  public addToolbarItem(toolTip: string, backgroundImageUri: string, isToggle: boolean, onClick: () => void): void {
    this._toolbar.addToolbarItem(toolTip, backgroundImageUri, isToggle, onClick);
  }

  /**
   * Set the position of the toolbar container
   * @param position ToolbarPosition value such as Top, Bottom, Left, Right within the canvas
   */
  public setPosition(position: ToolbarPosition): void {
    this._toolbar.setPosition(position);
  }

  /**
   * Add Enable or Disable Axis view tool to the Toolbar
   */
  public addAxisToolToggle(): void {
    this.addToolbarItem('Axis Tool', iconSet14, true, this.axisView);
  }

  /**
   * Add Save the screenshot of the canvas been rendered to the Toolbar
   */
  public addTakeScreenshotTool(): void {
    this.addToolbarItem('Take Screenshot', iconSet12, false, this.screenShot);
  }

  /**
   * Adds Toggle enabling/disabling the Camera target on mouse click to the Toolbar
   */
  public addCameraTargetOnClickToggle(): void {
    this.addToolbarItem('Enable/Disable Camera Target on Click', iconSet19, true, this.changeCameraTargetOnClick);
  }

  /**
   * Adds Toggle camera for "Zoom Past Cursor" and "Zoom To Cursor" in to Toolbar
   */
  public addZoomPastToCursorToggle(): void {
    this.addToolbarItem('Toggle Zoom past/Zoom to Cursor', iconSet30, true, this.toggleCameraZoomPastToCursor);
  }

  /**
   * Adds Fit Camera to Model to Toolbar
   */
  public addFitCameraToModel(): void {
    this.addToolbarItem('Fit Camera to Model', iconSet32, false, this.fitCameraToModel);
  }

  /**
   * Enable or Disable Axis view tool
   */
  private readonly axisView = (): void => {
    if (this.axisTool === undefined) {
      this.axisTool = new AxisViewTool(this._viewer);
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
    const url = await this._viewer.getScreenshot();
    downloadLink.setAttribute('href', url);
    downloadLink.click();
  };

  /**
   * Toggle enabling/disabling the Camera target on mouse click
   */
  private readonly changeCameraTargetOnClick = (): void => {
    this.cameraControlOption.onClickTargetChange = !this.cameraControlOption.onClickTargetChange;
    this._viewer.setCameraControlsOptions(this.cameraControlOption);
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
    this._viewer.setCameraControlsOptions(this.cameraControlOption);
  };

  /**
   * Fit Camera to Model
   */
  private readonly fitCameraToModel = (): void => {
    this._viewer.fitCameraToModel(this._model);
  };
}
