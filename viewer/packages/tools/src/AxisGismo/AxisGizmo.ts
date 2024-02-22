/*
 * Copyright 2024 Cognite AS
 */

import { Color, Matrix4, PerspectiveCamera, Vector3 } from 'three';
import { AxisGizmoOptions } from './AxisGizmoOptions';
import { Corner } from '@reveal/utilities';
import { Cognite3DViewer } from '@reveal/api';

export class AxisGizmo {
  //================================================
  // INSTANCE FIELDS
  //================================================
  private readonly _options: AxisGizmoOptions;
  private readonly _axises: Axis[];
  private readonly _center: Vector3;
  private _selectedAxis: Axis | null = null;
  private _isMouseInside = false;
  private _inDragging = false;

  private _viewer: Cognite3DViewer | null = null;
  private _element: HTMLElement | null = null;
  private _canvas: HTMLCanvasElement | null = null;
  private _context: CanvasRenderingContext2D | null = null;

  // binding of the event functions:
  private readonly _onPointerDown = this.onPointerDown.bind(this);
  private readonly _onPointerUp = this.onPointerUp.bind(this);
  private readonly _onPointerMove = this.onPointerMove.bind(this);
  private readonly _onPointerOut = this.onPointerOut.bind(this);
  private readonly _onMouseClick = this.onMouseClick.bind(this);

  //================================================
  // CONSTRUCTORS
  //================================================

  constructor() {
    this._options = new AxisGizmoOptions();
    const halfSize = this._options.size / 2;
    this._center = new Vector3(halfSize, halfSize, 0);
    this._axises = Axis.createAllAxises(this._options);
  }

  //================================================
  // INSTANCE METHODS: Public
  //================================================

  public connect(viewer: Cognite3DViewer): void {
    this._viewer = viewer;
    this._element = this.createElement();
    viewer.domElement.appendChild(this._element);
    this._canvas = this._element.querySelector('canvas');
    if (!this._canvas) {
      return;
    }
    this._context = this._canvas.getContext('2d');
    this.addEventListeners();
  }

  public dispose(): void {
    if (this._viewer && this._element) {
      this._viewer.domElement.removeChild(this._element);
    }
    this.removeEventListeners();
    this._viewer = null;
    this._canvas = null;
    this._context = null;
    this._element = null;
  }

  //================================================
  // INSTANCE METHODS: Events
  //================================================

  private onPointerDown(event: PointerEvent) {
    event.stopPropagation();
    this._inDragging = true;
  }

  private onPointerUp(event: PointerEvent) {
    event.stopPropagation();
    if (this._inDragging) {
      this._inDragging = false;
      if (this._selectedAxis === null || this._viewer == null) {
        return;
      }
      const cameraManager = this._viewer.cameraManager;
      const { position, target } = cameraManager.getCameraState();
      const distance = position.distanceTo(target);
      const direction = this._selectedAxis.direction.clone().multiplyScalar(distance);
      const positionToMoveTo = target.clone().add(direction);
      cameraManager.setCameraState({ position: positionToMoveTo, target: target });
    }
  }

  private onPointerMove(event: PointerEvent) {
    if (!this._canvas) {
      return;
    }
    const rectangle = this._canvas.getBoundingClientRect();
    const mousePosition = new Vector3(event.clientX - rectangle.left, event.clientY - rectangle.top, 0);
    const selectedAxis = this.getSelectedAxis(mousePosition);

    const isMouseInside = this.isMouseOver(mousePosition);
    if (selectedAxis === this._selectedAxis && isMouseInside === this._isMouseInside) {
      return;
    }
    this._isMouseInside = isMouseInside;
    this._selectedAxis = selectedAxis;
    this.updateAndRender(null);
  }

  private onPointerOut(_event: PointerEvent) {
    this._inDragging = false;
    this._isMouseInside = false;
    this._selectedAxis = null;
    this.updateAndRender(null);
  }

  private onMouseClick(event: MouseEvent) {
    event.stopPropagation();
  }

  private readonly onCameraChange = (_position: THREE.Vector3, _target: THREE.Vector3) => {
    if (this._viewer) {
      this.updateAndRender(this._viewer.cameraManager.getCamera());
    }
  };

  //================================================
  // INSTANCE METHODS: Private helpers
  //================================================

  private updateAndRender(camera: PerspectiveCamera | null): void {
    if (this._context == null || this._canvas == null) {
      return;
    }
    if (camera) {
      // Calculate the rotation matrix from the camera and move the axises to the correct position
      const matrix = new Matrix4().makeRotationFromEuler(camera.rotation);
      matrix.invert();
      for (const axis of this._axises) {
        this.updateAxisPosition(axis.direction.clone().applyMatrix4(matrix), axis.bobblePosition);
      }
    }
    // Sort the axis by it's z position
    this._axises.sort((a, b) => (a.bobblePosition.z > b.bobblePosition.z ? 1 : -1));
    this.render();
  }

  private addEventListeners(): void {
    if (this._viewer) {
      this._viewer.on('cameraChange', this.onCameraChange);
    }
    const canvas = this._canvas;
    if (!canvas) {
      return;
    }
    canvas.addEventListener('pointermove', this._onPointerMove, false);
    canvas.addEventListener('pointerout', this._onPointerOut, false);
    canvas.addEventListener('pointerdown', this._onPointerDown, false);
    canvas.addEventListener('pointerup', this._onPointerUp, false);
    canvas.addEventListener('click', this._onMouseClick, false);
  }

  private removeEventListeners(): void {
    if (this._viewer) {
      this._viewer.off('cameraChange', this.onCameraChange);
    }
    const canvas = this._canvas;
    if (!canvas) {
      return;
    }
    canvas.removeEventListener('pointermove', this._onPointerMove, false);
    canvas.removeEventListener('pointerout', this._onPointerOut, false);
    canvas.removeEventListener('pointerdown', this._onPointerDown, false);
    canvas.removeEventListener('pointerup', this._onPointerUp, false);
    canvas.removeEventListener('click', this._onMouseClick, false);
  }

  private createElement(): HTMLElement {
    const element: HTMLElement = document.createElement('div');
    element.innerHTML = '<canvas ></canvas>';
    initializeStyle(element, this._options);
    return element;
  }

  private render() {
    if (this._context == null) {
      return;
    }
    if (this._canvas) {
      clear(this._context, this._canvas);
    }
    if (this._isMouseInside && this._options.focusCircleAlpha > 0) {
      this._context.globalAlpha = this._options.focusCircleAlpha;
      fillCircle(this._context, this._center, this._options.radius, this._options.focusCircleColor);
      this._context.globalAlpha = 1;
    }
    const { bubbleRadius, primaryLineWidth, secondaryLineWidth, bobbleLineWidth } = this._options;
    for (const axis of this._axises) {
      const lightColor = axis.getLightColorInHex();

      if (axis.isPrimary) {
        if (primaryLineWidth > 0) {
          drawAxisLine(this._context, this._center, axis.bobblePosition, primaryLineWidth, lightColor);
        }
        fillCircle(this._context, axis.bobblePosition, bubbleRadius, lightColor);
      } else {
        const darkColor = axis.getDarkColorInHex();
        if (secondaryLineWidth > 0) {
          drawAxisLine(this._context, this._center, axis.bobblePosition, secondaryLineWidth, lightColor);
        }
        fillCircle(this._context, axis.bobblePosition, bubbleRadius, darkColor);
        if (bobbleLineWidth > 0) {
          drawCircle(this._context, axis.bobblePosition, bubbleRadius - 1, bobbleLineWidth, lightColor);
        }
      }
      if (axis.isPrimary || this._selectedAxis === axis) {
        drawText(this._context, axis.label, axis.bobblePosition, this._options, this.getTextColor(axis));
      }
    }
  }

  private getTextColor(axis: Axis): string {
    if (this._selectedAxis === axis) {
      return this._options.selectedTextColor;
    } else {
      return this._options.normalTextColor;
    }
  }

  private isMouseOver(mousePosition: Vector3): boolean {
    return horizontalDistanceTo(mousePosition, this._center) < this._options.radius;
  }

  private getSelectedAxis(mousePosition: Vector3): Axis | null {
    if (!this.isMouseOver(mousePosition)) {
      return null;
    }
    // If the mouse is over the gizmo, find the closest axis bobble for highligting
    let closestDistance = Infinity;
    let selectedAxis: Axis | null = null;
    for (const axis of this._axises) {
      const distance = horizontalDistanceTo(mousePosition, axis.bobblePosition);

      // Only select the axis if its closer to the mouse than the previous or if its within its bubble circle
      if (distance < closestDistance && distance < this._options.bubbleRadius) {
        closestDistance = distance;
        selectedAxis = axis;
      }
    }
    return selectedAxis;
  }

  private updateAxisPosition(position: Vector3, target: Vector3): void {
    const padding = this._options.bubbleRadius - 1;
    target.set(
      position.x * (this._center.x - this._options.bubbleRadius / 2 - padding) + this._center.x,
      this._center.y - position.y * (this._center.y - this._options.bubbleRadius / 2 - padding),
      position.z
    );
  }
}

//================================================
// FUNCTIONS: Helpers used internaly in this file
//================================================

function horizontalDistanceTo(a: Vector3, b: Vector3) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function clear(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function fillCircle(context: CanvasRenderingContext2D, p: Vector3, radius: number, color: string) {
  context.beginPath();
  context.arc(p.x, p.y, radius, 0, 2 * Math.PI, false);
  context.fillStyle = color;
  context.fill();
}

function drawCircle(context: CanvasRenderingContext2D, p: Vector3, radius: number, width: number, color: string) {
  context.beginPath();
  context.arc(p.x, p.y, radius, 0, 2 * Math.PI, false);
  context.lineWidth = width;
  context.strokeStyle = color;
  context.stroke();
}

function drawAxisLine(context: CanvasRenderingContext2D, p1: Vector3, p2: Vector3, width: number, color: string) {
  context.beginPath();
  context.moveTo(p1.x, p1.y);
  context.lineTo(p2.x, p2.y);
  context.lineWidth = width;
  context.strokeStyle = color;
  context.stroke();
}

function drawText(
  context: CanvasRenderingContext2D,
  label: string,
  position: Vector3,
  options: AxisGizmoOptions,
  color: string
) {
  context.font = options.getFont();
  context.fillStyle = color;
  context.textBaseline = 'middle';
  context.textAlign = 'center';
  context.fillText(label, position.x, position.y + options.fontYAdjust);
}

function initializeStyle(element: HTMLElement, options: AxisGizmoOptions) {
  const style = element.style;
  if (!style) {
    return;
  }
  style.position = 'absolute';
  style.zIndex = '1000';
  style.height = style.width = options.size + 'px';
  const margin = options.edgeMargin + 'px';
  switch (options.corner) {
    case Corner.TopRight:
      style.top = style.right = margin;
      break;
    case Corner.BottomLeft:
      style.bottom = style.left = margin;
      break;
    case Corner.BottomRight:
      style.bottom = style.right = margin;
      break;
    default:
      style.top = style.left = margin;
  }
}

//================================================
// HELPER CLASS
//================================================

class Axis {
  readonly direction: Vector3;
  readonly bobblePosition: Vector3;
  readonly label: string;
  readonly axis: number;
  private readonly _lightColor: Color;
  private readonly _darkColor: Color;
  private readonly _mixedLightColor: Color = new Color();
  private readonly _mixedDarkColor: Color = new Color();

  private constructor(axis: number, options: AxisGizmoOptions) {
    this.axis = axis;
    this.direction = this.createDirection();
    this.bobblePosition = new Vector3();
    this.label = this.createLabel(options.yUp);
    let index = Math.abs(axis) - 1;
    if (options.yUp) {
      if (index === 1) index = 2;
      else if (index === 2) index = 1;
    }
    this._lightColor = new Color(options.lightColors[index]);
    this._darkColor = new Color(options.darkColors[index]);
  }

  get isPrimary() {
    return this.axis > 0;
  }

  public getLightColorInHex(): string {
    return '#' + this.getLightColor().getHexString();
  }

  public getDarkColorInHex(): string {
    return '#' + this.getDarkColor().getHexString();
  }

  private getLightColor(): Color {
    // Mix the original color with black by the getColorFraction
    this._mixedLightColor.copy(this._lightColor);
    this._mixedLightColor.multiplyScalar(this.getColorFraction());
    return this._mixedLightColor;
  }

  private getDarkColor(): Color {
    // Mix the original color with black by the getColorFraction
    this._mixedDarkColor.copy(this._darkColor);
    this._mixedDarkColor.multiplyScalar(this.getColorFraction());
    return this._mixedDarkColor;
  }

  private getColorFraction(): number {
    // Normalize between 1 and 0, since z is in range -1 to 1
    const mix = (this.bobblePosition.z + 1) / 2;

    // Interpolate this value lineary from minimum to 1:
    const minimum = 0.2;
    return minimum + (1 - minimum) * mix;
  }

  private createLabel(yUp: boolean): string {
    const labelPrefix = this.axis < 0 ? '-' : '';
    return labelPrefix + this.getAxisName(yUp);
  }

  private getAxisName(yUp: boolean): string {
    switch (Math.abs(this.axis)) {
      case 1:
        return 'X';
      case 2:
        return yUp ? 'Y' : 'Z';
      case 3:
        return yUp ? 'Z' : 'Y';
      default:
        return '';
    }
  }

  private createDirection(): Vector3 {
    const getCoord = (forAxis: number): number => {
      return Math.abs(this.axis) == forAxis ? Math.sign(this.axis) : 0;
    };
    return new Vector3(getCoord(1), getCoord(2), getCoord(3));
  }

  public static createAllAxises(options: AxisGizmoOptions): Axis[] {
    const axises: Axis[] = [];
    for (let axis = 1; axis <= 3; axis++) {
      axises.push(new Axis(axis, options));
      axises.push(new Axis(-axis, options));
    }
    return axises;
  }
}
