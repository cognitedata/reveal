/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';
// @ts-ignore
import * as Potree from '@cognite/potree-core';
import * as reveal from '@cognite/reveal';
import { createThreeJsPointCloudNode } from '@cognite/reveal/threejs';

import CameraControls from 'camera-controls';
import dat from 'dat.gui';
import { vec3 } from 'gl-matrix';

CameraControls.install({ THREE });

async function main() {
  const modelUrl = new URL(location.href).searchParams.get('model') || '/transformer-point-cloud/cloud.js';

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer();
  renderer.setClearColor('#000000');
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Shows how to set custom headers for PoTree request (useful for authentication)
  Potree.XHRFactory.config.customHeaders.push({ header: 'MyDummyHeader', value: 'MyDummyValue' });

  const pointCloudModel = reveal.createLocalPointCloudModel(modelUrl);
  const [pointCloudGroup, pointCloudNode] = await createThreeJsPointCloudNode(pointCloudModel);
  scene.add(pointCloudGroup);

  let settingsChanged = false;
  function handleSettingsChanged() {
    settingsChanged = true;
  }
  initializeGui(pointCloudGroup, pointCloudNode, handleSettingsChanged);

  {
    // Create a bounding box around the point cloud for debugging
    const bbox = pointCloudNode.boundingBox;
    const w = bbox.max[0] - bbox.min[0];
    const h = bbox.max[1] - bbox.min[1];
    const d = bbox.max[2] - bbox.min[2];
    const boundsGeometry = new THREE.BoxGeometry();
    const boundsMesh = new THREE.Mesh(boundsGeometry, new THREE.MeshBasicMaterial({color: 0xffff00, wireframe: true}));
    boundsMesh.position.set(bbox.center[0], bbox.center[1], bbox.center[2]);
    boundsMesh.scale.set(w,h,d);
    scene.add(boundsMesh);
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
    const needsUpdate = controlsNeedUpdate ||  pointCloudGroup.needsRedraw || settingsChanged;

    if (needsUpdate) {
      renderer.render(scene, camera);
      settingsChanged = false;
    }
    requestAnimationFrame(render);
  };
  render();

  (window as any).scene = scene;
  (window as any).THREE = THREE;
  (window as any).camera = camera;
  (window as any).controls = controls;
}

function initializeGui(group: reveal.internal.PotreeGroupWrapper, node: reveal.internal.PotreeNodeWrapper, handleSettingsChangedCb: () => void) {
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
