/*!
 * Copyright 2023 Cognite AS
 */
import { Cognite3DViewer } from '@reveal/api';
import { EventTrigger, pixelToNormalizedDeviceCoordinates } from '@reveal/utilities';
import { HtmlOverlayOptions, HtmlOverlayTool } from '../../index';
import * as THREE from 'three';
import { debounce } from 'lodash';
import { Overlay3DCollection, Overlay3DIcon } from '@reveal/3d-overlays';
import { OctreeRaycaster } from 'sparse-octree';

export type SmartLabel = {
  text: string;
  id: number;
  position: THREE.Vector3;
  pointOverlay: HTMLElement;
  textOverlay: HTMLElement;
};

export type LabelInfo = {
  text: string;
  id: number;
  position: THREE.Vector3;
};
export type LabelGroupId = string;

export type LabelGroup = {
  id: LabelGroupId;
};

export type OverlayToolEvent = 'hover' | 'click';

export type LabelEventHandler = (event: { targetLabel: SmartLabel; mouseEvent: MouseEvent }) => void;

export class SmartOverlayTool {
  private readonly _htmlOverlayTool: HtmlOverlayTool;
  private readonly _viewer: Cognite3DViewer;
  private readonly _labels: Map<number, SmartLabel> = new Map();
  private _isEnabled = true;
  private _isVisible = true;

  private readonly _objectUUIDToLabelIndexToLabelInfoMap = new Map<string, Map<number, LabelInfo>>();
  private readonly _labelIndexToLabelInfoMap = new Map<number, LabelInfo>();
  private hoveredOverlayPointIndex = -1;
  private readonly overlayPoints: Overlay3DCollection[] = [];
  private currentPointIndex = 0;

  private readonly _events = {
    hover: new EventTrigger<LabelEventHandler>(),
    click: new EventTrigger<LabelEventHandler>()
  };

  labelsVisible: boolean = true;
  pointIndicatorsVisible: boolean = true;
  /**
   * Circle size in pixels. Default is 17.
   */
  circleSize: number = 17;
  /**
   * Sets overlay color for newly added labels.
   */
  overlayColor: THREE.Color = new THREE.Color('#fbe50b');

  maxLabelDistance: number = 4;
  maxPointIndicatorDistance: number = 4;

  constructor(viewer: Cognite3DViewer) {
    this._htmlOverlayTool = new HtmlOverlayTool(viewer);
    this._viewer = viewer;

    const raycaster = new THREE.Raycaster();
    raycaster.params.Points!.threshold = 0.1;

    const vec = new THREE.Vector2();

    const textOverlay = this.createTextOverlay('', this.circleSize);
    viewer.domElement.appendChild(textOverlay);

    viewer.on('sceneRendered', (args) => {
      this.overlayPoints.forEach(points => points.icons.forEach((icon) => icon.updateAdaptiveScale(args)));
    });

    viewer.canvas.addEventListener(
      'mousemove',
      debounce((ev: MouseEvent) => {
        const { x, y } = this.convertPixelCoordinatesToNormalized(ev, viewer.domElement);
        const camera = viewer.cameraManager.getCamera();
        const cameraDirection = camera.getWorldDirection(new THREE.Vector3());
        const cameraPosition = camera.position.clone();
        raycaster.setFromCamera(vec.set(x, y), camera);

        const intersection: [Overlay3DIcon, THREE.Vector3][] = [];

        for (const points of this.overlayPoints) {
          for (const icon of points.icons) {
            if (icon.visible) {
              const inter = icon.intersect(raycaster.ray);
              if (inter) intersection.push([icon, inter]);
            }
          }
        }

        intersection
          .map(([icon, intersection]) => [icon, intersection.sub(cameraPosition)] as [Overlay3DIcon, THREE.Vector3])
          .filter(([, intersection]) => intersection.dot(cameraDirection) > 0)
          .sort((a, b) => a[1].length() - b[1].length());
        
        if (intersection.length > 0) {
          const labelIntersec = intersection[0][0];
          const labelInfo = this._labelIndexToLabelInfoMap.get(labelIntersec.iconMetadata?.id ?? -1);

          if (labelInfo === undefined || labelIntersec.iconMetadata?.id === this.hoveredOverlayPointIndex) return;

          this.hoveredOverlayPointIndex = labelIntersec.iconMetadata?.id ?? -1;

          const targetLabel: SmartLabel = {
            text: labelInfo.text,
            id: labelInfo.id,
            position: labelInfo.position,
            pointOverlay: {} as HTMLElement,
            textOverlay
          };

          this._events.hover.fire({ targetLabel, mouseEvent: ev });

          textOverlay.style.left = `${ev.offsetX}px`;
          textOverlay.style.top = `${ev.offsetY}px`;
          textOverlay.style.opacity = '1';
        } else {
          this.hoveredOverlayPointIndex = -1;
          textOverlay.style.opacity = '0';
        }
      }, 10)
    );
  }

  addOverlays(labels: LabelInfo[]): LabelGroup{
    const {
      _objectUUIDToLabelIndexToLabelInfoMap: _objectUUIDToLabelIndexToAssetIdMap,
      _viewer: viewer,
    } = this;

    const overlaysPositions = [];
    const labelsMap = new Map<number, LabelInfo>();

    for (const label of labels) {
      overlaysPositions.push({id: this.currentPointIndex, position: label.position});
      this._labelIndexToLabelInfoMap.set(this.currentPointIndex, label);
      this.currentPointIndex++;
    }

    const positionBuffer = new THREE.BufferGeometry();
    positionBuffer.setFromPoints(overlaysPositions.map(p => p.position));

    const points = new Overlay3DCollection(overlaysPositions);

    this.overlayPoints.push(points);

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
  addOverlay(text: string, id: number, position: THREE.Vector3) {
    if (!this._isEnabled) return;

    const { circleSize, _viewer: viewer } = this;
    const overlayWrapper = this.createOverlayWrapper();

    overlayWrapper.style.display = 'none';

    const circleOverlay = this.createCircleOverlay(circleSize, this.overlayColor);
    overlayWrapper.appendChild(circleOverlay);

    const textOverlay = this.createTextOverlay(text, circleSize + 2);
    overlayWrapper.appendChild(textOverlay);

    const label: SmartLabel = {
      text,
      id,
      position,
      pointOverlay: circleOverlay,
      textOverlay: textOverlay
    };

    circleOverlay.addEventListener('mousedown', e => e.stopPropagation());
    circleOverlay.addEventListener('mouseup', e => e.stopPropagation());

    circleOverlay.addEventListener('click', event => {
      this._events.click.fire({ targetLabel: label, mouseEvent: event });
    });

    circleOverlay.addEventListener('pointerover', event => {
      this._events.hover.fire({
        targetLabel: label,
        mouseEvent: event
      });

      textOverlay.style.opacity = '1';
      overlayWrapper.style.zIndex = '10';
    });
    circleOverlay.addEventListener('pointerout', () => {
      textOverlay.style.opacity = '0';
      overlayWrapper.style.zIndex = 'auto';
    });
    overlayWrapper.addEventListener('transitionend', e => {
      if (e.propertyName !== 'opacity') return;

      if (overlayWrapper.style.opacity === '0') {
        overlayWrapper.style.display = 'none';
      }
    });

    const options: HtmlOverlayOptions = {
      positionUpdatedCallback: (element, position2D, position3D, distanceToCamera) => {
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
      }
    };

    // this._htmlOverlayTool.add(
    //   overlayWrapper,
    //   boundingBox.getCenter(new THREE.Vector3()),
    //   options
    // );

    const pointsMaterial = new THREE.PointsMaterial({
      size: 5,
      color: new THREE.Color(this.overlayColor),
      sizeAttenuation: true
      //depthTest: false
    });

    const positionBuffer = new THREE.BufferGeometry();
    positionBuffer.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(position.toArray()), 3)
    );

    const points = new THREE.Points(positionBuffer, pointsMaterial);

    viewer.addObject3D(points);

    this._labels.set(label.id, label);
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

    const overlayWrapper = label.pointOverlay.parentElement!;

    this._htmlOverlayTool.remove(overlayWrapper);

    this._labels.delete(id);
  }

  removeOverlays(uuid: string): void {
    const { _viewer: viewer } = this;
    const points = this.overlayPoints.find(points => points.uuid === uuid);

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
    this._htmlOverlayTool.visible(visible);
    this._htmlOverlayTool.elements.forEach(element => {
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

  private createCircleTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    const textureSize = 128;
    canvas.width = textureSize;
    canvas.height = textureSize;

    const context = canvas.getContext('2d')!;
    context.beginPath();
    context.lineWidth = textureSize / 8;
    context.strokeStyle = '#' + this.overlayColor.getHexString();
    context.arc(textureSize / 2, textureSize / 2, textureSize / 2 - context.lineWidth, 0, 2 * Math.PI);
    context.shadowColor = 'rgba(0, 0, 0, 1)';
    context.shadowBlur = 10;
    context.fillStyle = context.strokeStyle;
    context.stroke();

    context.beginPath();
    context.lineWidth = textureSize / 8;
    context.strokeStyle = '#' + this.overlayColor.getHexString();
    context.arc(textureSize / 2, textureSize / 2, textureSize / 2 - context.lineWidth, 0, 2 * Math.PI);
    context.shadowColor = 'rgba(0, 0, 0, 1)';
    context.shadowBlur = 0;
    context.fillStyle = context.strokeStyle;
    context.stroke();
    context.fill();

    return new THREE.CanvasTexture(canvas);
  }

  private convertPixelCoordinatesToNormalized(event: MouseEvent, domElement: HTMLElement) {
    const clientRect = domElement.getBoundingClientRect();
    const pixelX = event.clientX - clientRect.left;
    const pixelY = event.clientY - clientRect.top;

    const x = (pixelX / domElement.clientWidth) * 2 - 1;
    const y = (pixelY / domElement.clientHeight) * -2 + 1;

    return { x, y };
  }

  private adjustCircleSize(distanceToCamera: number, element: HTMLElement) {
    if (distanceToCamera > this.maxPointIndicatorDistance / 2) {
      // Ranges from 0 to 1 when distanceToCamera is from 0 to maxPointIndicatorDistance / 2.
      const distanceCoefficient =
        1 - (distanceToCamera - this.maxPointIndicatorDistance / 2) / (this.maxPointIndicatorDistance / 2);

      // Non-linear size function for slightly bigger circles closer to camera.
      const newCircleSize = this.circleSize * (-Math.pow(distanceCoefficient - 1, 2) + 1);

      this.setCircleSize(element.querySelector('.circle-overlay')!, newCircleSize);
    }
  }

  private setCircleSize(circleOverlay: HTMLElement, size: number) {
    circleOverlay.style.height = `${size}px`;
    circleOverlay.style.width = `${size}px`;
    circleOverlay.style.borderRadius = `${size}px`;
  }

  private createCircleOverlay(circleSize: number, color: THREE.Color): HTMLElement {
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
                
            padding: 5px;
            max-width: 200px;
            min-height: 35px;
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
