/*!
 * Copyright 2023 Cognite AS
 */
import { Cognite3DViewer } from '@reveal/api';
import { assertNever, EventTrigger, DisposedDelegate, PointerEventData } from '@reveal/utilities';
import * as THREE from 'three';
import {
  Overlay3DCollection,
  Overlay3DIcon,
  OverlayInfo,
  DefaultMetadataType,
  OverlayCollection,
  Overlay3D
} from '@reveal/3d-overlays';
import { Cognite3DViewerToolBase } from '../Cognite3DViewerToolBase';

export type SmartOverlay = {
  text: string;
  id: OverlayId;
  position: THREE.Vector3;
  infoOverlay: HTMLElement;
};

export type OverlayGroupId = string;
export type OverlayId = number;

export type OverlayGroup = {
  id: OverlayGroupId;
};

export type OverlayToolEvent = 'hover' | 'click' | 'disposed';

export type OverlayEventHandler<MetadataType> = (event: {
  targetOverlay: Overlay3D<MetadataType>;
  htmlOverlay: HTMLElement;
  mousePosition: { clientX: number; clientY: number };
}) => void;

export type SmartOverlayToolParameters = {
  /**
   * Max point markers size in pixels. Different platforms has limitations for this value.
   * On Android and MacOS in Chrome maximum is 64. Windows in Chrome and MacOS Safari desktops can support up to 500.
   * Default is 64.
   */
  maxPointSize?: number;
  /**
   * Sets default overlay color for newly added labels.
   */
  defaultOverlayColor: THREE.Color;
};

export class SmartOverlayTool<MetadataType = DefaultMetadataType> extends Cognite3DViewerToolBase {
  private readonly _viewer: Cognite3DViewer;
  private readonly _textOverlay: HTMLElement;

  private readonly _defaultOverlayColor: THREE.Color = new THREE.Color('#fbe50b');
  private readonly _defaultTextOverlayToCursorOffset = 20;
  private readonly _temporaryVec = new THREE.Vector2();
  private readonly _raycaster = new THREE.Raycaster();

  private _overlayCollections: Overlay3DCollection<MetadataType>[] = [];
  private _isVisible = true;
  private _textOverlayVisible = true;

  private readonly _events = {
    hover: new EventTrigger<OverlayEventHandler<MetadataType>>(),
    click: new EventTrigger<OverlayEventHandler<MetadataType>>(),
    disposed: new EventTrigger<DisposedDelegate>()
  };

  constructor(viewer: Cognite3DViewer, toolParameters?: SmartOverlayToolParameters) {
    super();

    this._viewer = viewer;
    this._defaultOverlayColor = toolParameters?.defaultOverlayColor ?? this._defaultOverlayColor;

    this._textOverlay = this.createTextOverlay('', this._defaultTextOverlayToCursorOffset);
    viewer.domElement.appendChild(this._textOverlay);

    viewer.canvas.addEventListener('mousemove', this.onMouseMove);

    viewer.on('click', this.onMouseClick);
  }

  /**
   * Creates new OverlayCollection.
   * @param overlays Array of overlays to add.
   * @returns Overlay group containing it's id.
   */
  createOverlayCollection(overlays: OverlayInfo<MetadataType>[]): OverlayCollection<MetadataType> {
    const { _viewer: viewer } = this;

    const points = new Overlay3DCollection<MetadataType>(overlays, {
      defaultOverlayColor: this._defaultOverlayColor
    });

    this._overlayCollections.push(points);

    viewer.addObject3D(points);

    return points;
  }

  /**
   * Removes overlays that were added with addOverlays method.
   * @param overlayCollection Id of the overlay group to remove.
   */
  removeOverlayCollection(overlayCollection: OverlayCollection<MetadataType>): void {
    const { _viewer: viewer } = this;

    const removedCollection = this._overlayCollections.find(collection => collection === overlayCollection);
    this._overlayCollections = this._overlayCollections.filter(collection => collection === overlayCollection);

    if (removedCollection) {
      viewer.removeObject3D(removedCollection);
      removedCollection.dispose();
    }
  }

  /**
   * Gets all added overlay collections.
   */
  get collections(): Overlay3DCollection<MetadataType>[] {
    return this._overlayCollections;
  }

  /**
   * Sets whether overlays are visible.
   */
  set visible(visible: boolean) {
    this._isVisible = visible;
    this._overlayCollections.forEach(points => {
      points.visible = visible;
    });

    this._viewer.requestRedraw();
  }

  get visible(): boolean {
    return this._isVisible;
  }

  set textOverlayVisible(visible: boolean) {
    this._textOverlayVisible = visible;
    this._textOverlay.style.opacity = visible ? '1' : '0';
  }

  get textOverlayVisible(): boolean {
    return this._textOverlayVisible;
  }

  /**
   * Removes all overlays.
   */
  clear(): void {
    this._overlayCollections.forEach(overlayCollection => {
      this._viewer.removeObject3D(overlayCollection);
      overlayCollection.dispose();
    });
    this._overlayCollections.splice(0, this._overlayCollections.length);
  }

  /**
   * Subscribes to overlay events.
   * @param event event to subscribe to.
   * @param eventHandler
   */
  on(event: 'hover', eventHandler: OverlayEventHandler<MetadataType>): void;
  on(event: 'click', eventHandler: OverlayEventHandler<MetadataType>): void;
  on(event: 'disposed', eventHandler: DisposedDelegate): void;

  on(event: OverlayToolEvent, eventHandler: OverlayEventHandler<MetadataType> | DisposedDelegate): void {
    switch (event) {
      case 'hover':
        this._events.hover.subscribe(eventHandler);
        break;
      case 'click':
        this._events.click.subscribe(eventHandler);
        break;
      case 'disposed':
        this._events.disposed.subscribe(eventHandler as DisposedDelegate);
        break;
      default:
        assertNever(event);
    }
  }

  off(event: 'hover', eventHandler: OverlayEventHandler<MetadataType>): void;
  off(event: 'click', eventHandler: OverlayEventHandler<MetadataType>): void;
  off(event: 'disposed', eventHandler: DisposedDelegate): void;

  off(event: OverlayToolEvent, eventHandler: OverlayEventHandler<MetadataType> | DisposedDelegate): void {
    switch (event) {
      case 'hover':
        this._events.hover.unsubscribe(eventHandler);
        break;
      case 'click':
        this._events.click.unsubscribe(eventHandler);
        break;
      case 'disposed':
        this._events.disposed.unsubscribe(eventHandler as DisposedDelegate);
        break;
      default:
        assertNever(event);
    }
  }

  dispose(): void {
    this.clear();
    this._viewer.domElement.removeEventListener('mousemove', this.onMouseMove);
    this._viewer.off('click', this.onMouseClick);
    this._events.disposed.fire();

    this._events.hover.unsubscribeAll();
    this._events.click.unsubscribeAll();

    super.dispose();
  }

  private readonly onMouseMove = (event: MouseEvent) => {
    const { _textOverlay: textOverlay } = this;

    const intersectedOverlay = this.intersectPointsMarkers(event);

    if (intersectedOverlay) {
      this.positionTextOverlay(event);

      textOverlay.innerText = (intersectedOverlay.getMetadata() as DefaultMetadataType | undefined)?.text ?? '';

      this._events.hover.fire({ targetOverlay: intersectedOverlay, mousePosition: event, htmlOverlay: textOverlay });
    } else {
      textOverlay.style.opacity = '0';
    }
  };

  private readonly onMouseClick = (event: PointerEventData) => {
    const intersectedOverlay = this.intersectPointsMarkers({ clientX: event.offsetX, clientY: event.offsetY });

    if (intersectedOverlay) {
      this._events.click.fire({
        targetOverlay: intersectedOverlay,
        htmlOverlay: this._textOverlay,
        mousePosition: { clientX: event.offsetX, clientY: event.offsetY }
      });
    }
  };

  private positionTextOverlay(event: MouseEvent): void {
    const { _textOverlay, _textOverlayVisible } = this;
    _textOverlay.style.left = `${event.offsetX}px`;
    _textOverlay.style.top = `${event.offsetY}px`;
    _textOverlay.style.opacity = _textOverlayVisible ? '1' : '0';
  }

  private intersectPointsMarkers(mouseCoords: {
    clientX: number;
    clientY: number;
  }): Overlay3DIcon<MetadataType> | null {
    const { _viewer, _raycaster, _temporaryVec } = this;

    const { x, y } = this.convertPixelCoordinatesToNormalized(mouseCoords, _viewer.domElement);
    const camera = _viewer.cameraManager.getCamera();
    const cameraDirection = camera.getWorldDirection(new THREE.Vector3());
    _raycaster.setFromCamera(_temporaryVec.set(x, y), camera);

    let intersection: [Overlay3DIcon<MetadataType>, THREE.Vector3][] = [];

    for (const points of this._overlayCollections) {
      for (const icon of points.getOverlays() as Overlay3DIcon<MetadataType>[]) {
        if (icon.visible) {
          const inter = icon.intersect(_raycaster.ray);
          if (inter) {
            intersection.push([icon, inter]);
            icon.updateAdaptiveScale({
              camera,
              renderSize: _viewer.renderParameters.renderSize,
              domElement: _viewer.canvas
            });
          }
        }
      }
    }

    intersection = intersection.filter(([icon, _]) => icon.intersect(_raycaster.ray) !== null);

    intersection
      .map(
        ([icon, intersection]) =>
          [icon, intersection.sub(_raycaster.ray.origin)] as [Overlay3DIcon<MetadataType>, THREE.Vector3]
      )
      .filter(([, intersection]) => intersection.dot(cameraDirection) > 0)
      .sort((a, b) => a[1].length() - b[1].length());

    if (intersection.length > 0) {
      const intersectedOverlay = intersection[intersection.length - 1][0];

      return intersectedOverlay;
    }

    return null;
  }

  private convertPixelCoordinatesToNormalized(
    mouseCoords: { clientX: number; clientY: number },
    domElement: HTMLElement
  ) {
    const clientRect = domElement.getBoundingClientRect();
    const pixelX = mouseCoords.clientX - clientRect.left;
    const pixelY = mouseCoords.clientY - clientRect.top;

    const x = (pixelX / domElement.clientWidth) * 2 - 1;
    const y = (pixelY / domElement.clientHeight) * -2 + 1;

    return { x, y };
  }

  private createTextOverlay(text: string, horizontalOffset: number): HTMLElement {
    const textOverlay = document.createElement('div');
    textOverlay.innerText = text;
    textOverlay.setAttribute('class', 'text-overlay');
    textOverlay.style.cssText = `
            position: absolute;
            
            /* Anchor to the center of the element and ignore events */
            transform: translate(${horizontalOffset}px, -50%);
            touch-action: none;
            user-select: none;
                
            padding: 7px;
            max-width: 200px;
            color: #fff;
            background: #232323da;
            border-radius: 5px;
            border: '#ffffff22 solid 2px;
            opacity: 0;
            transition: opacity 0.3s;
            opacity: 0;
            z-index: 10;
            `;

    return textOverlay;
  }
}
