/*!
 * Copyright 2021 Cognite AS
 */
import { Cognite3DViewer } from '@reveal/core';

export enum ToolbarPosition {
  Top = 'Top',
  Bottom = 'Bottom',
  Left = 'Left',
  Right = 'Right'
}

export class Toolbar {
  private _toolbarContainer: HTMLDivElement;

  constructor(viewer: Cognite3DViewer) {
    const canvasElement = viewer.domElement.querySelector('canvas')?.parentElement;
    if (canvasElement === null) {
      throw new Error('Could not find canvas');
    }

    this._toolbarContainer = document.createElement('div');
    this.createToolBarIcon(canvasElement!);
  }

  private createToolBarIcon(controlDiv: HTMLElement) {
    this._toolbarContainer.id = 'toolbarContainer';

    this._toolbarContainer.style.justifyContent = 'center';
    this._toolbarContainer.style.alignItems = 'center';
    this._toolbarContainer.style.position = 'absolute';
    this._toolbarContainer.style.left = '50%';
    this._toolbarContainer.style.bottom = '10px';
    this._toolbarContainer.style.background = 'rgba(255, 255, 255, 255)';
    this._toolbarContainer.style.transform = 'translate(-50%, -50%)';
    this._toolbarContainer.style.padding = '1px 2px 1px 2 px';

    controlDiv.appendChild(this._toolbarContainer);
  }

  public addToolbarItem(text: string, backgroundImage: string, onClick: () => void): void {
    const element = document.createElement('BUTTON');
    element.className = 'toolbar';

    element.style.width = '35px';
    element.style.height = '28px';
    element.textContent = text;
    element.style.backgroundImage = backgroundImage;
    element.style.background = 'rgba(255, 255, 255, 255)';
    element.style.border = '1px solid black';
    element.style.borderColor = 'rgba(0,0,0,0.15)';

    element.onclick = function () {
      onClick();
    };

    this._toolbarContainer.appendChild(element);
  }

  public setPosition(position: ToolbarPosition) {
    switch (position) {
      case 'Top':
        this._toolbarContainer.style.left = '50%';
        this._toolbarContainer.style.right = '';
        this._toolbarContainer.style.top = '20px';
        this._toolbarContainer.style.bottom = '';
        this._toolbarContainer.style.width = '';
        this._toolbarContainer.style.maxWidth = '';
        break;
      case 'Left':
        this._toolbarContainer.style.left = '30px';
        this._toolbarContainer.style.right = '';
        this._toolbarContainer.style.top = '50%';
        this._toolbarContainer.style.bottom = '';
        this._toolbarContainer.style.width = '35px';
        this._toolbarContainer.style.maxWidth = '100%';
        break;
      case 'Right':
        this._toolbarContainer.style.left = '';
        this._toolbarContainer.style.right = '0px';
        this._toolbarContainer.style.top = '50%';
        this._toolbarContainer.style.bottom = '';
        this._toolbarContainer.style.width = '35px';
        this._toolbarContainer.style.maxWidth = '100%';
        break;
      case 'Bottom':
      default:
        this._toolbarContainer.style.left = '50%';
        this._toolbarContainer.style.right = '';
        this._toolbarContainer.style.top = '';
        this._toolbarContainer.style.bottom = '10px';
        this._toolbarContainer.style.width = '';
        this._toolbarContainer.style.maxWidth = '';
        break;
    }
  }
}
