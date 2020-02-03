/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
// @ts-ignore
import * as Potree from '@cognite/potree-core';
import * as reveal from '@cognite/reveal';

import CameraControls from 'camera-controls';
import dat from 'dat.gui';
import {
  RenderOptions,
  applyRenderingFilters,
  RenderMode,
  createDefaultRenderOptions
} from './utils/renderer-debug-widget';

CameraControls.install({ THREE });

async function main() {
  const cadModelUrl = new URL(location.href).searchParams.get('model') || '/transformer';
  const pointCloudModelUrl = new URL(location.href).searchParams.get('pointcloud') || '/transformer-point-cloud';

  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer();
  renderer.setClearColor('#000000');
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  Potree.XHRFactory.config.customHeaders.push({ header: 'MyDummyHeader', value: 'MyDummyValue' });

  const sectorModel = await reveal.createLocalCadModel(cadModelUrl);
  const sectorModelNode = new reveal.CadNode(sectorModel);
  const sectorModelOffsetRoot = new THREE.Group();
  sectorModelOffsetRoot.name = 'Sector model offset root';
  sectorModelOffsetRoot.add(sectorModelNode);
  scene.add(sectorModelOffsetRoot);
  const { fetchSectorMetadata } = sectorModel;
  const [modelScene, modelTransform] = await fetchSectorMetadata();

  const pointCloudModel = reveal.createLocalPointCloudModel(pointCloudModelUrl);
  const [pointCloudGroup, pointCloudNode] = await reveal.createThreeJsPointCloudNode(pointCloudModel);
  scene.add(pointCloudGroup);

  let settingsChanged = false;
  function handleSettingsChanged() {
    settingsChanged = true;
  }
  const renderOptions = initializeGui(sectorModelNode, pointCloudGroup, pointCloudNode, handleSettingsChanged);

  const { position, target, near, far } = reveal.internal.suggestCameraConfig(modelScene.root);
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, near, far);
  const controls = new CameraControls(camera, renderer.domElement);
  const threePos = reveal.toThreeVector3(new THREE.Vector3(), position, sectorModelNode.modelTransformation);
  const threeTarget = reveal.toThreeVector3(new THREE.Vector3(), target, sectorModelNode.modelTransformation);
  controls.setLookAt(threePos.x, threePos.y, threePos.z, threeTarget.x, threeTarget.y, threeTarget.z);
  controls.update(0.0);
  camera.updateMatrixWorld();

  const clock = new THREE.Clock();
  const render = async () => {
    const delta = clock.getDelta();
    const controlsNeedUpdate = controls.update(delta);
    const modelNeedsUpdate = renderOptions.loadingEnabled && (await sectorModelNode.update(camera));
    const needsUpdate =
      renderOptions.renderMode === RenderMode.AlwaysRender ||
      (renderOptions.renderMode === RenderMode.WhenNecessary &&
        (controlsNeedUpdate || modelNeedsUpdate || pointCloudGroup.needsRedraw || settingsChanged));

    if (needsUpdate) {
      applyRenderingFilters(scene, renderOptions.renderFilter);
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

function initializeGui(
  cadNode: reveal.CadNode,
  pcGroup: reveal.internal.PotreeGroupWrapper,
  pcNode: reveal.internal.PotreeNodeWrapper,
  handleSettingsChangedCb: () => void
): RenderOptions {
  const gui = new dat.GUI();
  gui
    .add(pcGroup, 'visible')
    .name('Show point cloud')
    .onChange(handleSettingsChangedCb);
  gui
    .add(cadNode, 'visible')
    .name('Show CAD')
    .onChange(handleSettingsChangedCb);
  const pcGui = gui.addFolder('Point cloud');
  pcGui
    .add(pcGroup.position, 'x')
    .name('Offset X')
    .onChange(handleSettingsChangedCb);
  pcGui
    .add(pcGroup.position, 'y')
    .name('Offset Y')
    .onChange(handleSettingsChangedCb);
  pcGui
    .add(pcGroup.position, 'z')
    .name('Offset Z')
    .onChange(handleSettingsChangedCb);
  const rotation = { y: pcGroup.rotation.y };
  pcGui
    .add(rotation, 'y')
    .name('Rotation')
    .onChange(newValue => {
      pcGroup.setRotationFromEuler(new THREE.Euler(0.0, newValue, 0.0));
      handleSettingsChangedCb();
    });

  pcGui.add(pcNode, 'pointBudget', 0, 10_000_000);
  pcGui.add(pcNode, 'pointSize', 0, 10).onChange(handleSettingsChangedCb);
  pcGui
    .add(pcNode, 'pointColorType', {
      Rgb: reveal.internal.PotreePointColorType.Rgb,
      Depth: reveal.internal.PotreePointColorType.Depth,
      Height: reveal.internal.PotreePointColorType.Height,
      PointIndex: reveal.internal.PotreePointColorType.PointIndex,
      LevelOfDetail: reveal.internal.PotreePointColorType.LevelOfDetail,
      Classification: reveal.internal.PotreePointColorType.Classification
    })
    .onChange((valueAsString: string) => {
      const value: reveal.internal.PotreePointColorType = parseInt(valueAsString, 10);
      pcNode.pointColorType = value;
      handleSettingsChangedCb();
    });
  pcGui
    .add(pcNode, 'pointShape', {
      Circle: reveal.internal.PotreePointShape.Circle,
      Square: reveal.internal.PotreePointShape.Square
    })
    .onChange((valueAsString: string) => {
      const value: reveal.internal.PotreePointShape = parseInt(valueAsString, 10);
      pcNode.pointShape = value;
      handleSettingsChangedCb();
    });
  return createDefaultRenderOptions();
  // Uncomment to enable debugging widget
  // return createRendererDebugWidget(renderer, scene, gui.addFolder('Debug'));
}

main();
