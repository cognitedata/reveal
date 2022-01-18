/*!
 * Copyright 2021 Cognite AS
 */

import { Cognite3DViewer } from '@reveal/core';
import { Cognite3DViewerToolBase } from '../Cognite3DViewerToolBase';
import { Toolbar, ToolbarPosition } from './Toolbar';
import { AxisViewTool } from '../AxisView/AxisViewTool';
import { CameraControlsOptions } from '@reveal/core';

import svgAxisIcon from './icons/Axis3D.svg';
import svgScreenshotIcon from './icons/Image.svg';
import svgCameraTargetIcon from './icons/Camera.svg';
import svgZoomPastIcon from './icons/ZoomIn.svg';
import svgFitToCameraIcon from './icons/FrameTool.svg';

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
   * @param backgroundImageUri Background image to be placed onto icon
   * @param onClick Click event callback function which will be used to perform custom functionlity of the user
   * @param toolTip Optional tooltip for the icon button
   */
  public addToolbarButton(backgroundImageUri: string, onClick: () => void, toolTip: string = ''): void {
    this._toolbar.addToolbarButton(backgroundImageUri, false, onClick, toolTip);
  }

  /**
   * Add a Icon toggle button into the Toolbar container
   * @param backgroundImageUri Background image to be placed onto icon
   * @param onToggled Click event callback function which will be used to perform custom functionlity of the user
   * @param toolTip Optional tooltip for the icon button
   */
  public addToolbarToogleButton(backgroundImageUri: string, onToggled: () => void, toolTip: string = ''): void {
    this._toolbar.addToolbarButton(backgroundImageUri, true, onToggled, toolTip);
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
    this.addToolbarToogleButton(svgAxisIcon, this._handleAxisViewToolListener, 'Axis Tool');
  }

  /**
   * Add Save the screenshot of the canvas been rendered to the Toolbar
   */
  public addTakeScreenshotTool(): void {
    this.addToolbarButton(svgScreenshotIcon, this._handleScreenshotListener, 'Take Screenshot');
  }

  /**
   * Adds Toggle enabling/disabling the Camera target on mouse click to the Toolbar
   */
  public addCameraTargetOnClickToggle(): void {
    this.addToolbarToogleButton(
      svgCameraTargetIcon,
      this._handleChangeCameraTargetListener,
      'Enable/Disable Camera Target on Click'
    );
  }

  /**
   * Adds Toggle camera for "Zoom Past Cursor" and "Zoom To Cursor" in to Toolbar
   */
  public addZoomPastToCursorToggle(): void {
    this.addToolbarToogleButton(
      svgZoomPastIcon,
      this._handleCameraZoomPastCursorListener,
      'Toggle Zoom past/Zoom to Cursor'
    );
  }

  /**
   * Adds Fit Camera to Model into Toolbar
   */
  public addFitCameraToModel(): void {
    this.addToolbarButton(svgFitToCameraIcon, this._handleFitCameraToModelListener, 'Fit Camera to Model');
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
