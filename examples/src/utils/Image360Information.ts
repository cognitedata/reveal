/*!
 * Copyright 2022 Cognite AS
 */

import { Image360 } from '@cognite/reveal';

/**
 * Used to show information about the currently entered 360 Image.
 */
export class Image360Information {
  private readonly _element: HTMLDivElement;
  static readonly _stylesId = 'Image360Info';
  static readonly _css = `
  .Image360Info {
    position: absolute;
  
    /* Anchor to left corner and ignore events */
    bottom: 100px;
    left: 20px;
    pointer-events: none;
    touch-action: none;
    user-select: none;
    border-radius: 6px;
  
  
    /* Make it look nice */
    padding: 6px;
    color: #fff;
    background: #232323da;
    border: #ffffff22 solid 1px;
    overflow-wrap: break-word;
    inline-size: 300px;
  
  
    /* Font - fallback to generic font if Inter not available*/
    font-family: 'Inter', sans-serif;
    font-style: normal;
    font-weight: 500;
  }
  `;

  constructor(viewerDomElement: HTMLElement) {
    Image360Information.ensureStylesLoaded();
    this._element = document.createElement('div');
    this._element.className = Image360Information._stylesId;
    viewerDomElement.appendChild(this._element);
  }

  public updateInformation(image360Entity?: Image360): void {
    if (!image360Entity) {
      this.setVisibility(false);
      return;
    }

    const metadata = image360Entity.getImageMetadata();

    const revisionDate = metadata.date;
    const dateTimeString = revisionDate
      ? `Date: ${revisionDate.toLocaleDateString()}
        Time: ${revisionDate.toLocaleTimeString()}
        
        `
      : '';

    const metaDataString = `Station: ${metadata.station}
      Collection: ${metadata.collection}`;

    const output = dateTimeString + metaDataString;
    this._element.innerText = output;
    this.setVisibility(true);
  }

  private setVisibility(visible: boolean): void {
    this._element.style.visibility = visible ? 'visible' : 'hidden';
  }

  public dispose(): void {
    this._element.remove();
  }

  /**
   * Load the the styles from the CSS and appends them to the GUI.
   * @returns Return if styles already loaded.
   */
  private static ensureStylesLoaded() {
    if (document.getElementById(Image360Information._stylesId)) {
      return;
    }
    const style = document.createElement('style');
    style.id = Image360Information._stylesId;
    style.appendChild(document.createTextNode(Image360Information._css));
    document.head.appendChild(style);
  }
}
