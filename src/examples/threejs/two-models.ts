/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';
import CameraControls from 'camera-controls';
import { createThreeJsSectorNode, createLocalSectorModel } from '../..';

CameraControls.install({ THREE });

async function main() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.near = 0.12;
  camera.far = 1000;
  const renderer = new THREE.WebGLRenderer();
  renderer.setClearColor('#000000');
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const sectorModel1 = createLocalSectorModel('/primitives');
  const sectorModel2 = createLocalSectorModel('/primitives');
  const sectorModelNode1 = await createThreeJsSectorNode(sectorModel1);
  const sectorModelNode2 = await createThreeJsSectorNode(sectorModel2);
  const model2Offset = new THREE.Group();
  model2Offset.position.set(-50, 0, 0);
  model2Offset.add(sectorModelNode2);
  scene.add(sectorModelNode1);
  scene.add(model2Offset);

  const controls = new CameraControls(camera, renderer.domElement);
  const pos = new THREE.Vector3(373.2188407437061, 512.6270615748768, -126.18227676536418);
  const target = new THREE.Vector3(330.697021484375, 500.3190002441406, -84.89916229248047);
  controls.setLookAt(pos.x, pos.y, pos.z, target.x, target.y, target.z);
  controls.update(0.0);
  camera.updateMatrixWorld();

  const clock = new THREE.Clock();
  const render = () => {
    requestAnimationFrame(render);

    const delta = clock.getDelta();
    const needsUpdate = controls.update(delta) || sectorModelNode1.needsRedraw || sectorModelNode2.needsRedraw;

    if (needsUpdate) {
      renderer.render(scene, camera);
      sectorModelNode1.needsRedraw = sectorModelNode2.needsRedraw = false;
    }
  };
  render();

  (window as any).scene = scene;
  (window as any).THREE = THREE;
  (window as any).camera = camera;
  (window as any).controls = controls;
}

main();
