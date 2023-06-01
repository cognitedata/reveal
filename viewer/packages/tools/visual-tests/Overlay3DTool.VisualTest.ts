/*!
 * Copyright 2022 Cognite AS
 */

import { DefaultCameraManager } from '../../camera-manager';
import * as THREE from 'three';
import {
  ViewerTestFixtureComponents,
  ViewerVisualTestFixture
} from '../../../visual-tests/test-fixtures/ViewerVisualTestFixture';
import { Overlay3DTool } from '../src/Overlay3D/Overlay3DTool';
import { OverlayInfo } from '../../3d-overlays/src/OverlayCollection';

export default class DefaultVisualTest extends ViewerVisualTestFixture {
  public async setup(components: ViewerTestFixtureComponents): Promise<void> {
    const { viewer } = components;

    const cameraManager = viewer.cameraManager as DefaultCameraManager;

    cameraManager.setCameraControlsOptions({ mouseWheelAction: 'zoomToCursor', changeCameraTargetOnClick: false });

    const smartOverlayTool = new Overlay3DTool<{ text: string; id: number }>(viewer);

    smartOverlayTool.on('hover', ({ htmlTextOverlay, targetOverlay }) => {
      const { text, id } = targetOverlay.getContent();
      htmlTextOverlay.innerText = text + ', #' + id + ' hovered';
      targetOverlay.setColor(new THREE.Color('red'));
      viewer.requestRedraw();
    });

    smartOverlayTool.on('click', ({ htmlTextOverlay: htmlOverlay, targetOverlay }) => {
      htmlOverlay.innerText = 'Haha, you clicked me!';
      targetOverlay.setVisible(false);
      viewer.requestRedraw();
    });

    const funnyTexture = await loadTexture(imageTransparent);
    funnyTexture.flipY = false;

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
              content: {
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
      overlays.push(
        smartOverlayTool.createOverlayCollection(labels, {
          overlayTexture: i % 2 === 0 ? funnyTexture : undefined,
          overlayTextureMask: i % 4 === 0 ? createTransparentMask() : undefined
        })
      );
      labels.splice(0, labels.length);
    }

    // Testing proper removal of overlays
    smartOverlayTool.removeOverlayCollection(overlays[2]);
    overlays[5].removeOverlays(overlays[5].getOverlays().slice(0, 50));

    return Promise.resolve();
  }
}

async function loadTexture(url: string) {
  return new Promise<THREE.Texture>((resolve, reject) => {
    new THREE.TextureLoader().load(url, resolve, undefined, reject);
  });
}

function createTransparentMask() {
  const canvas = document.createElement('canvas');

  const textureSize = 128;
  canvas.width = textureSize;
  canvas.height = textureSize;

  const context = canvas.getContext('2d')!;

  context.fillStyle = 'rgba(128, 12, 255, 1)';
  context.fillRect(0, 0, textureSize, textureSize);

  return new THREE.CanvasTexture(canvas);
}

const imageTransparent: string = `data:image/png;base64,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`;
