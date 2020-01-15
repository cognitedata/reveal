/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';
import * as reveal from '@cognite/reveal';
import CameraControls from 'camera-controls';
import dat from 'dat.gui';
import { createRendererDebugWidget } from './utils/renderer-debug-widget';

CameraControls.install({ THREE });

type RenderFilter = {
  renderQuads: boolean;
  renderPrimitives: boolean;
  renderTriangleMeshes: boolean;
  renderInstancedMeshes: boolean;
};

type Options = {
  suspendLoading: boolean;
  renderFilter: RenderFilter;
};

async function initializeModel(
  sectorModel: reveal.SectorModel,
  canvas: HTMLCanvasElement,
  gui: dat.GUI
): Promise<[THREE.WebGLRenderer, THREE.Scene, reveal.RootSectorNode, Options]> {
  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setClearColor('#444');
  renderer.setSize(canvas.width, canvas.height);

  const scene = new THREE.Scene();
  const sectorModelNode = await reveal.createThreeJsSectorNode(sectorModel);
  scene.add(sectorModelNode);

  const options: Options = {
    suspendLoading: false,
    renderFilter: {
      renderInstancedMeshes: true,
      renderPrimitives: true,
      renderQuads: true,
      renderTriangleMeshes: true
    }
  };
  initializeGui(gui, options, renderer, scene);

  return [renderer, scene, sectorModelNode, options];
}

async function main() {
  const modelUrl1 = new URL(location.href).searchParams.get('model1') || '/primitives';
  const modelUrl2 = new URL(location.href).searchParams.get('model2') || modelUrl1;

  // Page layout
  const gui1 = new dat.GUI({ autoPlace: false });
  const gui2 = new dat.GUI({ autoPlace: false });
  document.getElementById('gui1')!.appendChild(gui1.domElement);
  document.getElementById('gui2')!.appendChild(gui2.domElement);
  document.getElementById('header1')!.appendChild(document.createTextNode(modelUrl1));
  document.getElementById('header2')!.appendChild(document.createTextNode(modelUrl2));
  const leftCanvas = document.getElementById('leftCanvas')! as HTMLCanvasElement;
  const rightCanvas = document.getElementById('rightCanvas')! as HTMLCanvasElement;

  // Initialize models
  const model1 = reveal.createLocalSectorModel(modelUrl1);
  const model2 = reveal.createLocalSectorModel(modelUrl2);
  const [renderer1, scene1, modelNode1, options1] = await initializeModel(model1, leftCanvas, gui1);
  const [renderer2, scene2, modelNode2, options2] = await initializeModel(model2, rightCanvas, gui2);

  const fetchMetadata: reveal.internal.FetchSectorMetadataDelegate = model1[0];
  const [modelScene, modelTransform] = await fetchMetadata();
  const { position, target, near, far } = reveal.internal.suggestCameraConfig(modelScene.root);
  const camera = new THREE.PerspectiveCamera(75, leftCanvas.width / leftCanvas.height, near, far);
  const controls = new CameraControls(camera, leftCanvas);
  const threePos = reveal.toThreeVector3(position, modelNode1.modelTransformation);
  const threeTarget = reveal.toThreeVector3(target, modelNode2.modelTransformation);
  controls.setLookAt(threePos.x, threePos.y, threePos.z, threeTarget.x, threeTarget.y, threeTarget.z);
  controls.update(0.0);
  camera.updateMatrixWorld();

  const clock = new THREE.Clock();
  const render = async () => {
    requestAnimationFrame(render);

    const delta = clock.getDelta();
    const controlsNeedUpdate = controls.update(delta);
    const sectors1NeedUpdate = !options1.suspendLoading && (await modelNode1.update(camera));
    const sectors2NeedUpdate = !options2.suspendLoading && (await modelNode2.update(camera));

    if (controlsNeedUpdate || sectors1NeedUpdate) {
      applyRenderingFilters(scene1, options1.renderFilter);
      renderer1.render(scene1, camera);
    }
    if (controlsNeedUpdate || sectors2NeedUpdate) {
      applyRenderingFilters(scene2, options2.renderFilter);
      renderer2.render(scene2, camera);
    }
  };
  render();
}

function initializeGui(gui: dat.GUI, options: Options, renderer: THREE.WebGLRenderer, scene: THREE.Scene) {
  const filterGui = gui.addFolder('Filtering');
  filterGui.add(options.renderFilter, 'renderInstancedMeshes').name('Instanced meshes');
  filterGui.add(options.renderFilter, 'renderPrimitives').name('Primitives');
  filterGui.add(options.renderFilter, 'renderTriangleMeshes').name('Triangle meshes');
  filterGui.add(options.renderFilter, 'renderQuads').name('Quads');
  createRendererDebugWidget(renderer, scene, gui);
}

function applyRenderingFilters(scene: THREE.Scene, filter: RenderFilter) {
  scene.traverse(x => {
    if (x.name.startsWith('Primitives')) {
      x.visible = filter.renderPrimitives;
    } else if (x.name.startsWith('Triangle mesh')) {
      x.visible = filter.renderTriangleMeshes;
    } else if (x.name.startsWith('Instanced mesh')) {
      x.visible = filter.renderInstancedMeshes;
    } else if (x.name.startsWith('Quads')) {
      x.visible = filter.renderQuads;
    }
  });
}

main();
