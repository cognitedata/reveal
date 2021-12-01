/*!
 * Copyright 2021 Cognite AS
 */
import { Cognite3DViewer } from '@reveal/core';
import css from './Toolbar.css';

/**
 * Toolbar position within the canvas
 */
export enum ToolbarPosition {
  Top = 'Top',
  Bottom = 'Bottom',
  Left = 'Left',
  Right = 'Right'
}

/**
 * Toolbar class which creates a container to hold all icons within the toolbar
 */
export class Toolbar {
  private _toolbarContainer: HTMLDivElement;
  private static readonly stylesId = 'reveal-viewer-toolbar-styles';

  private static readonly classnames = {
    container: 'reveal-viewer-toolbar-container',
    bottom: 'reveal-viewer-toolbar-container--bottom',
    top: 'reveal-viewer-toolbar-container--top',
    left: 'reveal-viewer-toolbar-container--left',
    right: 'reveal-viewer-toolbar-container--right',
    icon: 'reveal-viewer-toolbar-icon'
  };

  private _activeContainerPosition = Toolbar.classnames.bottom;

  constructor(viewer: Cognite3DViewer) {
    const canvasElement = viewer.domElement.querySelector('canvas')?.parentElement;
    if (canvasElement === null) {
      throw new Error('Could not find canvas');
    }

    this._toolbarContainer = document.createElement('div');
    this.createToolBarIcon(canvasElement!);
  }

  /**
   * Load the the styles from the CSS and appends them to the toolbarLoad the the styles from the CSS and appends them to the toolbar
   * @returns Return if styles already loaded
   */
  private static loadStyles() {
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
  private createToolBarIcon(controlDiv: HTMLElement) {
    this._toolbarContainer.id = 'toolbarContainer';
    Toolbar.loadStyles();
    this._toolbarContainer.className = Toolbar.classnames.container;
    this._toolbarContainer.classList.add(Toolbar.classnames.bottom);

    controlDiv.appendChild(this._toolbarContainer);
  }

  /**
   * Create & adds a button icons into the toolbar container
   * @param toolTip Tooltip message to added for the icon
   * @param backgroundImage Icon image to be displayed
   * @param onClick Click event action for the icon
   */
  public addToolbarItem(toolTip: string, backgroundImage: string, onClick: () => void): void {
    const element = document.createElement('BUTTON');
    element.className = Toolbar.classnames.icon;
    element.title = toolTip;
    const iconImage = new Image();
    iconImage.src = backgroundImage;

    element.appendChild(iconImage);

    element.onclick = function () {
      onClick();
    };

    this._toolbarContainer.appendChild(element);
  }

  /**
   * Set the position of the toolbar container
   * @param position ToolbarPosition value such as Top, Bottom, Left, Right within the canvas
   */
  public setPosition(position: ToolbarPosition): void {
    switch (position) {
      case 'Top':
        this._toolbarContainer.classList.remove(this._activeContainerPosition);
        this._activeContainerPosition = Toolbar.classnames.top;
        this._toolbarContainer.classList.add(Toolbar.classnames.top);
        break;
      case 'Left':
        this._toolbarContainer.classList.remove(this._activeContainerPosition);
        this._activeContainerPosition = Toolbar.classnames.left;
        this._toolbarContainer.classList.add(Toolbar.classnames.left);
        break;
      case 'Right':
        this._toolbarContainer.classList.remove(this._activeContainerPosition);
        this._activeContainerPosition = Toolbar.classnames.right;
        this._toolbarContainer.classList.add(Toolbar.classnames.right);
        break;
      case 'Bottom':
      default:
        this._toolbarContainer.classList.remove(this._activeContainerPosition);
        this._activeContainerPosition = Toolbar.classnames.bottom;
        this._toolbarContainer.classList.add(Toolbar.classnames.bottom);
        break;
    }
  }
}
