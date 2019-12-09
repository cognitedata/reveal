/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';
import CameraControls from 'camera-controls';
import { createThreeJsSectorNode } from '../../views/threejs/sector/createThreeJsSectorNode';
import { createLocalSectorModel } from '../..';
import { getUrlParameter } from '../../utils/urlUtils';
import { suggestCameraLookAt } from '../../utils/cameraUtils';
import { FetchSectorMetadataDelegate } from '../../models/sector/delegates';
import { vec3 } from 'gl-matrix';

CameraControls.install({ THREE });

async function main() {
  const modelUrl = getUrlParameter('model') || '/primitives';

  const scene = new THREE.Scene();
  const sectorModel = createLocalSectorModel(modelUrl);
  const sectorModelNode = await createThreeJsSectorNode(sectorModel);
  scene.add(sectorModelNode);

  const fetchMetadata: FetchSectorMetadataDelegate = sectorModel[0];
  const [metaData, modelTransform] = await fetchMetadata();

  const renderer = new THREE.WebGLRenderer();
  renderer.setClearColor('#444');
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  const transformedBounds = metaData.bounds.createTransformed(modelTransform.modelMatrix);
  const [pos, target] = suggestCameraLookAt(transformedBounds);
  const far = 3 * vec3.distance(target, pos);
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.2, far);
  const controls = new CameraControls(camera, renderer.domElement);
  // const pos = new THREE.Vector3(100, 100, 10);
  // const target = new THREE.Vector3(0.0, 0.0, 0.0);
  controls.setLookAt(pos[0], pos[1], pos[2], target[0], target[1], target[2]);
  controls.update(0.0);
  camera.updateMatrixWorld();

  const clock = new THREE.Clock();
  const render = () => {
    requestAnimationFrame(render);

    const delta = clock.getDelta();
    const needsUpdate = controls.update(delta) || sectorModelNode.needsRedraw;

    if (needsUpdate) {
      renderer.render(scene, camera);
      sectorModelNode.needsRedraw = false;
    }
  };
  render();

  (window as any).scene = scene;
  (window as any).THREE = THREE;
  (window as any).camera = camera;
  (window as any).controls = controls;
}

main();
