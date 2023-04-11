/*!
 * Copyright 2022 Cognite AS
 */

import { Image360Entity } from '../entity/Image360Entity';
import informationCSS from './Information.css';

/**
 * Used to show information about the currently entered 360 Image.
 */
export class Image360Information {
  static readonly _stylesId = 'reveal-360image-info';
  private readonly _element: HTMLDivElement;

  constructor(viewerDomElement: HTMLElement) {
    Image360Information.ensureStylesLoaded();
    this._element = document.createElement('div');
    this._element.className = Image360Information._stylesId;
    viewerDomElement.appendChild(this._element);
  }

  public updateInformation(image360Entity?: Image360Entity): void {
    if (!image360Entity) {
      this.setVisibility(false);
      return;
    }

    const revisionDate = image360Entity.getActiveRevision().date;
    const dateTimeString = revisionDate
      ? `Date: ${revisionDate.toLocaleDateString()}
        Time: ${revisionDate.toLocaleTimeString()}
        
        `
      : '';

    const metadata = image360Entity.getEventMetadata();
    const metaDataString = `Station: ${metadata.label}
      Collection: ${metadata.collectionLabel}`;

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
   * Load the the styles from the CSS and appends them to the label.
   * @returns Return if styles already loaded.
   */
  private static ensureStylesLoaded() {
    if (document.getElementById(Image360Information._stylesId)) {
      return;
    }
    const style = document.createElement('style');
    style.id = Image360Information._stylesId;
    style.appendChild(document.createTextNode(informationCSS));
    document.head.appendChild(style);
  }
}
