/*!
 * Copyright 2022 Cognite AS
 */

import { DefaultCameraManager } from '../../camera-manager';
import * as THREE from 'three';
import {
  ViewerTestFixtureComponents,
  ViewerVisualTestFixture
} from '../../../visual-tests/test-fixtures/ViewerVisualTestFixture';
import { SmartOverlayTool } from '../src/SmartOverlay/SmartOverlayTool';
import { OverlayInfo } from '../../3d-overlays/src/OverlayCollection';

export default class DefaultVisualTest extends ViewerVisualTestFixture {
  public setup(_: ViewerTestFixtureComponents): Promise<void> {
    const { viewer } = _;

    const cameraManager = viewer.cameraManager as DefaultCameraManager;

    cameraManager.setCameraControlsOptions({ mouseWheelAction: 'zoomToCursor', changeCameraTargetOnClick: false });

    const smartOverlayTool = new SmartOverlayTool<{ text: string; id: number }>(viewer);

    smartOverlayTool.on('hover', ({ htmlOverlay, targetOverlay }) => {
      htmlOverlay.innerText += ' hovered';
      targetOverlay.setColor(new THREE.Color('red'));
      viewer.requestRedraw();
    });

    smartOverlayTool.on('click', ({ htmlOverlay, targetOverlay }) => {
      htmlOverlay.innerText = 'Haha, you clicked me!';
      targetOverlay.visible = false;
      viewer.requestRedraw();
    });

    const labels: OverlayInfo<{ text: string; id: number }>[] = [];
    const overlays = [];

    const reusableVec = new THREE.Vector3();

    const boxSize = 10;
    const overlaysOffset = new THREE.Vector3(0, -10, -10);

    for (let i = boxSize / -2; i < boxSize / 2; i++) {
      for (let x = boxSize / -2; x < boxSize / 2; x++) {
        for (let y = boxSize / -2; y < boxSize / 2; y++) {
          if (x * x + y * y - 0.7 * i * i < 750) {
            const id = i + ' ' + x + ' ' + y;
            labels.push({
              metadata: {
                text: 'Meow ' + id,
                id: i + x + y
              },
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
      //labels.splice(0, labels.length);
    }
    overlays.push(smartOverlayTool.createOverlayCollection(labels));

    // Testing proper removal of overlays
    //smartOverlayTool.removeOverlayCollection(overlays[2]);
    //overlays[5].removeOverlays(overlays[5].getOverlays().slice(0, 50));

    return Promise.resolve();
  }
}
