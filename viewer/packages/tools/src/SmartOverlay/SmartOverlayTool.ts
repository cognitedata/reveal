/*!
 * Copyright 2023 Cognite AS
 */
import { Cognite3DViewer } from '@reveal/api';
import { EventTrigger } from '@reveal/utilities';
import * as THREE from 'three';
import { debounce } from 'lodash';
import { Overlay3DCollection, Overlay3DIcon } from '@reveal/3d-overlays';
import { Color, WebGLRenderer } from 'three';

export type SmartOverlay = {
  text: string;
  id: number;
  position: THREE.Vector3;
  infoOverlay: HTMLElement;
};

export type OverlayInfo = {
  text: string;
  id: number;
  position: THREE.Vector3;
  color?: THREE.Color;
};

export type LabelGroupId = string;

export type OverlayGroup = {
  id: LabelGroupId;
};

export type OverlayToolEvent = 'hover' | 'click';

export type OverlayEventHandler = (event: { targetOverlay: SmartOverlay; mousePosition: { clientX: number, clientY: number} }) => void;

export type SmartOverlayToolParameters = {
  /**
   * Max circle size in pixels. Default is 64.
   */
  maxCircleSize?: number;
    /**
   * Sets default overlay color for newly added labels.
   */
  defaultOverlayColor: THREE.Color;
};

export class SmartOverlayTool {
  private readonly _viewer: Cognite3DViewer;
  private readonly _labelIndexToLabelInfoMap = new Map<number, OverlayInfo>();
  private readonly _labels: Map<number, OverlayInfo> = new Map();
  private readonly _overlayPoints: Overlay3DCollection[] = [];

  private _defaultOverlayColor: THREE.Color = new THREE.Color('#fbe50b');
  private _pointTexture: THREE.Texture;
  private _temporaryVec = new THREE.Vector2();
  private _raycaster = new THREE.Raycaster();

  private _isEnabled = true;
  private _isVisible = true;
  private _pointMarkersVisible: boolean = true;
  private _textOverlayVisible: boolean = true;
  private _hoveredOverlayPointIndex = -1;
  private _latestAddedPointIndex = 0;

  private readonly _events = {
    hover: new EventTrigger<OverlayEventHandler>(),
    click: new EventTrigger<OverlayEventHandler>()
  };

  constructor(viewer: Cognite3DViewer, toolParameters?: SmartOverlayToolParameters) {
    this._viewer = viewer;
    this._defaultOverlayColor = toolParameters?.defaultOverlayColor ?? this._defaultOverlayColor;
    this._pointTexture = this.createCircleTexture();
    
    const textOverlay = this.createTextOverlay('', toolParameters?.maxCircleSize ?? 20);
    viewer.domElement.appendChild(textOverlay);


    viewer.canvas.addEventListener(
      'mousemove',
      debounce((event: MouseEvent) => {
        
        const intersection = this.intersectPointsMarkers(event);

        if (intersection) {
          const { intersectedOverlay, intersectedIcon} = intersection;

          this._hoveredOverlayPointIndex = intersectedIcon.iconMetadata?.id ?? -1;

          const targetOverlay: SmartOverlay = {
            text: intersectedOverlay.text,
            id: intersectedOverlay.id,
            position: intersectedOverlay.position,
            infoOverlay: textOverlay
          };

          this._events.hover.fire({ targetOverlay: targetOverlay, mousePosition: event });

          textOverlay.style.left = `${event.offsetX}px`;
          textOverlay.style.top = `${event.offsetY}px`;
          textOverlay.style.opacity = '1';
        } else {
          this._hoveredOverlayPointIndex = -1;
          textOverlay.style.opacity = '0';
        }
      }, 10)
    );

    viewer.on('click', (event) => {
      const intersection = this.intersectPointsMarkers({clientX: event.offsetX, clientY: event.offsetY});

      if (intersection) {
        const { intersectedOverlay } = intersection;

        const targetOverlay: SmartOverlay = {
          text: intersectedOverlay.text,
          id: intersectedOverlay.id,
          position: intersectedOverlay.position,
          infoOverlay: textOverlay
        };

        this._events.click.fire({ targetOverlay: targetOverlay, mousePosition: {clientX: event.offsetX, clientY: event.offsetY} });
      }
    });
  }

  /**
   * Adds multiple overlay 
   * @param overlays Array of labels to add.
   * @returns Overlay group containing it's id.
   */
  addOverlays(overlays: OverlayInfo[]): OverlayGroup{
    const {
      _viewer: viewer,
    } = this;

    const overlaysData = [];

    for (const label of overlays) {
      overlaysData.push({ id: this._latestAddedPointIndex, position: label.position, color: label.color ?? this._defaultOverlayColor });
      this._labelIndexToLabelInfoMap.set(this._latestAddedPointIndex, label);
      this._latestAddedPointIndex++;
    }

    const points = new Overlay3DCollection(overlaysData, {overlayTexture: this._pointTexture });

    this._overlayPoints.push(points);

    viewer.addObject3D(points);

    return {
      id: points.uuid
    }
  }

  /**
   * Adds an overlay for specified bounding box.
   * @param text Text on the label.
   * @param id Unique id for the label.
   * @param position position of the label in 3D space.
   */
  addOverlay(labelData: OverlayInfo) {
    if (!this._isEnabled) return;

    const { _viewer: viewer } = this;
    const overlayWrapper = this.createOverlayWrapper();

    overlayWrapper.style.display = 'none';
  
  }
  /**
   * Removes label with specified id.
   * @param id Label id.
   */
  removeOverlay(id: number): void {
    const label = this._labels.get(id);
    if (!label) {
      throw new Error(`Label with id ${id} not found`);
    }

    this._labels.delete(id);
  }

  removeOverlays(id: string): void {
    const { _viewer: viewer } = this;
    const points = this._overlayPoints.find(points => points.uuid === id);

    if (points) {
      viewer.removeObject3D(points);
    }
  }

  set enabled(enabled: boolean) {
    this._isEnabled = enabled;
  }

  get enabled(): boolean {
    return this._isEnabled;
  }

  set visible(visible: boolean) {
    this._isVisible = visible;


  }

  get visible(): boolean {
    return this._isVisible;
  }

  clear(): void {
    this._labels.clear();
  }

  on(event: 'hover', eventHandler: OverlayEventHandler): void;
  on(event: 'click', eventHandler: OverlayEventHandler): void;

  on(event: OverlayToolEvent, eventHandler: OverlayEventHandler): void {
    switch (event) {
      case 'hover':
        this._events.hover.subscribe(eventHandler);
        break;
      case 'click':
        this._events.click.subscribe(eventHandler);
        break;
    }
  }

  off(event: 'hover', eventHandler: OverlayEventHandler): void;
  off(event: 'click', eventHandler: OverlayEventHandler): void;

  off(event: OverlayToolEvent, eventHandler: OverlayEventHandler): void {
    switch (event) {
      case 'hover':
        this._events.hover.unsubscribe(eventHandler);
        break;
      case 'click':
        this._events.click.unsubscribe(eventHandler);
        break;
    }
  }

  private intersectPointsMarkers(mouseCoords: {clientX: number, clientY: number}): { intersectedIcon: Overlay3DIcon, intersectedOverlay: OverlayInfo } | null {
    const { _viewer, _raycaster, _temporaryVec} = this;

    const { x, y } = this.convertPixelCoordinatesToNormalized(mouseCoords, _viewer.domElement);
        const camera = _viewer.cameraManager.getCamera();
        const cameraDirection = camera.getWorldDirection(new THREE.Vector3());
        _raycaster.setFromCamera(_temporaryVec.set(x, y), camera);

        const intersection: [Overlay3DIcon, THREE.Vector3][] = [];

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

        intersection.filter(([icon,_]) => icon.intersect(_raycaster.ray) !== null);

        intersection
          .map(([icon, intersection]) => [icon, intersection.sub(_raycaster.ray.origin)] as [Overlay3DIcon, THREE.Vector3])
          .filter(([, intersection]) => intersection.dot(cameraDirection) > 0)
          .sort((a, b) => a[1].length() - b[1].length());
         
    if (intersection.length > 0) {
      const labelIntersec = intersection[intersection.length - 1][0];
      const labelInfo = this._labelIndexToLabelInfoMap.get(labelIntersec.iconMetadata?.id ?? -1);

      if (labelInfo === undefined) //|| labelIntersec.iconMetadata?.id === this.hoveredOverlayPointIndex TODO: Do we want movement when hovering over the same label?
        return null;

      return {
        intersectedIcon: labelIntersec,
        intersectedOverlay: labelInfo
      }
    }

    return null;
  }

  private createCircleTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    const textureSize = 128;
    canvas.width = textureSize;
    canvas.height = textureSize;

    const overlayColor = new THREE.Color('white');

    const context = canvas.getContext('2d')!;
    context.beginPath();
    context.lineWidth = textureSize / 8;
    context.strokeStyle = '#' + overlayColor.getHexString();
    context.arc(textureSize / 2, textureSize / 2, textureSize / 2 - context.lineWidth, 0, 2 * Math.PI);
    context.shadowColor = 'rgba(0, 0, 0, 1)';
    context.shadowBlur = 10;
    context.fillStyle = context.strokeStyle;
    context.stroke();

    context.beginPath();
    context.lineWidth = textureSize / 8;
    context.strokeStyle = '#' + overlayColor.getHexString();
    context.arc(textureSize / 2, textureSize / 2, textureSize / 2 - context.lineWidth, 0, 2 * Math.PI);
    context.shadowColor = 'rgba(0, 0, 0, 1)';
    context.shadowBlur = 0;
    context.fillStyle = context.strokeStyle;
    context.stroke();
    context.fill();

    return new THREE.CanvasTexture(canvas);
  }

  private convertPixelCoordinatesToNormalized(mouseCoords: {clientX: number, clientY: number}, domElement: HTMLElement) {
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
            transition: left 0.05s, top 0.05s;
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
