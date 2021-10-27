/*!
 * Copyright 2021 Cognite AS
 */
import { Cognite3DViewer } from '@reveal/core';

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

    controlDiv.appendChild(this._toolbarContainer);
  }

  public addToolbarItem(text: string, backgroundImage: string, callback: () => void): void {
    const element = document.createElement('BUTTON');
    element.className = 'toolbar';

    element.style.width = '35px';
    element.style.height = '28px';
    element.textContent = text;
    element.style.backgroundImage = backgroundImage;
    element.style.background = 'rgba(255, 255, 255, 255)';
    element.style.borderRadius = '8px';
    element.style.marginLeft = '4px';
    element.style.marginRight = '4px';
    element.style.marginTop = '2px';
    element.style.marginBottom = '2px';
    element.style.border = '1px solid black';

    element.onclick = function () {
      callback();
    };

    this._toolbarContainer.appendChild(element);
  }
}
