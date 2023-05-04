/*!
 * Copyright 2022 Cognite AS
 */

import { DefaultCameraManager } from '../../camera-manager';
import * as THREE from 'three';
import {
  ViewerTestFixtureComponents,
  ViewerVisualTestFixture
} from '../../../visual-tests/test-fixtures/ViewerVisualTestFixture';
import { OverlayInfo, SmartOverlayTool } from '../src/SmartOverlay/SmartOverlayTool';

export default class DefaultVisualTest extends ViewerVisualTestFixture {
  public setup(_: ViewerTestFixtureComponents): Promise<void> {
    const { viewer } = _;

    const cameraManager = viewer.cameraManager as DefaultCameraManager;

    cameraManager.setCameraControlsOptions({ mouseWheelAction: 'zoomToCursor', changeCameraTargetOnClick: false });

    const smartOverlayTool = new SmartOverlayTool(viewer);

    smartOverlayTool.on('hover', ({ targetOverlay }) => {
      targetOverlay.infoOverlay.innerText += ' hovered';
    });

    smartOverlayTool.on('click', ({ targetOverlay }) => {
      targetOverlay.infoOverlay.innerText = 'Haha, you clicked me!';
    });

    const labels: OverlayInfo[] = [];

    const reusableVec = new THREE.Vector3();

    const boxSize = 10;
    const overlaysOffset = new THREE.Vector3(0, -10, -10);

    for (let i = boxSize / -2; i < boxSize / 2; i++) {
      for (let x = boxSize / -2; x < boxSize / 2; x++) {
        for (let y = boxSize / -2; y < boxSize / 2; y++) {
          if (x * x + y * y - 0.7 * i * i < 750) {
            const id = i + ' ' + x + ' ' + y;
            labels.push({
              text: 'Meow ' + id,
              id: i + x + y,
              position: reusableVec.set(x, i, y).multiplyScalar(0.9).clone().add(overlaysOffset),
              color: new THREE.Color(
                Math.abs(i / (boxSize / 2)),
                Math.abs(x / (boxSize / 2)),
                Math.abs(y / (boxSize / 2))
              )
            });
          }
        }
      }
      smartOverlayTool.addOverlays(labels);
      labels.splice(0, labels.length);
    }

    return Promise.resolve();
  }
}
