/*!
 * Copyright 2020 Cognite AS
 */

// TODO: j-bjorne 28-04-2020: Investigate why show bounding boxes doesn't work.

import * as THREE from 'three';

import CameraControls from 'camera-controls';
import dat from 'dat.gui';
import {
  createRendererDebugWidget,
  applyRenderingFilters,
  RenderMode,
  RenderOptions
} from './utils/renderer-debug-widget';
import { CogniteClient } from '@cognite/sdk';
import { CadNode, SimpleRevealManager } from '@cognite/reveal/threejs';
import { getParamsFromURL } from './utils/example-helpers';

CameraControls.install({ THREE });

function getModel2Params() {
  const url = new URL(location.href);
  const searchParams = url.searchParams;
  const modelRevision2 = searchParams.get('model2');
  const modelUrl2 = searchParams.get('modelUrl2');
  return {
    modelRevision2: modelRevision2 ? Number.parseInt(modelRevision2, 10) : undefined,
    modelUrl2: modelUrl2 ? location.origin + '/' + modelUrl2 : undefined
  };
}

function initializeModel(
  cadNode: CadNode,
  canvas: HTMLCanvasElement,
  gui: dat.GUI
): [THREE.WebGLRenderer, THREE.Scene, CadNode, RenderOptions] {
  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setClearColor('#444');
  renderer.setSize(canvas.width, canvas.height);

  const sectorScene = cadNode.cadModel.scene;
  const scene = new THREE.Scene();
  scene.add(cadNode);
  const options = createRendererDebugWidget(sectorScene.root, renderer, cadNode, gui);
  return [renderer, scene, cadNode, options];
}

async function main() {
  const { project, modelUrl, modelRevision } = getParamsFromURL({ project: 'publicdata', modelUrl: 'primitives' });
  const { modelUrl2, modelRevision2 } = getModel2Params();
  const client = new CogniteClient({ appId: 'reveal.example.side-by-side' });
  client.loginWithOAuth({ project });

  let modelsNeedUpdate = true;
  const revealManager1 = new SimpleRevealManager(client, () => {
    modelsNeedUpdate = true;
  });

  const revealManager2 = new SimpleRevealManager(client, () => {
    modelsNeedUpdate = true;
  });

  let model1: CadNode;
  if (modelUrl) {
    model1 = await revealManager1.addModelFromUrl(modelUrl);
  } else if (modelRevision) {
    model1 = await revealManager1.addModelFromCdf(modelRevision);
  } else {
    throw new Error('Need to provide either project & model OR modelUrl as query parameters');
  }
  let model2: CadNode;
  if (modelUrl2) {
    model2 = await revealManager2.addModelFromUrl(modelUrl2);
  } else if (modelRevision2) {
    model2 = await revealManager2.addModelFromCdf(modelRevision2);
  } else {
    throw new Error('Need to provide either model2 OR modelUrl2 as an additional query parameters');
  }
  const params = new URL(location.href).searchParams;
  const modelHeader1 = params.get('modelUrl') || `${params.get('model')}@${params.get('project')}`;
  const modelHeader2 = params.get('modelUrl2') || `${params.get('model2')}@${params.get('project')}`;

  // Page layout
  const gui1 = new dat.GUI({ autoPlace: false, width: 300 });
  const gui2 = new dat.GUI({ autoPlace: false, width: 300 });
  document.getElementById('gui1')!.appendChild(gui1.domElement);
  document.getElementById('gui2')!.appendChild(gui2.domElement);
  document.getElementById('header1')!.appendChild(document.createTextNode(modelHeader1));
  document.getElementById('header2')!.appendChild(document.createTextNode(modelHeader2));
  const leftCanvas = document.getElementById('leftCanvas')! as HTMLCanvasElement;
  const rightCanvas = document.getElementById('rightCanvas')! as HTMLCanvasElement;

  // Initialize models
  const [renderer1, scene1, modelNode1, options1] = initializeModel(model1, leftCanvas, gui1);
  const [renderer2, scene2, modelNode2, options2] = initializeModel(model2, rightCanvas, gui2);

  const { position, target, near, far } = modelNode1.suggestCameraConfig();
  const camera = new THREE.PerspectiveCamera(75, leftCanvas.width / leftCanvas.height, near, far);
  const controls = new CameraControls(camera, leftCanvas);
  controls.setLookAt(position.x, position.y, position.z, target.x, target.y, target.z);
  controls.update(0.0);
  camera.updateMatrixWorld();
  revealManager1.update(camera);
  revealManager2.update(camera);

  const clock = new THREE.Clock();
  const render = async () => {
    requestAnimationFrame(render);

    const delta = clock.getDelta();
    const controlsNeedUpdate = controls.update(delta);
    if (options1.loadingEnabled) {
      revealManager1.update(camera);
    }
    if (options2.loadingEnabled) {
      revealManager2.update(camera);
    }

    if (
      options1.renderMode === RenderMode.AlwaysRender ||
      (options1.renderMode === RenderMode.WhenNecessary && (controlsNeedUpdate || modelsNeedUpdate))
    ) {
      applyRenderingFilters(scene1, options1.renderFilter);
      renderer1.render(scene1, camera);
    }
    if (
      options2.renderMode === RenderMode.AlwaysRender ||
      (options2.renderMode === RenderMode.WhenNecessary && (controlsNeedUpdate || modelsNeedUpdate))
    ) {
      applyRenderingFilters(scene2, options2.renderFilter);
      renderer2.render(scene2, camera);
    }
  };
  render();
}

main();
