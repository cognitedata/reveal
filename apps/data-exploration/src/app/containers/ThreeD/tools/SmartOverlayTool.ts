import {
  Cognite3DViewer,
  HtmlOverlayOptions,
  HtmlOverlayTool,
} from '@cognite/reveal';
import { EventTrigger } from './EventTrigger';
import * as THREE from 'three';

export type SmartLabel = {
  text: string;
  id: number;
  boundingBox: THREE.Box3;
  pointOverlay: HTMLElement;
  textOverlay: HTMLElement;
};

export type OverlayToolEvent = 'hover' | 'click';

export type LabelEventHandler = (event: {
  targetLabel: SmartLabel;
  mouseEvent: MouseEvent;
}) => void;

export class SmartOverlayTool {
  private _htmlOverlayTool: HtmlOverlayTool;
  private _labels: Map<number, SmartLabel> = new Map();
  private _isEnabled = true;
  private _isVisible = true;

  private readonly _events = {
    hover: new EventTrigger<LabelEventHandler>(),
    click: new EventTrigger<LabelEventHandler>(),
  };

  labelsVisible = true;
  pointIndicatorsVisible = true;
  /**
   * Circle size in pixels. Default is 17.
   */
  circleSize = 17;
  /**
   * Sets overlay color for newly added labels.
   */
  overlayColor: THREE.Color = new THREE.Color('#fbe50b');

  maxLabelDistance = 4;
  maxPointIndicatorDistance = 4;
  constructor(viewer: Cognite3DViewer) {
    this._htmlOverlayTool = new HtmlOverlayTool(viewer);
  }

  /**
   * Adds an overlay for specified bounding box.
   * @param text Text on the label.
   * @param id Unique id for the label.
   * @param boundingBox Bounding box of labeled object.
   */
  add(text: string, id: number, boundingBox: THREE.Box3) {
    if (!this._isEnabled) return;

    const { circleSize } = this;
    const overlayWrapper = this.createOverlayWrapper();

    overlayWrapper.style.display = 'none';

    const circleOverlay = this.createCircleOverlay(
      circleSize,
      this.overlayColor
    );
    overlayWrapper.appendChild(circleOverlay);

    const textOverlay = this.createTextOverlay(text, circleSize + 2);
    overlayWrapper.appendChild(textOverlay);

    const label: SmartLabel = {
      text,
      id,
      boundingBox,
      pointOverlay: circleOverlay,
      textOverlay: textOverlay,
    };

    circleOverlay.addEventListener('mousedown', (e) => e.stopPropagation());
    circleOverlay.addEventListener('mouseup', (e) => e.stopPropagation());

    circleOverlay.addEventListener('click', (event) => {
      this._events.click.fire({ targetLabel: label, mouseEvent: event });
    });

    circleOverlay.addEventListener('pointerover', (event) => {
      this._events.hover.fire({
        targetLabel: label,
        mouseEvent: event,
      });

      textOverlay.style.opacity = '1';
      overlayWrapper.style.zIndex = '10';
    });
    circleOverlay.addEventListener('pointerout', () => {
      textOverlay.style.opacity = '0';
      overlayWrapper.style.zIndex = 'auto';
    });
    overlayWrapper.addEventListener('transitionend', (e) => {
      if (e.propertyName !== 'opacity') return;

      if (overlayWrapper.style.opacity === '0') {
        overlayWrapper.style.display = 'none';
      }
    });

    const options: HtmlOverlayOptions = {
      positionUpdatedCallback: (
        element,
        position2D,
        position3D,
        distanceToCamera
      ) => {
        const isVisible = distanceToCamera < this.maxPointIndicatorDistance;

        if (isVisible) {
          element.style.display = 'block';
          setTimeout(() => {
            element.style.opacity = '1';
          }, 0);

          this.adjustCircleSize(distanceToCamera, element);
        } else {
          element.style.opacity = '0';
        }
      },
    };

    this._htmlOverlayTool.add(
      overlayWrapper,
      boundingBox.getCenter(new THREE.Vector3()),
      options
    );

    this._labels.set(label.id, label);
  }
  /**
   * Removes label with specified id.
   * @param id Label id.
   */
  remove(id: number): void {
    const label = this._labels.get(id);
    if (!label) {
      throw new Error(`Label with id ${id} not found`);
    }

    const overlayWrapper = label.pointOverlay.parentElement!;

    this._htmlOverlayTool.remove(overlayWrapper);

    this._labels.delete(id);
  }

  set enabled(enabled: boolean) {
    this._isEnabled = enabled;
  }

  get enabled(): boolean {
    return this._isEnabled;
  }

  set visible(visible: boolean) {
    this._isVisible = visible;
    this._htmlOverlayTool.visible(visible);
    this._htmlOverlayTool.elements.forEach((element) => {
      element.element.style.display = visible ? 'block' : 'none';
    });
  }

  get visible(): boolean {
    return this._isVisible;
  }

  clear(): void {
    this._htmlOverlayTool.clear();
    this._labels.clear();
  }

  on(event: 'hover', eventHandler: LabelEventHandler): void;
  on(event: 'click', eventHandler: LabelEventHandler): void;

  on(event: OverlayToolEvent, eventHandler: LabelEventHandler): void {
    switch (event) {
      case 'hover':
        this._events.hover.subscribe(eventHandler);
        break;
      case 'click':
        this._events.click.subscribe(eventHandler);
        break;
    }
  }

  off(event: 'hover', eventHandler: LabelEventHandler): void;
  off(event: 'click', eventHandler: LabelEventHandler): void;

  off(event: OverlayToolEvent, eventHandler: LabelEventHandler): void {
    switch (event) {
      case 'hover':
        this._events.hover.unsubscribe(eventHandler);
        break;
      case 'click':
        this._events.click.unsubscribe(eventHandler);
        break;
    }
  }

  private adjustCircleSize(distanceToCamera: number, element: HTMLElement) {
    if (distanceToCamera > this.maxPointIndicatorDistance / 2) {
      // Ranges from 0 to 1 when distanceToCamera is from 0 to maxPointIndicatorDistance / 2.
      const distanceCoefficient =
        1 -
        (distanceToCamera - this.maxPointIndicatorDistance / 2) /
          (this.maxPointIndicatorDistance / 2);

      // Non-linear size function for slightly bigger circles closer to camera.
      const newCircleSize =
        this.circleSize * (-Math.pow(distanceCoefficient - 1, 2) + 1);

      this.setCircleSize(
        element.querySelector('.circle-overlay')!,
        newCircleSize
      );
    }
  }

  private setCircleSize(circleOverlay: HTMLElement, size: number) {
    circleOverlay.style.height = `${size}px`;
    circleOverlay.style.width = `${size}px`;
    circleOverlay.style.borderRadius = `${size}px`;
  }

  private createCircleOverlay(
    circleSize: number,
    color: THREE.Color
  ): HTMLElement {
    const circleOverlay = document.createElement('div');
    circleOverlay.setAttribute('class', 'circle-overlay');
    circleOverlay.style.cssText = `
            position: absolute;
        
            /* Anchor to the center of the element and ignore events */
            transform: translate(-50%, -50%);
            touch-action: none;
            user-select: none;
            z-index: 1;

            width: ${circleSize}px;
            height: ${circleSize}px;
            border-radius: ${circleSize}px;
        
            background: #${color.getHexString()};
            box-shadow: 0 0 6px black;
        `;
    return circleOverlay;
  }

  private createTextOverlay(
    text: string,
    horizontalOffset: number
  ): HTMLElement {
    const textOverlay = document.createElement('div');
    textOverlay.innerText = text;
    textOverlay.setAttribute('class', 'text-overlay');
    textOverlay.style.cssText = `
            position: absolute;
            
            /* Anchor to the center of the element and ignore events */
            transform: translate(${horizontalOffset}px, -50%);
            touch-action: none;
            user-select: none;
                
            padding: 5px;
            minHeight: 35px;
            color: #fff;
            background: #232323da;
            border-radius: 5px;
            border: '#ffffff22 solid 2px;
            opacity: 0;
            transition: opacity 0.5s;
            transition-delay: 0.1s;
            opacity: 0;
            z-index: 10;
            `;

    return textOverlay;
  }

  private createOverlayWrapper(): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
            position: absolute;
            
            /* Anchor to the center of the element and ignore events */
            transform: translate(0, 0);
            touch-action: none;
            user-select: none;
            width: 200px;
            transition: opacity 0.5s;
        `;
    return wrapper;
  }
}
