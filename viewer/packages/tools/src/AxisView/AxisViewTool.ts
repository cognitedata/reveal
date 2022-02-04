/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';
import TWEEN from '@tweenjs/tween.js';

import { Cognite3DViewerToolBase } from '../Cognite3DViewerToolBase';
import {
  AxisBoxConfig,
  defaultAxisBoxConfig,
  AxisBoxFaceConfig,
  Corner,
  AbsolutePosition,
  RelativePosition
} from './types';
import { RevealCameraControls } from '@reveal/camera-manager';
import { Cognite3DViewer } from '@reveal/core';
import { MetricsLogger } from '@reveal/metrics';

export class AxisViewTool extends Cognite3DViewerToolBase {
  private readonly _layoutConfig: Required<AxisBoxConfig>;

  private readonly _boxFaceGeometry: THREE.PlaneGeometry;

  private readonly _viewer: Cognite3DViewer;

  private readonly _axisGroup: THREE.Group;

  private readonly _interactiveObjects: THREE.Mesh[];
  private readonly _raycastCamera: THREE.OrthographicCamera;
  private readonly _raycaster: THREE.Raycaster;

  private readonly _screenPosition: THREE.Vector2;

  private readonly _disposeClickDiv: () => void;

  private _dynamicUpdatePosition = () => {};
  private readonly _updateClickDiv = () => {};

  constructor(viewer: Cognite3DViewer, config?: AxisBoxConfig) {
    super();

    this._screenPosition = new THREE.Vector2();
    this._boxFaceGeometry = new THREE.PlaneGeometry(0.85, 0.85, 1, 1);

    this._raycastCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
    this._raycaster = new THREE.Raycaster();

    this._viewer = viewer;

    this._layoutConfig = merge(cloneDeep(defaultAxisBoxConfig), config);

    this._axisGroup = new THREE.Group();
    this._interactiveObjects = this.createAxisCross(this._axisGroup);

    [this._updateClickDiv, this._disposeClickDiv] = this.createClickDiv(viewer);
    this.addAxisBoxToViewer(this._axisGroup, this._layoutConfig.position!);

    MetricsLogger.trackCreateTool('AxisViewTool');
  }

  public dispose(): void {
    super.dispose();
    this._viewer.removeUiObject(this._axisGroup);
    this._disposeClickDiv();
  }

  private createClickDiv(viewer: Cognite3DViewer) {
    const canvasElement = viewer.domElement.querySelector('canvas');
    if (canvasElement === null) {
      throw new Error('Could not find canvas');
    }
    const divElement = document.createElement('div');
    divElement.style.position = 'absolute';
    divElement.style.height = `${this._layoutConfig.size}px`;
    divElement.style.width = `${this._layoutConfig.size}px`;
    divElement.style.zIndex = '1';

    let xMouse = 0;
    let yMouse = 0;

    divElement.addEventListener('mousedown', event => {
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: event.clientX,
        clientY: event.clientY,
        button: event.button
      });
      xMouse = event.clientX;
      yMouse = event.clientY;
      viewer.renderer.domElement.dispatchEvent(mouseDownEvent);
    });

    divElement.addEventListener('mousemove', event => {
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: event.clientX,
        clientY: event.clientY,
        button: event.button
      });
      viewer.renderer.domElement.dispatchEvent(mouseMoveEvent);
    });

    divElement.addEventListener('contextmenu', event => event.preventDefault());

    divElement.addEventListener('mouseup', event => {
      const mouseUpEvent = new MouseEvent('mouseup', {
        clientX: event.clientX,
        clientY: event.clientY,
        button: event.button
      });

      const rect = viewer.domElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (Math.abs(xMouse - event.clientX) + Math.abs(yMouse - event.clientY) <= 10 && !this.handleClick(x, y, rect)) {
        viewer.renderer.domElement.dispatchEvent(mouseUpEvent);
      }
    });

    viewer.domElement.appendChild(divElement);

    return [
      () => {
        divElement.style.left = `${this._screenPosition.x}px`;
        divElement.style.bottom = `${this._screenPosition.y}px`;
      },
      () => {
        viewer.domElement.removeChild(divElement);
      }
    ];
  }

  private addAxisBoxToViewer(axisGroup: THREE.Group, position: AbsolutePosition | RelativePosition) {
    const size = this._layoutConfig.size;

    if (isAbsolute(position)) {
      this._screenPosition.x = position.xAbsolute;
      this._screenPosition.y = position.yAbsolute;
    } else {
      switch (position.corner) {
        case Corner.BottomRight:
          this._screenPosition.y = position.padding.y;

          this._dynamicUpdatePosition = () => {
            this._screenPosition.x = this._viewer.renderer.domElement.clientWidth - position.padding.x - size;
          };
          break;

        case Corner.TopRight:
          this._dynamicUpdatePosition = () => {
            this._screenPosition.x = this._viewer.renderer.domElement.clientWidth - position.padding.x - size;
            this._screenPosition.y = this._viewer.renderer.domElement.clientHeight - position.padding.y - size;
          };
          break;

        case Corner.TopLeft:
          this._screenPosition.x = position.padding.x;
          this._dynamicUpdatePosition = () => {
            this._screenPosition.y = this._viewer.renderer.domElement.clientHeight - position.padding.y - size;
          };
          break;

        case Corner.BottomLeft:
          this._screenPosition.x = position.padding.x;
          this._screenPosition.y = position.padding.y;
          break;
        default:
          throw new Error(`Unknown corner position for Axis Cross: Corner = ${position.corner}`);
      }
      this._dynamicUpdatePosition();
    }

    this._viewer.addUiObject(axisGroup, this._screenPosition, new THREE.Vector2(size, size));

    function isAbsolute(position: AbsolutePosition | RelativePosition): position is AbsolutePosition {
      return (
        (position as AbsolutePosition).xAbsolute !== undefined && (position as AbsolutePosition).yAbsolute !== undefined
      );
    }
  }

  private handleClick(xScreenPos: number, yScreenPos: number, boundingRect: DOMRect): boolean {
    const xNdc = (2 * (xScreenPos - this._screenPosition.x)) / this._layoutConfig.size - 1;
    const yNdc = (2 * (boundingRect.height - yScreenPos - this._screenPosition.y)) / this._layoutConfig.size - 1;
    this._raycaster.setFromCamera({ x: xNdc, y: yNdc }, this._raycastCamera);
    const rayOrigin = new THREE.Vector3(xNdc, yNdc, 1);
    const rayDirection = new THREE.Vector3(0, 0, -1).normalize();
    this._raycaster.set(rayOrigin, rayDirection);

    const intersects = this._raycaster.intersectObjects(this._interactiveObjects);

    if (!(intersects.length > 0)) return false;

    const targetPosition = intersects[0].object.position.clone().normalize();
    const targetUp = (intersects[0].object.userData.upVector as THREE.Vector3).clone();

    this.moveCameraTo(this._viewer.getCamera(), this._viewer.cameraManager.cameraControls, targetPosition, targetUp);

    return true;
  }

  private createAxisCross(axisGroup: THREE.Group) {
    const interactiveObjects = this.createBoxFaces();
    axisGroup.add(...interactiveObjects);

    const compass = this.createCompass();
    axisGroup.add(compass);

    this.setupTransformOnRender(axisGroup);

    return interactiveObjects;
  }

  private setupTransformOnRender(axisGroup: THREE.Group) {
    axisGroup.children[0].onBeforeRender = () => {
      this._dynamicUpdatePosition();
      axisGroup.quaternion.copy(this._viewer.getCamera().quaternion).invert();
      axisGroup.updateMatrixWorld();
      this._updateClickDiv();
    };
  }

  private createBoxFaces() {
    const facesConfig = this._layoutConfig.faces;

    const posXFace = this.createBoxFace(new THREE.Vector3(1, 0, 0), facesConfig.xPositiveFace!);
    const negXFace = this.createBoxFace(new THREE.Vector3(-1, 0, 0), facesConfig.xNegativeFace!);

    const posYFace = this.createBoxFace(
      new THREE.Vector3(0, 1, 0),
      facesConfig.yPositiveFace!,
      new THREE.Vector3(0, 0, -1)
    );
    const negYFace = this.createBoxFace(
      new THREE.Vector3(0, -1, 0),
      facesConfig.yNegativeFace!,
      new THREE.Vector3(0, 0, 1)
    );

    const posZFace = this.createBoxFace(new THREE.Vector3(0, 0, 1), facesConfig.zPositiveFace!);
    const negZFace = this.createBoxFace(new THREE.Vector3(0, 0, -1), facesConfig.zNegativeFace!);

    return [posXFace, negXFace, posYFace, negYFace, posZFace, negZFace];
  }

  private createCompass() {
    const compassPlaneGeometry = new THREE.PlaneGeometry(2.1, 2.1, 1, 1);
    const compass = new THREE.Mesh(
      compassPlaneGeometry,
      new THREE.MeshBasicMaterial({
        map: this.createCompassTexture(),
        side: THREE.DoubleSide,
        transparent: true
      })
    );

    const x = Math.sin(this._layoutConfig.compass.labelDelta!);
    const z = Math.cos(this._layoutConfig.compass.labelDelta!);

    compass.position.y = -0.5;
    compass.up.copy(new THREE.Vector3(x, 0, z));
    compass.lookAt(0, 0, 0);

    return compass;
  }

  private createCompassTexture() {
    const compassLayout = this._layoutConfig.compass;
    const textureSize = this._layoutConfig.size;

    const canvas = document.createElement('canvas');
    canvas.width = textureSize;
    canvas.height = textureSize;
    const context = canvas.getContext('2d')!;

    const halfSize = textureSize / 2;
    const radius = halfSize - halfSize / 4;

    const tickWidth = textureSize / 32;
    const tickSpace = textureSize / 8;

    context.strokeStyle = compassLayout.tickColor!.getStyle();
    context.lineWidth = textureSize / 16;
    context.setLineDash([tickWidth, tickSpace]);
    context.beginPath();
    context.arc(halfSize, halfSize, radius, 0, 2 * Math.PI);
    context.stroke();

    if (compassLayout.ringLabel && compassLayout.ringLabel.length > 0) {
      const fontSize = compassLayout.fontSize ?? textureSize / 5;
      context.font = `bold ${fontSize}px Arial`;
      context.textAlign = 'center';
      context.fillStyle = compassLayout.fontColor!.getStyle();
      context.fillText(compassLayout.ringLabel, halfSize, halfSize * (1 / 4) + fontSize / 3);
    }

    return new THREE.CanvasTexture(canvas);
  }

  private getFaceTexture(faceConfig: AxisBoxFaceConfig, size: number) {
    const textureSize = size / 2;

    const canvas = document.createElement('canvas');
    canvas.width = textureSize;
    canvas.height = textureSize;

    const context = canvas.getContext('2d')!;
    context.fillStyle = faceConfig.outlineColor!.getStyle();
    context.fillRect(0, 0, textureSize, textureSize);
    context.fillStyle = faceConfig.faceColor!.getStyle();

    const outlineSize = faceConfig.outlineSize ?? textureSize / 32;
    context.fillRect(outlineSize, outlineSize, textureSize - outlineSize * 2, textureSize - outlineSize * 2);
    context.fill();

    if (faceConfig.label !== '') {
      const fontSize = faceConfig.fontSize ?? textureSize / 3;
      context.font = `bold ${fontSize}px Arial`;
      context.textAlign = 'center';
      context.fillStyle = faceConfig.fontColor!.getStyle();
      context.fillText(faceConfig.label!, textureSize / 2, textureSize / 2 + fontSize / 3);
    }

    return new THREE.CanvasTexture(canvas);
  }

  private createBoxFace(position: THREE.Vector3, faceConfig: AxisBoxFaceConfig, upVector = new THREE.Vector3(0, 1, 0)) {
    const face = new THREE.Mesh(
      this._boxFaceGeometry,
      new THREE.MeshBasicMaterial({ map: this.getFaceTexture(faceConfig, this._layoutConfig.size) })
    );

    face.position.copy(position.multiplyScalar(0.5 * this._boxFaceGeometry.parameters.width));
    face.lookAt(position.multiplyScalar(2));

    face.userData.upVector = upVector;

    return face;
  }

  private moveCameraTo(
    camera: THREE.PerspectiveCamera,
    cameraControls: RevealCameraControls,
    targetAxis: THREE.Vector3,
    targetUpAxis: THREE.Vector3
  ) {
    const currentCameraPosition = camera.position.clone();
    const cameraTarget = cameraControls.getState().target;

    const targetRelativeStartPosition = currentCameraPosition.clone().sub(cameraTarget);
    const radius = targetRelativeStartPosition.length();

    const normalizedFrom = targetRelativeStartPosition.clone().normalize();

    const omega = Math.acos(normalizedFrom.dot(targetAxis));

    const from = { t: 0 };
    const to = { t: 1 };

    const animation = new TWEEN.Tween(from);

    const forward = targetAxis.clone();

    const fromRotation = cameraManager.getCameraRotation().clone();
    const toRotation = new THREE.Quaternion().setFromRotationMatrix(
      new THREE.Matrix4().makeBasis(targetUpAxis.clone().cross(forward), targetUpAxis, forward)
    );

    const epsilon = 1e-6;

    if (fromRotation.angleTo(toRotation) < epsilon) {
      return;
    }

    const tmpPosition = new THREE.Vector3();
    const tmpRotation = new THREE.Quaternion();
    let cachedCameraControlsEnabled: boolean;
    const tween = animation
      .to(to, this._layoutConfig.animationSpeed)
      .onUpdate(() => {
        tmpPosition
          .copy(normalizedFrom)
          .multiplyScalar(Math.sin((1 - from.t) * omega) / Math.sin(omega))
          .add(targetAxis.clone().multiplyScalar(Math.sin(from.t * omega) / Math.sin(omega)));

        tmpPosition.multiplyScalar(radius);
        tmpPosition.add(cameraTarget);

        tmpRotation.slerpQuaternions(fromRotation, toRotation, from.t);

        camera.position.copy(tmpPosition);
        camera.setRotationFromQuaternion(tmpRotation);
      })
      .start(TWEEN.now())
      .onStart(() => {
        cachedCameraControlsEnabled = cameraControls.enabled;
        cameraControls.enabled = false;
      })
      .onComplete(() => {
        cameraControls.setState(camera.position, cameraTarget);
        cameraControls.enabled = cachedCameraControlsEnabled;
      });
    tween.update(TWEEN.now());
  }
}
