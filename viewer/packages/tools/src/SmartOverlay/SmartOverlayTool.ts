/*!
 * Copyright 2023 Cognite AS
 */
import { Cognite3DViewer } from '@reveal/api';
import { assertNever, EventTrigger, DisposedDelegate, PointerEventDelegate, PointerEventData } from '@reveal/utilities';
import * as THREE from 'three';
import debounce from 'lodash/debounce';
import { Overlay3DCollection, Overlay3DIcon } from '@reveal/3d-overlays';
import { Cognite3DViewerToolBase } from '../Cognite3DViewerToolBase';

export type SmartOverlay = {
  text: string;
  id: OverlayId;
  position: THREE.Vector3;
  infoOverlay: HTMLElement;
};

export type OverlayInfo = {
  text: string;
  id: OverlayId;
  position: THREE.Vector3;
  color?: THREE.Color;
};

export type OverlayGroupId = string;
export type OverlayId = number;

export type OverlayGroup = {
  id: OverlayGroupId;
};

export type OverlayToolEvent = 'hover' | 'click' | 'disposed';

export type OverlayEventHandler = (event: {
  targetOverlay: SmartOverlay;
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

export class SmartOverlayTool extends Cognite3DViewerToolBase {
  private readonly _viewer: Cognite3DViewer;
  private readonly _labelIndexToLabelInfoMap = new Map<number, OverlayInfo>();
  private readonly _overlayPoints: Overlay3DCollection[] = [];
  private readonly _singeOverlayCollection: Overlay3DCollection;
  private readonly _textOverlay: HTMLElement;

  private readonly _defaultOverlayColor: THREE.Color = new THREE.Color('#fbe50b');
  private readonly _defaultTextOverlayToCursorOffset = 20;
  private readonly _temporaryVec = new THREE.Vector2();
  private readonly _raycaster = new THREE.Raycaster();

  private _isEnabled = true;
  private _isVisible = true;
  private _textOverlayVisible: boolean = true;
  private _latestAddedPointIndex = 0;

  private readonly _events = {
    hover: new EventTrigger<OverlayEventHandler>(),
    click: new EventTrigger<OverlayEventHandler>(),
    disposed: new EventTrigger<DisposedDelegate>()
  };

  constructor(viewer: Cognite3DViewer, toolParameters?: SmartOverlayToolParameters) {
    super();

    this._viewer = viewer;
    this._defaultOverlayColor = toolParameters?.defaultOverlayColor ?? this._defaultOverlayColor;

    this._textOverlay = this.createTextOverlay('', this._defaultTextOverlayToCursorOffset);
    viewer.domElement.appendChild(this._textOverlay);

    this._singeOverlayCollection = new Overlay3DCollection(undefined, {
      maxPointSize: toolParameters?.maxPointSize
    });
    this._overlayPoints.push(this._singeOverlayCollection);
    viewer.addObject3D(this._singeOverlayCollection);

    viewer.canvas.addEventListener('mousemove', this.onMouseMove);

    viewer.on('click', this.onMouseClick);
  }

  /**
   * Adds multiple overlay
   * @param overlays Array of labels to add.
   * @returns Overlay group containing it's id.
   */
  addOverlays(overlays: OverlayInfo[]): OverlayGroup {
    const { _viewer: viewer } = this;

    const overlaysData = [];

    for (const label of overlays) {
      overlaysData.push({
        id: this._latestAddedPointIndex,
        position: label.position,
        color: label.color ?? this._defaultOverlayColor
      });
      this._labelIndexToLabelInfoMap.set(this._latestAddedPointIndex, label);
      this._latestAddedPointIndex++;
    }

    const points = new Overlay3DCollection(overlaysData);

    this._overlayPoints.push(points);

    viewer.addObject3D(points);

    return {
      id: points.uuid
    };
  }

  /**
   * Adds an overlay for specified bounding box.
   * @param overlayData Data defining the overlay.
   * @param overlayData.position Position of the overlay.
   * @param overlayData.text Text to display on the overlay.
   * @param overlayData.id Id of the overlay.
   */
  addOverlay(overlayData: OverlayInfo): void {
    if (!this._isEnabled) return;

    this._singeOverlayCollection.addOverlays([
      {
        id: this._latestAddedPointIndex,
        position: overlayData.position,
        color: overlayData.color ?? this._defaultOverlayColor
      }
    ]);

    this._labelIndexToLabelInfoMap.set(this._latestAddedPointIndex, overlayData);
    this._latestAddedPointIndex++;
  }
  /**
   * Removes overlay with specified id. Works only for overlays added with addOverlay method.
   * @param id Id supplied on overlay creation.
   */
  removeOverlay(id: OverlayId): void {
    if (!true) {
      throw new Error(`Label with id ${id} not found`);
    }
    const idsToRemove: number[] = [];

    this._labelIndexToLabelInfoMap.forEach((overlayData, overlayIndex) => {
      if (overlayData.id === id) {
        this._labelIndexToLabelInfoMap.delete(overlayIndex);
        idsToRemove.push(overlayIndex);
      }
    });

    this._singeOverlayCollection.removeOverlays(idsToRemove);
  }

  /**
   * Removes overlays that were added with addOverlays method.
   * @param id Id of the overlay group to remove.
   */
  removeOverlays(id: OverlayGroupId): void {
    const { _viewer: viewer } = this;
    const points = this._overlayPoints.find(points => points.uuid === id);
    this._overlayPoints.filter(points => points.uuid !== id);

    if (points) {
      viewer.removeObject3D(points);
      points.dispose();
    }
  }

  /**
   * Sets whether new overlays can be added.
   */
  set enabled(enabled: boolean) {
    this._isEnabled = enabled;
  }

  get enabled(): boolean {
    return this._isEnabled;
  }

  /**
   * Sets whether overlays are visible.
   */
  set visible(visible: boolean) {
    this._isVisible = visible;
    this._overlayPoints.forEach(points => {
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
    this._singeOverlayCollection.removeAllOverlays();

    this._overlayPoints.forEach(points => {
      if (points.uuid === this._singeOverlayCollection.uuid) return;

      this._viewer.removeObject3D(points);
      points.dispose();
    });
    this._overlayPoints.splice(0, this._overlayPoints.length);
    this._overlayPoints.push(this._singeOverlayCollection);

    this._labelIndexToLabelInfoMap.clear();
  }

  /**
   * Subscribes to overlay events.
   * @param event event to subscribe to.
   * @param eventHandler 
   */
  on(event: 'hover', eventHandler: OverlayEventHandler): void;
  on(event: 'click', eventHandler: OverlayEventHandler): void;
  on(event: 'disposed', eventHandler: DisposedDelegate): void;

  on(event: OverlayToolEvent, eventHandler: OverlayEventHandler | DisposedDelegate): void {
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

  off(event: 'hover', eventHandler: OverlayEventHandler): void;
  off(event: 'click', eventHandler: OverlayEventHandler): void;
  off(event: 'disposed', eventHandler: DisposedDelegate): void;

  off(event: OverlayToolEvent, eventHandler: OverlayEventHandler | DisposedDelegate): void {
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

  private onMouseMove = (event: MouseEvent) => {
    const { _textOverlay: textOverlay } = this;

    const intersection = this.intersectPointsMarkers(event);

    if (intersection) {
      const { intersectedOverlay } = intersection;

      const targetOverlay: SmartOverlay = {
        text: intersectedOverlay.text,
        id: intersectedOverlay.id,
        position: intersectedOverlay.position,
        infoOverlay: textOverlay
      };

      this.positionTextOverlay(event);
      textOverlay.innerText = targetOverlay.text;

      this._events.hover.fire({ targetOverlay: targetOverlay, mousePosition: event });
    } else {
      textOverlay.style.opacity = '0';
    }
  }

  private onMouseClick = (event: PointerEventData) => {
    const intersection = this.intersectPointsMarkers({ clientX: event.offsetX, clientY: event.offsetY });

    if (intersection) {
      const { intersectedOverlay } = intersection;

      const targetOverlay: SmartOverlay = {
        text: intersectedOverlay.text,
        id: intersectedOverlay.id,
        position: intersectedOverlay.position,
        infoOverlay: this._textOverlay
      };

      this._events.click.fire({
        targetOverlay: targetOverlay,
        mousePosition: { clientX: event.offsetX, clientY: event.offsetY }
      });
    }
  }

  private positionTextOverlay(event: MouseEvent): void {
    const { _textOverlay, _textOverlayVisible } = this;
    _textOverlay.style.left = `${event.offsetX}px`;
    _textOverlay.style.top = `${event.offsetY}px`;
    _textOverlay.style.opacity = _textOverlayVisible ? '1' : '0';
  }

  private intersectPointsMarkers(mouseCoords: {
    clientX: number;
    clientY: number;
  }): { intersectedIcon: Overlay3DIcon; intersectedOverlay: OverlayInfo } | null {
    const { _viewer, _raycaster, _temporaryVec } = this;

    const { x, y } = this.convertPixelCoordinatesToNormalized(mouseCoords, _viewer.domElement);
    const camera = _viewer.cameraManager.getCamera();
    const cameraDirection = camera.getWorldDirection(new THREE.Vector3());
    _raycaster.setFromCamera(_temporaryVec.set(x, y), camera);

    let intersection: [Overlay3DIcon, THREE.Vector3][] = [];

    for (const points of this._overlayPoints) {
      for (const icon of points.icons) {
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
      .map(([icon, intersection]) => [icon, intersection.sub(_raycaster.ray.origin)] as [Overlay3DIcon, THREE.Vector3])
      .filter(([, intersection]) => intersection.dot(cameraDirection) > 0)
      .sort((a, b) => a[1].length() - b[1].length());

    if (intersection.length > 0) {
      const labelIntersec = intersection[intersection.length - 1][0];
      const labelInfo = this._labelIndexToLabelInfoMap.get(labelIntersec.iconMetadata?.id ?? -1);

      if (labelInfo === undefined)
        //TODO: Do we want movement of the text overlay when hovering over the same point marker?
        return null;

      return {
        intersectedIcon: labelIntersec,
        intersectedOverlay: labelInfo
      };
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
