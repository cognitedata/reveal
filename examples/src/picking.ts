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

  const pickedNodes: number[] = [];
  const shading = reveal_threejs.createDefaultShading({
    color(treeIndex: number) {
      if (pickedNodes.indexOf(treeIndex) !== -1) {
        return [255, 255, 0, 255];
      }
      return undefined;
    }
  });

  const scene = new THREE.Scene();
  const cadModel = await reveal.createLocalCadModel(modelUrl);
  const cadNode = new reveal_threejs.CadNode(cadModel, { shading });

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
  let pickingNeedsUpdate = false;
  const clock = new THREE.Clock();
  const render = async () => {
    const delta = clock.getDelta();
    const controlsNeedUpdate = controls.update(delta);
    const sectorsNeedUpdate = await cadNode.update(camera);

    if (controlsNeedUpdate || sectorsNeedUpdate || pickingNeedsUpdate) {
      renderer.render(scene, camera);
      pickingNeedsUpdate = false;
    }

    requestAnimationFrame(render);
  };
  render();

  const picker = new reveal_threejs.CadPicker();
  const pick = (event: MouseEvent) => {
    const treeIndex = picker.pickTreeIndex({ renderer, cadNode, scene, camera, event });
    console.log('Picked', treeIndex);
    pickedNodes.push(treeIndex);
    shading.updateNodes([treeIndex]);
    pickingNeedsUpdate = true;
  };
  renderer.domElement.addEventListener('mousedown', pick);

  (window as any).scene = scene;
  (window as any).THREE = THREE;
  (window as any).camera = camera;
  (window as any).controls = controls;
  (window as any).renderer = renderer;
}

main();
