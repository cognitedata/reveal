/*
 * Copyright 2024 Cognite AS
 */

import { Matrix4, PerspectiveCamera, Vector3 } from 'three';
import { AxisGizmoOptions } from './AxisGizmoOptions';
import { CDF_TO_VIEWER_TRANSFORMATION } from '@reveal/utilities';
import { Cognite3DViewer } from '@reveal/api';
import { OneGizmoAxis } from './OneGizmoAxis';
import { moveCameraTo } from '../utilities/moveCameraTo';
import { Corner } from '../utilities/Corner';
import { Cognite3DViewerToolBase } from '../Cognite3DViewerToolBase';
import { isFlexibleCameraManager } from '@reveal/camera-manager/src/Flexible/IFlexibleCameraManager';
import { DataSourceType } from '@reveal/data-providers';

/**
 * Class for axis gizmo like the one in Blender
 * @beta
 */
export class AxisGizmoTool extends Cognite3DViewerToolBase {
  //================================================
  // INSTANCE FIELDS
  //================================================
  private readonly _options: AxisGizmoOptions;
  private readonly _axes: OneGizmoAxis[];
  private readonly _center: Vector3;
  private _mousePosition: Vector3 | undefined = undefined;
  private _selectedAxis: OneGizmoAxis | undefined = undefined;
  private _isMouseOver = false; // Keep track of this for highlighing the gizmo
  private _inDragging = false;

  private _viewer: Cognite3DViewer<DataSourceType> | undefined = undefined;
  private _element: HTMLElement | undefined = undefined;
  private _canvas: HTMLCanvasElement | null = null;
  private _context: CanvasRenderingContext2D | null = null;

  // binding of the event functions:
  private readonly _onPointerDown = this.onPointerDown.bind(this);
  private readonly _onPointerUp = this.onPointerUp.bind(this);
  private readonly _onPointerMove = this.onPointerMove.bind(this);
  private readonly _onPointerOut = this.onPointerOut.bind(this);
  private readonly _onMouseClick = this.onMouseClick.bind(this);
  private readonly _onMouseDoubleClick = this.onMouseDoubleClick.bind(this);

  //================================================
  // CONSTRUCTORS
  //================================================

  constructor(option?: AxisGizmoOptions) {
    super();
    this._options = option ? option : new AxisGizmoOptions();
    const halfSize = this._options.size / 2;
    this._center = new Vector3(halfSize, halfSize, 0);
    this._axes = OneGizmoAxis.createAllAxes(this._options);
  }

  //================================================
  // OVERRIDES of Cognite3DViewerToolBase
  //================================================

  public dispose(): void {
    super.dispose();
    if (this._viewer && this._element) {
      this._viewer.domElement.removeChild(this._element);
    }
    this.removeEventListeners();
    this._viewer = undefined;
    this._element = undefined;
    this._canvas = null;
    this._context = null;
  }

  //================================================
  // INSTANCE METHODS: Public
  //================================================

  /**
   * Connects the AxisGizmoTool to a Cognite3DViewer instance.
   * @param viewer The Cognite3DViewer instance to connect to.
   * Note: After it is connected to the viewer the tool can not be moved or
   * changed size by changing the fields: size, corner, yMargin and yMargin
   * in the AxisGizmoOptions
   */

  public connect(viewer: Cognite3DViewer<DataSourceType>): void {
    this._viewer = viewer;
    this._element = this.createElement();
    if (!this._element) {
      return;
    }
    viewer.domElement.appendChild(this._element);
    this._canvas = this._element.querySelector('canvas');
    if (!this._canvas) {
      return;
    }
    this._context = this._canvas.getContext('2d');
    this.addEventListeners();
    this.updateAndRender(this._viewer.cameraManager.getCamera());
  }

  public get options(): AxisGizmoOptions {
    return this._options;
  }

  //================================================
  // INSTANCE METHODS: Events
  //================================================

  private onPointerDown(event: PointerEvent) {
    if (this._isMouseOver) {
      event.stopPropagation();
    }
    this._inDragging = true;
  }

  private onPointerUp(_event: PointerEvent) {
    if (!this._inDragging) {
      return;
    }
    this._inDragging = false;
    this.updateSelectedAxis();
    const axis = this.getAxisToUse();
    if (!axis) {
      return;
    }
    if (!this._viewer) {
      return;
    }
    const forward = axis.direction.clone().negate();
    const upAxis = axis.upAxis;

    forward.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
    upAxis.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);

    const cameraManager = this._viewer.cameraManager;
    if (isFlexibleCameraManager(cameraManager)) {
      cameraManager.rotateCameraTo(forward.negate(), this._options.animationDuration);
    } else {
      moveCameraTo(this._viewer.cameraManager, forward, upAxis, this._options.animationDuration);
    }
    this.updateAndRender(cameraManager.getCamera());
  }

  private onPointerMove(event: PointerEvent) {
    if (!this._canvas) {
      return;
    }
    const rectangle = this._canvas.getBoundingClientRect();
    this._mousePosition = new Vector3(event.clientX - rectangle.left, event.clientY - rectangle.top, 0);
    if (this.updateSelectedAxis()) {
      this.updateAndRender(undefined);
    }
  }

  private onPointerOut(_event: PointerEvent) {
    this._inDragging = false;
    this._isMouseOver = false;
    this._selectedAxis = undefined;
    this._mousePosition = undefined;
    this.updateAndRender(undefined);
  }

  private onMouseClick(event: MouseEvent) {
    if (this._isMouseOver) {
      event.stopPropagation();
    }
  }

  private onMouseDoubleClick(event: MouseEvent) {
    if (this._isMouseOver) {
      event.stopPropagation();
    }
  }

  private readonly onCameraChange = (_position: Vector3, _target: Vector3) => {
    if (this._viewer) {
      this.updateSelectedAxis();
      this.updateAndRender(this._viewer.cameraManager.getCamera());
    }
  };

  //================================================
  // INSTANCE METHODS: Getters
  //================================================

  private getTextColor(axis: OneGizmoAxis): string {
    if (this._selectedAxis === axis) {
      return this._options.selectedTextColor;
    } else {
      return this._options.normalTextColor;
    }
  }

  private isMouseOver(): boolean {
    if (!this._mousePosition) {
      return false;
    }
    return horizontalDistanceTo(this._mousePosition, this._center) < this._options.radius;
  }

  private getAxisToUse(): OneGizmoAxis | undefined {
    const selectedAxis = this._selectedAxis;
    if (!selectedAxis) {
      return undefined;
    }
    // This behavior is according to blender. If click on an axis in center,
    // use the opposite axis
    const distance = horizontalDistanceTo(this._center, selectedAxis.bubblePosition);
    if (distance > 1) {
      return selectedAxis;
    }
    for (const otherAxis of this._axes) {
      if (otherAxis.axis == selectedAxis.axis && otherAxis.isPrimary != selectedAxis.isPrimary) {
        return otherAxis; // Opposite axis found
      }
    }
    return selectedAxis;
  }

  private getSelectedAxis(): OneGizmoAxis | undefined {
    if (!this._mousePosition) {
      return undefined;
    }
    if (!this.isMouseOver()) {
      return undefined;
    }
    // If the mouse is over the gizmo, find the one witch is under the mouse
    // Go reverse sive the last is the most visible
    for (let i = this._axes.length - 1; i >= 0; i--) {
      const axis = this._axes[i];
      const distance = horizontalDistanceTo(this._mousePosition, axis.bubblePosition);
      if (distance <= this._options.bubbleRadius) {
        return axis;
      }
    }
  }

  //================================================
  // INSTANCE METHODS: Updating
  //================================================

  private updateSelectedAxis(): boolean {
    if (!this._canvas) {
      return false;
    }
    const selectedAxis = this.getSelectedAxis();
    const isMouseOver = this.isMouseOver();
    if (selectedAxis === this._selectedAxis && isMouseOver === this._isMouseOver) {
      return false;
    }
    this._isMouseOver = isMouseOver;
    this._selectedAxis = selectedAxis;
    return true; // Returns true if updated
  }

  private updateAndRender(camera: PerspectiveCamera | undefined): void {
    if (!this._context || !this._canvas) {
      return;
    }
    if (camera) {
      // Calculate the rotation matrix from the camera and move the axes to the correct position
      const matrix = new Matrix4().makeRotationFromEuler(camera.rotation).invert();

      const fromViewerMatrix = CDF_TO_VIEWER_TRANSFORMATION.clone().invert();
      for (const axis of this._axes) {
        const direction = axis.direction.clone();
        if (axis.axis === 0) {
          direction.negate();
        }
        direction.applyMatrix4(fromViewerMatrix);
        direction.applyMatrix4(matrix);
        this.updateAxisPosition(direction, axis.bubblePosition);
      }
      // Since the bubblePosition has changed, maybe the selectedAxis is changed
      this.updateSelectedAxis();
    }
    // Sort the axis by it's z position
    this._axes.sort((a, b) => (a.bubblePosition.z > b.bubblePosition.z ? 1 : -1));
    this.render();
  }

  private updateAxisPosition(direction: Vector3, bubblePosition: Vector3): void {
    const offset = this._options.bubbleRadius + this._options.insideMargin;
    bubblePosition.set(direction.x * (this._center.x - offset), -direction.y * (this._center.y - offset), direction.z);
    bubblePosition.add(this._center);
  }

  //================================================
  // INSTANCE METHODS: Listeners administration
  //================================================

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
    canvas.addEventListener('dblclick', this._onMouseDoubleClick, false);
  }

  private removeEventListeners(): void {
    if (this._viewer) {
      this._viewer.off('cameraChange', this.onCameraChange);
    }
    const canvas = this._canvas;
    if (!canvas) {
      return;
    }
    canvas.removeEventListener('pointermove', this._onPointerMove);
    canvas.removeEventListener('pointerout', this._onPointerOut);
    canvas.removeEventListener('pointerdown', this._onPointerDown);
    canvas.removeEventListener('pointerup', this._onPointerUp);
    canvas.removeEventListener('click', this._onMouseClick);
    canvas.removeEventListener('dblclick', this._onMouseDoubleClick);
  }

  //================================================
  // INSTANCE METHODS: Graphics
  //================================================

  private createElement(): HTMLElement | undefined {
    const element: HTMLElement = document.createElement('div');
    if (!element) {
      return undefined;
    }
    initializeStyle(element, this._options);
    // Note: Buggy framework: height and width must be set here regardless of what set in initializeStyle above
    element.innerHTML = '<canvas height=' + this._options.size + ' width=' + this._options.size + '></canvas>';
    return element;
  }

  private render() {
    if (!this._context) {
      return;
    }
    if (this._canvas) {
      clear(this._context, this._canvas);
    }
    setFont(this._context, this._options);

    // Draw the focus circle
    if (this._isMouseOver && this._options.focusCircleAlpha > 0) {
      this._context.globalAlpha = this._options.focusCircleAlpha;
      fillCircle(this._context, this._center, this._options.radius, this._options.focusCircleColor);
      this._context.globalAlpha = 1;
    }
    const { bubbleRadius, primaryLineWidth, secondaryLineWidth, bobbleLineWidth } = this._options;
    const lineEnd = new Vector3();
    for (const axis of this._axes) {
      this._context.globalAlpha = axis.getColorFraction();
      const lightColor = axis.getLightColorInHex();

      // Calculate the end position of the axis line
      const lineLength = this._center.distanceTo(axis.bubblePosition) - bubbleRadius;
      lineEnd.subVectors(axis.bubblePosition, this._center).normalize().multiplyScalar(lineLength);
      lineEnd.add(this._center);

      if (axis.isPrimary) {
        if (primaryLineWidth > 0) {
          drawAxisLine(this._context, this._center, lineEnd, primaryLineWidth, lightColor);
        }
        fillCircle(this._context, axis.bubblePosition, bubbleRadius, lightColor);
      } else {
        const darkColor = axis.getDarkColorInHex();
        if (secondaryLineWidth > 0) {
          drawAxisLine(this._context, this._center, lineEnd, secondaryLineWidth, lightColor);
        }
        fillCircle(this._context, axis.bubblePosition, bubbleRadius, darkColor);
        if (bobbleLineWidth > 0) {
          drawCircle(this._context, axis.bubblePosition, bubbleRadius - 1, bobbleLineWidth, lightColor);
        }
      }
      this._context.globalAlpha = 1;
      if (this._options.useGeoLabels || axis.isPrimary || this._selectedAxis === axis) {
        drawText(this._context, axis.label, axis.bubblePosition, this._options, this.getTextColor(axis));
      }
    }
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

function setFont(context: CanvasRenderingContext2D, options: AxisGizmoOptions) {
  context.font = options.getFont();
  context.textBaseline = 'middle';
  context.textAlign = 'center';
}

function drawText(
  context: CanvasRenderingContext2D,
  label: string,
  position: Vector3,
  options: AxisGizmoOptions,
  color: string
) {
  context.fillStyle = color;
  context.fillText(label, position.x, position.y + options.fontYAdjust);
}

function initializeStyle(element: HTMLElement, options: AxisGizmoOptions) {
  const style = element.style;
  if (!style) {
    return;
  }
  style.position = 'absolute';
  style.zIndex = '1';
  style.width = style.height = options.size + 'px';
  const xMargin = options.xMargin + 'px';
  const yMargin = options.yMargin + 'px';
  switch (options.corner) {
    case Corner.TopRight:
      style.right = xMargin;
      style.top = yMargin;
      break;
    case Corner.BottomLeft:
      style.left = xMargin;
      style.bottom = yMargin;
      break;
    case Corner.BottomRight:
      style.right = xMargin;
      style.bottom = yMargin;
      break;
    default:
      style.left = xMargin;
      style.top = yMargin;
  }
}
