/*!
 * Copyright 2021 Cognite AS
 */

import { Cognite3DViewer } from '@reveal/core';
import { Cognite3DViewerToolBase } from '../Cognite3DViewerToolBase';
import { Toolbar, ToolbarPosition } from './Toolbar';
import { AxisViewTool } from '../AxisView/AxisViewTool';
import { CameraControlsOptions } from '@reveal/core';

import axisIcon from './icons/Cognite_Icon_Set-12.png';
import screenshotIcon from './icons/Cognite_Icon_Set-14.png';
import cameratargetIcon from './icons/Cognite_Icon_Set-19.png';
import zoompastIcon from './icons/Cognite_Icon_Set-30.png';
import fittocameraIcon from './icons/Cognite_Icon_Set-32.png';

/**
 * Tool to help user to use the default toolbar items such as Camera & other features in Reveal to enable/disable it.
 * The tool also helps in adding or create custom toolbar.
 */
export class ToolbarTool extends Cognite3DViewerToolBase {
  private readonly _viewer: Cognite3DViewer;
  private readonly _toolbar: Toolbar;
  private axisTool: AxisViewTool | undefined;
  private cameraControlOption: CameraControlsOptions;

  private readonly _handleAxisViewToolListener = this.axisView.bind(this);
  private readonly _handleScreenshotListener = this.screenShot.bind(this);
  private readonly _handleChangeCameraTargetListener = this.changeCameraTargetOnClick.bind(this);
  private readonly _handleCameraZoomPastCursorListener = this.toggleCameraZoomPastToCursor.bind(this);
  private readonly _handleFitCameraToModelListener = this.fitCameraToAllModels.bind(this);

  constructor(viewer: Cognite3DViewer) {
    super();

    this._viewer = viewer;
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
    this.addToolbarItem('Axis Tool', axisIcon, true, this._handleAxisViewToolListener);
  }

  /**
   * Add Save the screenshot of the canvas been rendered to the Toolbar
   */
  public addTakeScreenshotTool(): void {
    this.addToolbarItem('Take Screenshot', screenshotIcon, false, this._handleScreenshotListener);
  }

  /**
   * Adds Toggle enabling/disabling the Camera target on mouse click to the Toolbar
   */
  public addCameraTargetOnClickToggle(): void {
    this.addToolbarItem(
      'Enable/Disable Camera Target on Click',
      cameratargetIcon,
      true,
      this._handleChangeCameraTargetListener
    );
  }

  /**
   * Adds Toggle camera for "Zoom Past Cursor" and "Zoom To Cursor" in to Toolbar
   */
  public addZoomPastToCursorToggle(): void {
    this.addToolbarItem(
      'Toggle Zoom past/Zoom to Cursor',
      zoompastIcon,
      true,
      this._handleCameraZoomPastCursorListener
    );
  }

  /**
   * Adds Fit Camera to Model to Toolbar
   */
  public addFitCameraToModel(): void {
    this.addToolbarItem('Fit Camera to Model', fittocameraIcon, false, this._handleFitCameraToModelListener);
  }

  /**
   * Enable or Disable Axis view tool
   */
  private axisView(): void {
    if (this.axisTool === undefined) {
      this.axisTool = new AxisViewTool(this._viewer);
    } else {
      this.axisTool.dispose();
      this.axisTool = undefined;
    }
  }

  /**
   * Save the screenshot of the canvas been rendered
   */
  private async screenShot(): Promise<void> {
    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('download', 'ScreenshotImage.png');
    const url = await this._viewer.getScreenshot();
    downloadLink.setAttribute('href', url);
    downloadLink.click();
  }

  /**
   * Toggle enabling/disabling the Camera target on mouse click
   */
  private changeCameraTargetOnClick(): void {
    this.cameraControlOption.onClickTargetChange = !this.cameraControlOption.onClickTargetChange;
    this._viewer.setCameraControlsOptions(this.cameraControlOption);
  }

  /**
   * Toggle camera for "Zoom Past Cursor" and "Zoom To Cursor"
   */
  private toggleCameraZoomPastToCursor(): void {
    if (this.cameraControlOption.mouseWheelAction === 'zoomPastCursor') {
      this.cameraControlOption.mouseWheelAction = 'zoomToCursor';
    } else {
      this.cameraControlOption.mouseWheelAction = 'zoomPastCursor';
    }
    this._viewer.setCameraControlsOptions(this.cameraControlOption);
  }

  /**
   * Fit Camera to Model
   */
  private fitCameraToAllModels(): void {
    this._viewer.fitCameraToAllModels();
  }
}
