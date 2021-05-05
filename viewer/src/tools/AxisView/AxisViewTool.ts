/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import ComboControls from '@cognite/three-combo-controls';
import TWEEN from '@tweenjs/tween.js';
import _ from 'lodash';

import { Cognite3DViewer } from '../../migration';
import { Cognite3DViewerToolBase } from '../Cognite3DViewerToolBase';
import { AxisBoxConfig, defaultAxisBoxConfig, AxisBoxFaceConfig, Corner } from './types';

type Absolute = {
  xAbsolute: number;
  yAbsolute: number;
};

type Relative = {
  corner: Corner;
  padding: THREE.Vector2;
};

export class AxisViewTool extends Cognite3DViewerToolBase {
  private _layoutConfig: AxisBoxConfig;

  private _boxFaceGeometry: THREE.PlaneGeometry;

  constructor(viewer: Cognite3DViewer, config?: AxisBoxConfig) {
    super();

    this._layoutConfig = _.merge(_.cloneDeep(defaultAxisBoxConfig), config);

    const viewerCamera = viewer.getCamera();

    this._boxFaceGeometry = new THREE.PlaneGeometry(0.85, 0.85, 1, 1);

    const axisGroup = this.createAxisCross(viewer, viewerCamera);

    this.addAxisBoxToViewer(viewer, axisGroup, this._layoutConfig.position!);
  }

  private addAxisBoxToViewer(viewer: Cognite3DViewer, axisGroup: THREE.Group, position: Absolute | Relative) {
    const width = 128;
    const height = 128;

    if (isAbsolute(position)) {
      const absolutePosition = new THREE.Vector2(position.xAbsolute, position.yAbsolute);
      viewer.addUiObject(axisGroup, absolutePosition, width, height);
    } else {
      //const viewerSize = viewer.renderer.getSize(new Vector2());
      const padding = position.padding.clone();

      switch (position.corner) {
        case Corner.BottomRight:
          break;

        case Corner.TopRight:
          break;

        case Corner.TopLeft:
          break;

        case Corner.BottomLeft:
          viewer.addUiObject(axisGroup, padding, width, height);
          break;
        default:
          break;
      }
    }

    function isAbsolute(position: Absolute | Relative): position is Absolute {
      return (position as Absolute).xAbsolute !== undefined && (position as Absolute).yAbsolute !== undefined;
    }
  }

  private createAxisCross(viewer: Cognite3DViewer, viewerCamera: THREE.PerspectiveCamera) {
    const axisGroup = new THREE.Group();

    const interactiveObjects = this.createBoxFaces();
    axisGroup.add(...interactiveObjects);

    const compass = this.createCompass();
    axisGroup.add(compass);

    const renderListener = this.setupTransformOnRender(axisGroup, viewerCamera);
    viewer.addObject3D(renderListener);

    this.setupInteractiveComponents(viewer, interactiveObjects);
    return axisGroup;
  }

  private setupTransformOnRender(axisGroup: THREE.Group, viewerCamera: THREE.PerspectiveCamera) {
    const renderListener = new THREE.Mesh();
    renderListener.onBeforeRender = () => {
      axisGroup.quaternion.copy(viewerCamera.quaternion).invert();
      axisGroup.updateMatrixWorld();
    };
    return renderListener;
  }

  private createBoxFaces() {
    const facesConfig = this._layoutConfig.faces!;

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

    const x = Math.sin(this._layoutConfig.compass!.labelDelta!);
    const z = Math.cos(this._layoutConfig.compass!.labelDelta!);

    compass.position.y = -0.5;
    compass.up.copy(new THREE.Vector3(x, 0, z));
    compass.lookAt(0, 0, 0);

    return compass;
  }

  private setupInteractiveComponents(viewer: Cognite3DViewer, interactiveObjects: THREE.Mesh[]) {
    const raycastCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
    const raycaster = new THREE.Raycaster();

    viewer.on('click', (event: { offsetX: number; offsetY: number }) => {
      const canvas = viewer.renderer.domElement.getBoundingClientRect();
      const xNdc = (1 + (event.offsetX - canvas.width) / 128) * 2 - 1;
      const yNdc = ((1 + (event.offsetY - canvas.height) / 128) * 2 - 1) * -1;
      raycaster.setFromCamera({ x: xNdc, y: yNdc }, raycastCamera);
      const rayOrigin = new THREE.Vector3(xNdc, yNdc, 1);
      const rayDirection = new THREE.Vector3(0, 0, -1).normalize();
      raycaster.set(rayOrigin, rayDirection);

      const intersects = raycaster.intersectObjects(interactiveObjects);

      if (intersects.length > 0) {
        const targetPosition = intersects[0].object.position.clone().normalize();
        const targetUp = (intersects[0].object.userData.upVector as THREE.Vector3).clone();

        this.moveCameraTo(viewer.getCamera(), viewer.cameraControls, targetPosition, targetUp, 400);
      }
    });
  }

  private createCompassTexture() {
    const compassLayout = this._layoutConfig.compass!;
    const textureSize = this._layoutConfig.size!;

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

    context.font = `bold ${compassLayout.fontSize!}px Arial`;
    context.textAlign = 'center';
    context.fillStyle = compassLayout.fontColor!.getStyle();
    context.fillText(compassLayout.ringLabel!, halfSize, compassLayout.fontSize! - (compassLayout.fontSize! / 4 - 4));

    return new THREE.CanvasTexture(canvas);
  }

  private getFaceTexture(faceConfig: AxisBoxFaceConfig, size: number) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext('2d')!;
    context.fillStyle = faceConfig.outlineColor!.getStyle();
    context.fillRect(0, 0, size, size);
    context.fillStyle = faceConfig.faceColor!.getStyle();

    const outlineSize = faceConfig.outlineSize!;
    context.fillRect(outlineSize, outlineSize, size - outlineSize * 2, size - outlineSize * 2);
    context.fill();

    if (faceConfig.label !== null) {
      context.font = `bold ${faceConfig.fontSize!}px Arial`;
      context.textAlign = 'center';
      context.fillStyle = faceConfig.fontColor!.getStyle();
      context.fillText(faceConfig.label!, size / 2, size / 2 + faceConfig.fontSize! / 3);
    }

    return new THREE.CanvasTexture(canvas);
  }

  private createBoxFace(position: THREE.Vector3, faceConfig: AxisBoxFaceConfig, upVector = new THREE.Vector3(0, 1, 0)) {
    const face = new THREE.Mesh(
      this._boxFaceGeometry,
      new THREE.MeshBasicMaterial({ map: this.getFaceTexture(faceConfig, this._layoutConfig.size!) })
    );

    face.position.copy(position.multiplyScalar(0.5 * this._boxFaceGeometry.parameters.width));
    face.lookAt(position.multiplyScalar(2));

    face.userData.upVector = upVector;

    return face;
  }

  private moveCameraTo(
    camera: THREE.PerspectiveCamera,
    cameraControls: ComboControls,
    targetAxis: THREE.Vector3,
    targetUpAxis: THREE.Vector3,
    duration: number
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

    const fromRotation = camera.quaternion.clone();
    const toRotation = new THREE.Quaternion().setFromRotationMatrix(
      new THREE.Matrix4().makeBasis(targetUpAxis.clone().cross(forward), targetUpAxis, forward)
    );

    const epsilon = 1e-6;

    if (fromRotation.angleTo(toRotation) < epsilon) {
      return;
    }

    const tmpPosition = new THREE.Vector3();
    const tmpRotation = new THREE.Quaternion();
    const tween = animation
      .to(to, duration)
      .onUpdate(() => {
        tmpPosition
          .copy(normalizedFrom)
          .multiplyScalar(Math.sin((1 - from.t) * omega) / Math.sin(omega))
          .add(targetAxis.clone().multiplyScalar(Math.sin(from.t * omega) / Math.sin(omega)));

        tmpPosition.multiplyScalar(radius);
        tmpPosition.add(cameraTarget);

        THREE.Quaternion.slerp(fromRotation, toRotation, tmpRotation, from.t);

        camera.position.copy(tmpPosition);
        camera.setRotationFromQuaternion(tmpRotation);
      })
      .start(TWEEN.now())
      .onStart(() => {
        cameraControls.enabled = false;
      })
      .onComplete(() => {
        cameraControls.setState(camera.position, cameraTarget);
        cameraControls.enabled = true;
      });
    tween.update(TWEEN.now());
  }
}
