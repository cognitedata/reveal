/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import CameraControls from 'camera-controls';
import * as reveal from '@cognite/reveal';
import * as reveal_threejs from '@cognite/reveal/threejs';

CameraControls.install({ THREE });

async function main() {
  const modelUrl = new URL(location.href).searchParams.get('model') || '/primitives';

  const scene = new THREE.Scene();
  const cadModel = await reveal.loadCadModelByUrl(modelUrl);
  const cadNode = new reveal_threejs.CadNode(cadModel);

  //scene.add(cadNode);

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

  let sectorNeedUpdate = true;
  const rxjsObj = reveal.rxjs.testme(cadModel, () => {
    sectorNeedUpdate = true;
  });
  rxjsObj.update(camera);

  scene.add(rxjsObj.rootSector);

  const render = async () => {
    const delta = clock.getDelta();
    const controlsNeedUpdate = controls.update(delta);
    if (controlsNeedUpdate) {
      rxjsObj.update(camera);
    }

    if (controlsNeedUpdate || sectorNeedUpdate) {
      renderer.render(scene, camera);
      sectorNeedUpdate = false;
    }

    requestAnimationFrame(render);
  };
  render();

  (window as any).scene = scene;
  (window as any).THREE = THREE;
  (window as any).camera = camera;
  (window as any).controls = controls;
  (window as any).renderer = renderer;
}

main();
