/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import CameraControls from 'camera-controls';
import * as reveal from '@cognite/reveal';
import * as reveal_threejs from '@cognite/reveal/threejs';
// import { RenderMode } from '@cognite/reveal/views/threejs/materials';

CameraControls.install({ THREE });

async function main() {
  const modelUrl = new URL(location.href).searchParams.get('model') || '/primitives';

  const scene = new THREE.Scene();
  const cadModel = await reveal.createLocalCadModel(modelUrl);
  const cadNode = new reveal_threejs.CadNode(cadModel);

  scene.add(cadNode);

  const renderer = new THREE.WebGLRenderer();
  renderer.setClearColor('#444');
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const { position, target, near, far } = cadNode.suggestCameraConfig();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, near, far);
  const controls = new CameraControls(camera, renderer.domElement);
  controls.setLookAt(position.x, position.y, position.z, target.x, target.y, target.z);
  controls.update(0.0);
  camera.updateMatrixWorld();
  const clock = new THREE.Clock();
  const render = async () => {
    const delta = clock.getDelta();
    const controlsNeedUpdate = controls.update(delta);
    const sectorsNeedUpdate = await cadNode.update(camera);

    if (controlsNeedUpdate || sectorsNeedUpdate) {
      renderer.render(scene, camera);
    }

    requestAnimationFrame(render);
  };
  render();

  const pickingTarget = new THREE.WebGLRenderTarget(1, 1);
  const pixelBuffer = new Uint8Array(4);

  const pick = (event: MouseEvent) => {
    const pickCamera = camera.clone();

    // const pixelRatio = renderer.getPixelRatio();
    pickCamera.setViewOffset(
      renderer.domElement.clientWidth,
      renderer.domElement.clientHeight,
      event.clientX,
      event.clientY,
      1,
      1
    );

    cadNode.renderMode = 3;
    renderer.setRenderTarget(pickingTarget);
    renderer.render(scene, pickCamera);
    renderer.setRenderTarget(null);
    cadNode.renderMode = 1;

    renderer.readRenderTargetPixels(pickingTarget, 0, 0, 1, 1, pixelBuffer);

    // tslint:disable-next-line:no-bitwise
    const id = (pixelBuffer[0] << 16) | (pixelBuffer[1] << 8) | pixelBuffer[2];

    console.log('Picked', id);
  };

  renderer.domElement.addEventListener('mousedown', pick);

  (window as any).scene = scene;
  (window as any).THREE = THREE;
  (window as any).camera = camera;
  (window as any).controls = controls;
  (window as any).renderer = renderer;
}

main();
