/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';
import * as reveal from '@cognite/reveal';
import CameraControls from 'camera-controls';

CameraControls.install({ THREE });

async function main() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.12, 1000);
  const renderer = new THREE.WebGLRenderer();
  renderer.setClearColor('#000000');
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const sectorModel1 = reveal.createLocalSectorModel('/primitives');
  const sectorModel2 = reveal.createLocalSectorModel('/primitives');
  const sectorModelNode1 = await reveal.createThreeJsSectorNode(sectorModel1);
  const sectorModelNode2 = await reveal.createThreeJsSectorNode(sectorModel2);
  const model2Offset = new THREE.Group();
  model2Offset.position.set(-50, -50, 0);
  model2Offset.add(sectorModelNode2);
  scene.add(sectorModelNode1);
  scene.add(model2Offset);

  const controls = new CameraControls(camera, renderer.domElement);
  const pos = new THREE.Vector3(100, 100, 100);
  const target = new THREE.Vector3(0, 0, 0);
  controls.setLookAt(pos.x, pos.y, pos.z, target.x, target.y, target.z);
  controls.update(0.0);
  camera.updateMatrixWorld();

  const clock = new THREE.Clock();
  const render = async () => {
    const delta = clock.getDelta();
    const controlsNeedUpdate = controls.update(delta);
    const model1NeedsUpdate = await sectorModelNode1.update(camera);
    const model2NeedsUpdate = await sectorModelNode2.update(camera);
    const needsUpdate = controlsNeedUpdate || model1NeedsUpdate || model2NeedsUpdate;

    if (needsUpdate) {
      renderer.render(scene, camera);
    }

    requestAnimationFrame(render);
  };
  render();

  (window as any).scene = scene;
  (window as any).THREE = THREE;
  (window as any).camera = camera;
  (window as any).controls = controls;
}

main();
