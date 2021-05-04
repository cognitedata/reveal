/*!
 * Copyright 2021 Cognite AS
 */

import ComboControls from '@cognite/three-combo-controls';
import * as THREE from 'three';
import { Mesh, Vector3 } from 'three';
import TWEEN from '@tweenjs/tween.js';

import { Cognite3DViewer } from '../migration';
import { Cognite3DViewerToolBase } from './Cognite3DViewerToolBase';

export class AxisViewTool extends Cognite3DViewerToolBase {
  private _boxFaceGeometry: THREE.BufferGeometry;

  constructor(viewer: Cognite3DViewer) {
    super();

    const viewerCamera = viewer.getCamera();

    this._boxFaceGeometry = new THREE.PlaneGeometry(2, 2, 1, 1);

    const axisGroup = this.createAxisCross(viewer, viewerCamera);

    viewer.addUiObject(axisGroup, new THREE.Vector2(128, 128));
  }

  private createAxisCross(viewer: Cognite3DViewer, viewerCamera: THREE.PerspectiveCamera) {
    const axisGroup = new THREE.Group();

    const planeGeometry = new THREE.PlaneGeometry(2, 2, 1, 1);

    const faceColor = new THREE.Color(0x949494);

    const posXFace = this.createBoxFace(new THREE.Vector3(1, 0, 0), faceColor, 'X', 'posX');
    const negXFace = this.createBoxFace(new THREE.Vector3(-1, 0, 0), faceColor, '-X', 'negX');

    const posYFace = this.createBoxFace(new THREE.Vector3(0, 1, 0), faceColor, 'Y', 'posY');
    const negYFace = this.createBoxFace(new THREE.Vector3(0, -1, 0), faceColor, '-Y', 'negY');

    const posZFace = this.createBoxFace(new THREE.Vector3(0, 0, 1), faceColor, 'Z', 'posZ');
    const negZFace = this.createBoxFace(new THREE.Vector3(0, 0, -1), faceColor, '-Z', 'negZ');

    const compass = new THREE.Mesh(
      planeGeometry,
      new THREE.MeshBasicMaterial({ map: this.createCompassTexture(), side: THREE.DoubleSide, transparent: true })
    );
    compass.position.y = -1.1;
    compass.scale.multiplyScalar(2.5);
    compass.lookAt(0, 2, 0);

    const interactiveObjects = [posXFace, negXFace, posYFace, negYFace, posZFace, negZFace];

    const dummy = new Mesh();
    axisGroup.add(dummy);

    axisGroup.add(posXFace);
    axisGroup.add(negXFace);
    axisGroup.add(posYFace);
    axisGroup.add(negYFace);
    axisGroup.add(posZFace);
    axisGroup.add(negZFace);

    axisGroup.add(compass);

    axisGroup.scale.set(0.4, 0.4, 0.4);

    const raycastCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
    const point = new THREE.Vector3();

    dummy.onBeforeRender = () => {
      axisGroup.quaternion.copy(viewerCamera.quaternion).invert();
      axisGroup.updateMatrixWorld();

      point.set(0, 0, 1);
      point.applyQuaternion(viewerCamera.quaternion);
    };

    const raycaster = new THREE.Raycaster();

    viewer.on('click', (event: { offsetX: number; offsetY: number }) => {
      const canvas = viewer.renderer.domElement.getBoundingClientRect();
      const xNdc = (1 + (event.offsetX - canvas.width) / 128) * 2 - 1;
      const yNdc = ((1 + (event.offsetY - canvas.height) / 128) * 2 - 1) * -1;
      raycaster.setFromCamera({ x: xNdc, y: yNdc }, raycastCamera);
      const rayOrigin = new Vector3(xNdc, yNdc, 1);
      const rayDirection = new Vector3(0, 0, -1).normalize();
      raycaster.set(rayOrigin, rayDirection);

      const intersects = raycaster.intersectObjects(interactiveObjects);

      if (intersects.length > 0) {
        const targetPosition = new THREE.Vector3();
        const targetUp = new THREE.Vector3();
        switch (intersects[0].object.userData.type) {
          case 'posX':
            targetPosition.set(1, 0, 0);
            targetUp.set(0, 1, 0);
            break;

          case 'posY':
            targetPosition.set(0, 1, 0);
            targetUp.set(0, 0, -1);
            break;

          case 'posZ':
            targetPosition.set(0, 0, 1);
            targetUp.set(0, 1, 0);
            break;

          case 'negX':
            targetPosition.set(-1, 0, 0);
            targetUp.set(0, 1, 0);
            break;

          case 'negY':
            targetPosition.set(0, -1, 0);
            targetUp.set(0, 0, 1);
            break;

          case 'negZ':
            targetPosition.set(0, 0, -1);
            targetUp.set(0, 1, 0);
            break;

          default:
            console.error('ViewHelper: Invalid axis.');
        }
        this.moveCameraTo(viewer.getCamera(), viewer.cameraControls, targetPosition, targetUp, 500);
      }
    });
    return axisGroup;
  }

  private createCompassTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d')!;
    context.strokeStyle = '#949494';
    context.lineWidth = 10;
    context.setLineDash([3, 12]);
    context.beginPath();
    context.arc(64, 64, 48, Math.PI / 24, 2 * Math.PI + Math.PI / 24);
    context.closePath();
    context.stroke();

    context.fillStyle = '#000000';
    context.beginPath();
    context.arc(64, 16, 16, 0, 2 * Math.PI);
    context.closePath();
    context.fill();

    const fontSize = 40;
    context.font = `bold ${fontSize}px Arial`;
    context.textAlign = 'center';
    context.fillStyle = '#FF0000';
    context.fillText('N', 64, 16 + fontSize / 3);

    return new THREE.CanvasTexture(canvas);
  }

  private getCanvasTexture(color: THREE.Color, text = '') {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;

    const context = canvas.getContext('2d')!;
    context.fillStyle = '#333333';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = color.getStyle();
    context.fillRect(8, 8, canvas.width - 16, canvas.height - 16);
    context.fill();

    if (text !== null) {
      const fontSize = 48;
      context.font = `bold ${fontSize}px Arial`;
      context.textAlign = 'center';
      context.fillStyle = '#333333';
      context.fillText(text, canvas.width / 2, canvas.height / 2 + fontSize / 3);
    }

    return new THREE.CanvasTexture(canvas);
  }

  private createBoxFace(position: THREE.Vector3, color: THREE.Color, label: string, hitToken: string) {
    const posXFace = new THREE.Mesh(
      this._boxFaceGeometry,
      new THREE.MeshBasicMaterial({ map: this.getCanvasTexture(color, label) })
    );
    posXFace.position.copy(position);
    posXFace.lookAt(position.multiplyScalar(2));
    posXFace.userData.type = hitToken;

    return posXFace;
  }

  private moveCameraTo(
    camera: THREE.PerspectiveCamera,
    cameraControls: ComboControls,
    targetAxis: THREE.Vector3,
    targetUpAxis: THREE.Vector3,
    duration = 250
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
