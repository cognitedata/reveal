/*!
 * Copyright 2021 Cognite AS
 */
import { Cognite3DViewer } from '@reveal/core';
import { assertNever } from '@reveal/utilities';
import css from './Toolbar.css';

/**
 * Toolbar position within the canvas
 */
export type ToolbarPosition = 'top' | 'right' | 'bottom' | 'left';

/**
 * Toolbar class which creates a container to hold all icons within the toolbar
 */
export class Toolbar {
  private readonly _toolbarContainer: HTMLDivElement;
  private static readonly stylesId = 'reveal-viewer-toolbar-styles';
  private readonly _canvasElement: HTMLCanvasElement | null;

  private static readonly classnames = {
    container: 'reveal-viewer-toolbar-container',
    bottom: 'reveal-viewer-toolbar-container--bottom',
    top: 'reveal-viewer-toolbar-container--top',
    left: 'reveal-viewer-toolbar-container--left',
    right: 'reveal-viewer-toolbar-container--right',
    icon: 'reveal-viewer-toolbar-icon',
    iconImg: 'reveal-viewer-toolbar-icon-img',
    iconClicked: 'reveal-viewer-toolbar-icon-clicked'
  };

  constructor(viewer: Cognite3DViewer) {
    this._canvasElement = viewer.domElement.querySelector('canvas');
    const canvasElementParent = this._canvasElement?.parentElement;
    if (canvasElementParent === null) {
      throw new Error('Could not find canvas');
    }

    this._toolbarContainer = document.createElement('div');
    this.createToolBar(canvasElementParent!);
  }

  /**
   * Load the the styles from the CSS and appends them to the toolbar
   * @returns Return if styles already loaded
   */
  private static ensureStylesLoaded() {
    if (document.getElementById(Toolbar.stylesId)) {
      return;
    }

    const style = document.createElement('style');
    style.id = Toolbar.stylesId;
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }

  /**
   * Creates Toolbar container and adds it to the Canvas parent element and assigns default styles to them
   * @param controlDiv Canvas parent div element
   */
  private createToolBar(controlDiv: HTMLElement) {
    this._toolbarContainer.id = 'toolbarContainer';
    Toolbar.ensureStylesLoaded();
    this._toolbarContainer.className = Toolbar.classnames.container;
    this._toolbarContainer.classList.add(Toolbar.classnames.bottom);

    controlDiv.appendChild(this._toolbarContainer);
  }

  /**
   * Create & adds a button icons into the toolbar container
   * @param backgroundImageUri Icon image to be displayed
   * @param isToggle Is the icon button used as toggle
   * @param onClick Click event action for the icon button
   * @param isActive Is the feature active by default.
   * @param toolTip Optional tooltip message to be added for the icon button
   */
  public addToolbarButton(
    backgroundImageUri: string,
    isToggle: boolean,
    onClick: () => void,
    isActive: boolean,
    toolTip: string = ''
  ): void {
    const element = document.createElement('button');
    element.className = Toolbar.classnames.icon;
    element.title = toolTip;

    const iconImage = new Image();
    iconImage.className = Toolbar.classnames.iconImg;
    iconImage.src = backgroundImageUri;

    element.appendChild(iconImage);

    if (isActive) {
      element.classList.add(Toolbar.classnames.iconClicked);
    }

    element.onclick = () => {
      if (isToggle) {
        if (element.classList.contains(Toolbar.classnames.iconClicked)) {
          element.classList.remove(Toolbar.classnames.iconClicked);
        } else {
          element.classList.add(Toolbar.classnames.iconClicked);
        }
      }
      onClick();
    };

    this._toolbarContainer.appendChild(element);
  }

  /**
   * Set the position of the toolbar container
   * @param position ToolbarPosition value such as Top, Bottom, Left, Right within the canvas
   */
  public setPosition(position: ToolbarPosition): void {
    this._toolbarContainer.classList.remove(
      Toolbar.classnames.top,
      Toolbar.classnames.left,
      Toolbar.classnames.right,
      Toolbar.classnames.bottom
    );
    switch (position) {
      case 'top':
        this._toolbarContainer.classList.add(Toolbar.classnames.top);
        break;
      case 'left':
        this._toolbarContainer.classList.add(Toolbar.classnames.left);
        break;
      case 'right':
        this._toolbarContainer.classList.add(Toolbar.classnames.right);
        break;
      case 'bottom':
        this._toolbarContainer.classList.add(Toolbar.classnames.bottom);
        break;
      default:
        assertNever(position, `Invalid position: ${position}`);
    }
  }
}
