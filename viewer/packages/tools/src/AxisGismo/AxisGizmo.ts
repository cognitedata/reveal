/*
 * Copyright 2024 Cognite AS
 */

import { Camera, Color, Matrix4, Vector3 } from 'three';
import { AxisGizmoOptions } from './AxisGizmoOptions';
import { Corner } from '@reveal/utilities';

export class AxisGizmo extends HTMLElement {
  //================================================
  // INSTANCE FIELDS
  //================================================
  private readonly _options: AxisGizmoOptions;
  private readonly _axises: Axis[];
  private readonly _center: Vector3;
  private _selectedAxis: Axis | null = null;
  private _canvas: HTMLCanvasElement | null = null;
  private _context: CanvasRenderingContext2D | null = null;
  onAxisSelected: ((event: { axis: number; direction: Vector3 }) => void) | null = null;

  private readonly _onMouseMove = this.onMouseMove.bind(this);
  private readonly _onMouseOut = this.onMouseOut.bind(this);
  private readonly _onMouseClick = this.onMouseClick.bind(this);

  //================================================
  // CONSTRUCTORS
  //================================================

  constructor(options?: AxisGizmoOptions) {
    super();
    this._options = options ?? new AxisGizmoOptions();
    this._axises = Axis.createAllAxises(this._options);

    const delta = this._options.size / 2;
    this._center = new Vector3(delta, delta, 0);
    this.innerHTML = '<canvas ></canvas>';
    this.initializeStyle();
  }

  //================================================
  // OVERRIDES from HTMLElement
  //================================================

  /**
   * Connected callback for the AxisGizmo element.
   */
  connectedCallback(): void {
    this._canvas = this.querySelector('canvas');
    if (!this._canvas) {
      return;
    }
    this.addEventListener('click', (event: MouseEvent) => {
      event.stopPropagation();
    });
    this._context = this._canvas.getContext('2d');
    this._canvas.addEventListener('mousemove', this._onMouseMove, false);
    this._canvas.addEventListener('mouseout', this._onMouseOut, false);
    this._canvas.addEventListener('click', this._onMouseClick, false);
  }

  /**
   * Callback called when the AxisGizmo element is disconnected from the DOM.
   */
  disconnectedCallback(): void {
    if (!this._canvas) {
      return;
    }
    this._canvas.removeEventListener('mousemove', this._onMouseMove, false);
    this._canvas.removeEventListener('mouseout', this._onMouseOut, false);
    this._canvas.removeEventListener('click', this._onMouseClick, false);
  }

  //================================================
  // EVENTS
  //================================================

  private onMouseMove(event: MouseEvent) {
    if (!this._canvas) {
      return;
    }
    const rectangle = this._canvas.getBoundingClientRect();
    const mousePosition = new Vector3(event.clientX - rectangle.left, event.clientY - rectangle.top, 0);
    this._selectedAxis = this.getSelectedAxis(mousePosition);
    this.update(null);
  }

  private onMouseOut(_: MouseEvent) {
    this._selectedAxis = null;
    this.update(null);
  }

  private onMouseClick(event: MouseEvent) {
    if (this.onAxisSelected && this._selectedAxis !== null) {
      this.onAxisSelected({ axis: this._selectedAxis.axis, direction: this._selectedAxis.direction.clone() });
    }
  }

  //================================================
  // INSTANCE METHODS
  //================================================

  /**
   * Update the AxisGizmo based on the camera.
   * @param camera The camera to update the AxisGizmo with.
   * If the camera is null, use the previous camera rotation
   */
  update(camera: Camera | null): void {
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

    // Render it
    clear(this._context, this._canvas);
    this.render();
  }

  //================================================
  // INSTANCE METHODS: Private helpers
  //================================================

  private initializeStyle() {
    this.style.position = 'absolute';
    this.style.zIndex = '1000';
    this.style.height = this.style.width = this._options.size + 'px';
    const margin = this._options.margin + 'px';
    switch (this._options.corner) {
      case Corner.TopRight:
        this.style.top = this.style.right = margin;
        break;
      case Corner.BottomLeft:
        this.style.bottom = this.style.left = margin;
        break;
      case Corner.BottomRight:
        this.style.bottom = this.style.right = margin;
        break;
      default:
        this.style.top = this.style.left = margin;
    }
  }

  private render() {
    if (this._context == null) {
      return;
    }
    if (this._selectedAxis !== null && this._options.focusCircleAlpha > 0) {
      this._context.globalAlpha = this._options.focusCircleAlpha;
      fillCircle(this._context, this._center, this._options.size / 2, this._options.focusCircleColor);
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

  private getSelectedAxis(mousePosition: Vector3): Axis | null {
    if (mousePosition.distanceTo(this._center) > this._options.size / 2) {
      return null;
    }
    // If the mouse is over the gizmo, find the closest axis bobble for highligting
    let closestDistance = Infinity;
    let selectedAxis: Axis | null = null;
    for (const axis of this._axises) {
      const distance = mousePosition.distanceTo(axis.bobblePosition);

      // Only select the axis if its closer to the mouse than the previous or if its within its bubble circle
      if (distance < closestDistance || distance < this._options.bubbleRadius) {
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
    this.label = this.createLabel();
    const index = Math.abs(axis) - 1;
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

  private createLabel(): string {
    const labelPrefix = this.axis < 0 ? '-' : '';
    const labelPostfix = this.axis == 1 ? 'X' : this.axis == 2 ? 'Y' : 'Z';
    return labelPrefix + labelPostfix;
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
