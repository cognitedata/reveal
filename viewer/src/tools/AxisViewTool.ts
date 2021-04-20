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

    const axisGroup = new THREE.Group();

    const viewerCamera = viewer.getCamera();

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

    viewer.addUiObject(axisGroup);

    axisGroup.scale.set(0.5, 0.5, 0.5);
    axisGroup.matrixWorldNeedsUpdate = true;
    axisGroup.updateMatrix();

    const point = new THREE.Vector3();
    const dim = 128;
    const turnRate = 2 * Math.PI; // turn rate in angles per second

    const rendererSize = new Vector2();
    viewer.on('sceneRendered', () => {
      axisGroup.quaternion.copy(viewerCamera.quaternion).invert();
      axisGroup.updateMatrixWorld();

      point.set(0, 0, 1);
      point.applyQuaternion(viewerCamera.quaternion);

      if (point.x >= 0) {
        posXAxisHelper.material.opacity = 1;
        negXAxisHelper.material.opacity = 0.5;
      } else {
        posXAxisHelper.material.opacity = 0.5;
        negXAxisHelper.material.opacity = 1;
      }

      if (point.y >= 0) {
        posYAxisHelper.material.opacity = 1;
        negYAxisHelper.material.opacity = 0.5;
      } else {
        posYAxisHelper.material.opacity = 0.5;
        negYAxisHelper.material.opacity = 1;
      }

      if (point.z >= 0) {
        posZAxisHelper.material.opacity = 1;
        negZAxisHelper.material.opacity = 0.5;
      } else {
        posZAxisHelper.material.opacity = 0.5;
        negZAxisHelper.material.opacity = 1;
      }
    });
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

    return new THREE.SpriteMaterial({ map: texture, toneMapped: false, transparent: true });
  }
}
