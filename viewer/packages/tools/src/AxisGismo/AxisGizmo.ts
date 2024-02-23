/*
 * Copyright 2024 Cognite AS
 */

import { Matrix4, PerspectiveCamera, Quaternion, Vector3 } from 'three';
import { AxisGizmoOptions } from './AxisGizmoOptions';
import { CDF_TO_VIEWER_TRANSFORMATION, Corner } from '@reveal/utilities';
import { Cognite3DViewer } from '@reveal/api';
import TWEEN from '@tweenjs/tween.js';
import { OneGizmoAxis } from './OneGizmoAxis';
import { CameraManager } from '@reveal/camera-manager';

export class AxisGizmo {
  //================================================
  // INSTANCE FIELDS
  //================================================
  private readonly _options: AxisGizmoOptions;
  private readonly _axises: OneGizmoAxis[];
  private readonly _center: Vector3;
  private _mousePosition: Vector3 | undefined = undefined;
  private _selectedAxis: OneGizmoAxis | undefined = undefined;
  private _isMouseOver = false; // Keep track of this for highlighing the gizmo
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
  private readonly _onMouseDoubleClick = this.onMouseDoubleClick.bind(this);

  //================================================
  // CONSTRUCTORS
  //================================================

  constructor() {
    this._options = new AxisGizmoOptions();
    const halfSize = this._options.size / 2;
    this._center = new Vector3(halfSize, halfSize, 0);
    this._axises = OneGizmoAxis.createAllAxises(this._options);
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
    if (!this._inDragging) {
      return;
    }
    this._inDragging = false;
    if (this._viewer == null) {
      return;
    }
    this.updateSelectedAxis();
    if (!this._selectedAxis) {
      return;
    }
    const cameraManager = this._viewer.cameraManager;
    const { position, target } = cameraManager.getCameraState();
    const distance = position.distanceTo(target);

    const forward = this._selectedAxis.direction.clone();
    const direction = forward.clone();
    direction.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
    direction.multiplyScalar(distance).negate();
    const positionToMoveTo = target.clone().add(direction);

    moveCameraTo(
      this._viewer.cameraManager,
      positionToMoveTo,
      forward,
      this._selectedAxis.upAxis,
      this._selectedAxis.axis
    );
    if (this.updateSelectedAxis()) {
      this.updateAndRender(cameraManager.getCamera());
    }
  }

  private onPointerMove(event: PointerEvent) {
    if (!this._canvas) {
      return;
    }
    const rectangle = this._canvas.getBoundingClientRect();
    this._mousePosition = new Vector3(event.clientX - rectangle.left, event.clientY - rectangle.top, 0);
    if (this.updateSelectedAxis()) {
      this.updateAndRender(null);
    }
  }

  private onPointerOut(_event: PointerEvent) {
    this._inDragging = false;
    this._isMouseOver = false;
    this._selectedAxis = undefined;
    this._mousePosition = undefined;
    this.updateAndRender(null);
  }

  private onMouseClick(event: MouseEvent) {
    event.stopPropagation();
  }

  private onMouseDoubleClick(event: MouseEvent) {
    event.stopPropagation();
  }

  private readonly onCameraChange = (_position: Vector3, _target: Vector3) => {
    if (this._viewer) {
      this.updateSelectedAxis();
      this.updateAndRender(this._viewer.cameraManager.getCamera());
    }
  };

  //================================================
  // INSTANCE METHODS: Private helpers
  //================================================

  private updateSelectedAxis(): boolean {
    if (!this._canvas) {
      return false;
    }
    const selectedAxis = this.getSelectedAxis();
    const isMouseInside = this.isMouseOver();
    if (selectedAxis === this._selectedAxis && isMouseInside === this._isMouseOver) {
      return false;
    }
    this._isMouseOver = isMouseInside;
    this._selectedAxis = selectedAxis;
    return true; // Returns true if updated
  }

  private updateAndRender(camera: PerspectiveCamera | null): void {
    if (this._context == null || this._canvas == null) {
      return;
    }
    if (camera) {
      // Calculate the rotation matrix from the camera and move the axises to the correct position
      const matrix = new Matrix4().makeRotationFromEuler(camera.rotation);
      matrix.invert();

      const fromViewer = CDF_TO_VIEWER_TRANSFORMATION.clone().invert();

      for (const axis of this._axises) {
        const direction = axis.direction.clone();
        if (axis.axis === 0) {
          direction.negate();
        }
        direction.applyMatrix4(fromViewer);
        direction.applyMatrix4(matrix);
        this.updateAxisPosition(direction, axis.bobblePosition);
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
    if (this._isMouseOver && this._options.focusCircleAlpha > 0) {
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

  private getSelectedAxis(): OneGizmoAxis | undefined {
    if (!this._mousePosition) {
      return undefined;
    }
    if (!this.isMouseOver()) {
      return undefined;
    }
    // If the mouse is over the gizmo, find the closest axis bobble for highligting
    let closestDistance = Infinity;
    let selectedAxis: OneGizmoAxis | undefined = undefined;
    for (const axis of this._axises) {
      const distance = horizontalDistanceTo(this._mousePosition, axis.bobblePosition);

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

function moveCameraTo(
  cameraManager: CameraManager,
  position: Vector3,
  direction: Vector3,
  upAxis: Vector3,
  axis: number
) {
  const { position: currentCameraPosition, target, rotation } = cameraManager.getCameraState();

  const offsetInCameraSpace = currentCameraPosition.clone().sub(target).applyQuaternion(rotation.clone().conjugate());

  // Create a new rotation from the direction and up axis
  const forward = direction.clone().negate();
  const up = upAxis.clone();

  up.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
  forward.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
  const right = up.clone().cross(forward);

  const toRotation = new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(right, up, forward));

  if (axis === 2) {
    cameraManager.setCameraState({ position, rotation: toRotation });
    return;
  }

  const fromRotation = rotation.clone();
  const tmpPosition = new Vector3();
  const tmpRotation = new Quaternion();

  const from = { t: 0 };
  const to = { t: 1 };
  const animation = new TWEEN.Tween(from);
  const tween = animation
    .to(to, 200)
    .onUpdate(() => {
      tmpRotation.slerpQuaternions(fromRotation, toRotation, from.t);
      tmpPosition.copy(offsetInCameraSpace);
      tmpPosition.applyQuaternion(tmpRotation);
      tmpPosition.add(target);
      cameraManager.setCameraState({ position: tmpPosition, rotation: tmpRotation });
    })
    .onComplete(() => {
      cameraManager.setCameraState({ position, rotation: toRotation });
    })
    .start(TWEEN.now());
  tween.update(TWEEN.now());
}
