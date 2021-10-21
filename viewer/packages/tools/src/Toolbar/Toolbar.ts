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
    this._toolbarContainer.id = 'toolbar';
    this._toolbarContainer.style.justifyContent = 'center';
    this._toolbarContainer.style.alignItems = 'center';
    this._toolbarContainer.style.position = 'absolute';
    this._toolbarContainer.style.top = '95%';
    this._toolbarContainer.style.left = '40%';

    controlDiv.appendChild(this._toolbarContainer);
  }

  public addToolbarItem(text: string, backgroundColor: string, backgroundImage: string) {
    const element = document.createElement('BUTTON');
    element.className = 'toolbar';
    element.style.width = '50px';
    element.style.height = '28px';
    element.textContent = text;
    element.style.backgroundImage = backgroundImage;
    element.style.background = backgroundColor;
    element.style.borderRadius = '8px';
    element.style.marginLeft = '8px';

    this._toolbarContainer.appendChild(element);
  }
}
