/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';
// @ts-ignore
import * as Potree from '@cognite/potree-core';
import * as reveal from '@cognite/reveal';

import CameraControls from 'camera-controls';
import dat from 'dat.gui';

CameraControls.install({ THREE });

async function main() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer();
  renderer.setClearColor('#000000');
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  Potree.XHRFactory.config.customHeaders.push({ header: 'MyDummyHeader', value: 'MyDummyValue' });

  const sectorModel = reveal.createLocalSectorModel('/primitives');
  const sectorModelNode = await reveal.createThreeJsSectorNode(sectorModel);
  const sectorModelOffsetRoot = new THREE.Group();
  sectorModelOffsetRoot.name = 'Sector model offset root';
  sectorModelOffsetRoot.add(sectorModelNode);
  scene.add(sectorModelOffsetRoot);

  const pointCloudModel = reveal.createLocalPointCloudModel('/transformer-point-cloud/cloud.js');
  const [pointCloudGroup, pointCloudNode] = await reveal.createThreeJsPointCloudNode(pointCloudModel);
  pointCloudGroup.position.set(10, 10, 10);
  scene.add(pointCloudGroup);

  let settingsChanged = false;
  function handleSettingsChanged() {
    settingsChanged = true;
  }
  initializeGui(pointCloudGroup, pointCloudNode, handleSettingsChanged);

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
    const modelNeedsUpdate = await sectorModelNode.update(camera);
    const needsUpdate = controlsNeedUpdate || modelNeedsUpdate || pointCloudGroup.needsRedraw || settingsChanged;

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
  gui.add(node, 'pointBudget', 0, 10_000_000);
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
