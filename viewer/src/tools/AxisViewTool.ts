/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { Vector2 } from 'three';

import { Cognite3DViewer } from '../migration';
import { Cognite3DViewerToolBase } from './Cognite3DViewerToolBase';

export class AxisViewTool extends Cognite3DViewerToolBase {
  constructor(viewer: Cognite3DViewer) {
    super();

    const viewerCamera = viewer.getCamera();

    const axisGroup = this.createAxisCross(viewer, viewerCamera);

    viewer.addUiObject(axisGroup, new THREE.Vector2(128, 128));
  }

  private createAxisCross(viewer: Cognite3DViewer, viewerCamera: THREE.PerspectiveCamera) {
    const axisGroup = new THREE.Group();
    const color1 = new THREE.Color('#ff3653');
    const color2 = new THREE.Color('#8adb00');
    const color3 = new THREE.Color('#2c8fff');

    const geometry = new THREE.BoxGeometry(0.8, 0.05, 0.05).translate(0.4, 0, 0);

    const xAxis = new THREE.Mesh(geometry, this.getAxisMaterial(color1));
    const yAxis = new THREE.Mesh(geometry, this.getAxisMaterial(color2));
    const zAxis = new THREE.Mesh(geometry, this.getAxisMaterial(color3));

    yAxis.rotation.z = Math.PI / 2;
    zAxis.rotation.y = -Math.PI / 2;

    const posXAxisHelper = new THREE.Sprite(this.getSpriteMaterial(color1, 'X'));
    posXAxisHelper.userData.type = 'posX';
    const posYAxisHelper = new THREE.Sprite(this.getSpriteMaterial(color2, 'Y'));
    posYAxisHelper.userData.type = 'posY';
    const posZAxisHelper = new THREE.Sprite(this.getSpriteMaterial(color3, 'Z'));
    posZAxisHelper.userData.type = 'posZ';
    const negXAxisHelper = new THREE.Sprite(this.getSpriteMaterial(color1));
    negXAxisHelper.userData.type = 'negX';
    const negYAxisHelper = new THREE.Sprite(this.getSpriteMaterial(color2));
    negYAxisHelper.userData.type = 'negY';
    const negZAxisHelper = new THREE.Sprite(this.getSpriteMaterial(color3));
    negZAxisHelper.userData.type = 'negZ';

    const interactiveObjects = [
      posXAxisHelper,
      posYAxisHelper,
      posZAxisHelper,
      negXAxisHelper,
      negYAxisHelper,
      negZAxisHelper
    ];

    posXAxisHelper.position.x = 1;
    posYAxisHelper.position.y = 1;
    posZAxisHelper.position.z = 1;
    negXAxisHelper.position.x = -1;
    negXAxisHelper.scale.setScalar(0.8);
    negYAxisHelper.position.y = -1;
    negYAxisHelper.scale.setScalar(0.8);
    negZAxisHelper.position.z = -1;
    negZAxisHelper.scale.setScalar(0.8);

    axisGroup.add(posXAxisHelper);
    axisGroup.add(posYAxisHelper);
    axisGroup.add(posZAxisHelper);
    axisGroup.add(negXAxisHelper);
    axisGroup.add(negYAxisHelper);
    axisGroup.add(negZAxisHelper);

    axisGroup.add(xAxis);
    axisGroup.add(zAxis);
    axisGroup.add(yAxis);

    //axisGroup.scale.set(0.5, 0.5, 0.5);

    const raycastCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
    const point = new THREE.Vector3();
    viewer.on('sceneRendered', () => {
      axisGroup.quaternion.copy(viewerCamera.quaternion).invert();
      axisGroup.updateMatrixWorld();

      // raycastCamera.quaternion.copy(viewerCamera.quaternion);
      // raycastCamera.updateMatrixWorld();

      point.set(0, 0, 1);
      point.applyQuaternion(viewerCamera.quaternion);

      // if (point.x >= 0) {
      //   posXAxisHelper.material.opacity = 1;
      //   negXAxisHelper.material.opacity = 0.5;
      // } else {
      //   posXAxisHelper.material.opacity = 0.5;
      //   negXAxisHelper.material.opacity = 1;
      // }

      // if (point.y >= 0) {
      //   posYAxisHelper.material.opacity = 1;
      //   negYAxisHelper.material.opacity = 0.5;
      // } else {
      //   posYAxisHelper.material.opacity = 0.5;
      //   negYAxisHelper.material.opacity = 1;
      // }

      // if (point.z >= 0) {
      //   posZAxisHelper.material.opacity = 1;
      //   negZAxisHelper.material.opacity = 0.5;
      // } else {
      //   posZAxisHelper.material.opacity = 0.5;
      //   negZAxisHelper.material.opacity = 1;
      // }
    });

    const raycaster = new THREE.Raycaster();

    viewer.on('click', (event: { offsetX: number; offsetY: number }) => {
      console.log('From helper:' + event.offsetX + ', ' + event.offsetY);
      const renderSize = viewer.renderer.getSize(new Vector2());
      const xNdc = (event.offsetX / renderSize.x) * 2 - 1;
      const yNdc = ((event.offsetY / renderSize.y) * 2 - 1) * -1;
      raycaster.setFromCamera({ x: xNdc, y: yNdc }, raycastCamera);

      const intersects = raycaster.intersectObjects(interactiveObjects);

      console.log('Mouse NDC: ' + xNdc + ', ' + yNdc);
      console.log('Num intersections: ' + intersects.length);
      if (intersects.length > 0) {
        console.log(intersects[0].object.userData.type);
      }
    });
    return axisGroup;
  }

  private getAxisMaterial(color: THREE.Color) {
    return new THREE.MeshBasicMaterial({ color: color, toneMapped: false, opacity: 0.2 });
  }

  private getSpriteMaterial(color: THREE.Color, text = '') {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;

    const context = canvas.getContext('2d')!;
    context.beginPath();
    context.arc(32, 32, 16, 0, 2 * Math.PI);
    context.closePath();
    context.fillStyle = color.getStyle();
    context.fill();

    if (text !== null) {
      context.font = '24px Arial';
      context.textAlign = 'center';
      context.fillStyle = '#000000';
      context.fillText(text, 32, 41);
    }

    const texture = new THREE.CanvasTexture(canvas);

    return new THREE.SpriteMaterial({ map: texture, toneMapped: false, transparent: false, side: THREE.DoubleSide });
  }
}
