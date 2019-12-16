/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';
// @ts-ignore
import * as Potree from '@cognite/potree-core';

import CameraControls from 'camera-controls';
import { createThreeJsSectorNode } from '../../views/threejs/sector/createThreeJsSectorNode';
import { createThreeJsPointCloudNode } from '../../views/threejs/pointcloud/createThreeJsPointCloudNode';
import { createLocalSectorModel } from '../..';
import { createLocalPointCloudModel } from '../../datasources/local';
import dat from 'dat.gui';
import { PotreePointColorType, PotreePointShape } from '../../views/threejs/pointcloud/enums';
import { PotreeNodeWrapper } from '../../views/threejs/pointcloud/PotreeNodeWrapper';
import { PotreeGroupWrapper } from '../../views/threejs/pointcloud/PotreeGroupWrapper';

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

  Potree.XHRFactory.config.customHeaders.push({ header: 'MyDummyHeader', value: 'MyDummyValue' });

  const sectorModel = createLocalSectorModel('/primitives');
  const sectorModelNode = await createThreeJsSectorNode(sectorModel);
  const sectorModelOffsetRoot = new THREE.Group();
  sectorModelOffsetRoot.name = 'Sector model offset root';
  sectorModelOffsetRoot.add(sectorModelNode);
  scene.add(sectorModelOffsetRoot);

  const pointCloudModel = createLocalPointCloudModel('/transformer-point-cloud/cloud.js');
  const [pointCloudGroup, pointCloudNode] = await createThreeJsPointCloudNode(pointCloudModel);
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
    requestAnimationFrame(render);

    const delta = clock.getDelta();
    const needsUpdate =
      controls.update(delta) || (await sectorModelNode.update(camera)) || pointCloudGroup.needsRedraw || settingsChanged;

    if (needsUpdate) {
      renderer.render(scene, camera);
      settingsChanged = false;
    }
  };
  render();

  (window as any).scene = scene;
  (window as any).THREE = THREE;
  (window as any).camera = camera;
  (window as any).controls = controls;
}

function initializeGui(group: PotreeGroupWrapper, node: PotreeNodeWrapper, handleSettingsChangedCb: () => void) {
  const gui = new dat.GUI();
  gui.add(group, 'pointBudget', 0, 10_000_000);
  gui.add(node, 'pointSize', 0, 10).onChange(handleSettingsChangedCb);
  gui
    .add(node, 'pointColorType', {
      Rgb: PotreePointColorType.Rgb,
      Depth: PotreePointColorType.Depth,
      Height: PotreePointColorType.Height,
      PointIndex: PotreePointColorType.PointIndex,
      LevelOfDetail: PotreePointColorType.LevelOfDetail,
      Classification: PotreePointColorType.Classification
    })
    .onChange((valueAsString: string) => {
      const value: PotreePointColorType = parseInt(valueAsString, 10);
      node.pointColorType = value;
      handleSettingsChangedCb();
    });
  gui
    .add(node, 'pointShape', {
      Circle: PotreePointShape.Circle,
      Square: PotreePointShape.Square
    })
    .onChange((valueAsString: string) => {
      const value: PotreePointShape = parseInt(valueAsString, 10);
      node.pointShape = value;
      handleSettingsChangedCb();
    });
}

main();
