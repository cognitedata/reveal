/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import * as reveal from '@cognite/reveal/experimental';
import { CogniteClient } from '@cognite/sdk';

import CameraControls from 'camera-controls';
import dat from 'dat.gui';
import { vec3 } from 'gl-matrix';
import { getParamsFromURL } from './utils/example-helpers';

CameraControls.install({ THREE });

async function main() {
  const { project, modelUrl, modelRevision } = getParamsFromURL({ project: 'publicdata' });
  const client = new CogniteClient({ appId: 'reveal.example.simple-pointcloud' });
  client.loginWithOAuth({ project });

  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer();
  renderer.setClearColor('#000000');
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const revealManager = new reveal.RevealManager(client, () => {});
  let model: [reveal.internal.PotreeGroupWrapper, reveal.internal.PotreeNodeWrapper];
  if (modelUrl) {
    model = await revealManager.addPointCloudFromUrl(modelUrl);
  } else if (modelRevision) {
    await client.authenticate(); // Hack to make authentication flow work, required for pointcloud from cdf.
    model = await revealManager.addPointCloudFromCdf(modelRevision);
  } else {
    throw new Error('Need to provide either project & model OR modelUrl as query parameters');
  }
  const [pointCloudGroup, pointCloudNode] = model;
  scene.add(pointCloudGroup);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);

  let settingsChanged = false;
  function handleSettingsChanged() {
    settingsChanged = true;
  }
  initializeGui(pointCloudNode, handleSettingsChanged);

  {
    // Create a bounding box around the point cloud for debugging
    const bbox = pointCloudNode.boundingBox;
    const bboxHelper = new THREE.Box3Helper(reveal.utilities.toThreeJsBox3(new THREE.Box3(), bbox));
    scene.add(bboxHelper);
  }

  const camTarget = pointCloudNode.boundingBox.center;
  const minToCenter = vec3.sub(vec3.create(), camTarget, pointCloudNode.boundingBox.min);
  const camPos = vec3.scaleAndAdd(vec3.create(), camTarget, minToCenter, -1.5);
  const controls = new CameraControls(camera, renderer.domElement);
  controls.setLookAt(camPos[0], camPos[1], camPos[2], camTarget[0], camTarget[1], camTarget[2]);
  controls.update(0.0);
  camera.updateMatrixWorld();

  const clock = new THREE.Clock();
  const render = async () => {
    const delta = clock.getDelta();
    const controlsNeedUpdate = controls.update(delta);

    const needsUpdate = controlsNeedUpdate || pointCloudGroup.needsRedraw || settingsChanged;

    if (needsUpdate) {
      renderer.render(scene, camera);
      settingsChanged = false;
    }
    requestAnimationFrame(render);
  };
  render();

  (window as any).scene = scene;
  (window as any).renderer = renderer;
  (window as any).THREE = THREE;
  (window as any).camera = camera;
  (window as any).controls = controls;
}

function initializeGui(node: reveal.internal.PotreeNodeWrapper, handleSettingsChangedCb: () => void) {
  const gui = new dat.GUI();
  gui.add(node, 'pointBudget', 0, 20_000_000);
  // gui.add(node, 'visiblePointCount', 0, 20_000_000).onChange(() => { /* Ignore update */ });
  gui.add(node, 'pointSize', 0, 10).onChange(handleSettingsChangedCb);
  gui
    .add(node, 'pointColorType', {
      Rgb: reveal.internal.PotreePointColorType.Rgb,
      Depth: reveal.internal.PotreePointColorType.Depth,
      Height: reveal.internal.PotreePointColorType.Height,
      PointIndex: reveal.internal.PotreePointColorType.PointIndex,
      LevelOfDetail: reveal.internal.PotreePointColorType.LevelOfDetail,
      Classification: reveal.internal.PotreePointColorType.Classification
    })
    .onChange((valueAsString: string) => {
      const value: reveal.internal.PotreePointColorType = parseInt(valueAsString, 10);
      node.pointColorType = value;
      handleSettingsChangedCb();
    });
  gui
    .add(node, 'pointShape', {
      Circle: reveal.internal.PotreePointShape.Circle,
      Square: reveal.internal.PotreePointShape.Square
    })
    .onChange((valueAsString: string) => {
      const value: reveal.internal.PotreePointShape = parseInt(valueAsString, 10);
      node.pointShape = value;
      handleSettingsChangedCb();
    });
}

main();
