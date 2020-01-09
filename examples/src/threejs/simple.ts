/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';
import * as reveal from '@cognite/reveal';
import CameraControls from 'camera-controls';

CameraControls.install({ THREE });

async function main() {
  const modelUrl = new URL(location.href).searchParams.get('model') || '/primitives';

  const scene = new THREE.Scene();
  const sectorModel = reveal.createLocalSectorModel(modelUrl);
  const sectorModelNode = await reveal.createThreeJsSectorNode(sectorModel);
  scene.add(sectorModelNode);

  const fetchMetadata: reveal.internal.FetchSectorMetadataDelegate = sectorModel[0];
  const [metadataRoot, modelTransform] = await fetchMetadata();

  const renderer = new THREE.WebGLRenderer();
  renderer.setClearColor('#444');
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const { position, target, near, far } = reveal.internal.suggestCameraConfig(metadataRoot);
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, near, far);
  const controls = new CameraControls(camera, renderer.domElement);
  const threePos = reveal.toThreeVector3(position, sectorModelNode.modelTransformation);
  const threeTarget = reveal.toThreeVector3(target, sectorModelNode.modelTransformation);
  controls.setLookAt(threePos.x, threePos.y, threePos.z, threeTarget.x, threeTarget.y, threeTarget.z);
  controls.update(0.0);
  camera.updateMatrixWorld();
4
  const clock = new THREE.Clock();
  const render = async () => {
    const delta = clock.getDelta();
    const controlsNeedUpdate = controls.update(delta);
    const sectorsNeedUpdate = await sectorModelNode.update(camera);

    if (controlsNeedUpdate || sectorsNeedUpdate) {
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
