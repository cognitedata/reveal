/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import dat from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { CadModelFactory } from '../../cad-model/src/CadModelFactory';
import {
  AntiAliasingMode,
  CadMaterialManager,
  defaultRenderOptions,
  DefaultRenderPipelineProvider
} from '@reveal/rendering';
import {
  CdfModelDataProvider,
  CdfModelIdentifier,
  CdfModelMetadataProvider,
  LocalModelDataProvider,
  LocalModelIdentifier,
  LocalModelMetadataProvider,
  ModelDataProvider,
  ModelIdentifier,
  ModelMetadataProvider
} from '../../modeldata-api';
import { CadManager } from '../../cad-geometry-loaders/src/CadManager';
import { NumericRange, revealEnv, SceneHandler } from '@reveal/utilities';
import { createApplicationSDK } from '../../../test-utilities/src/appUtils';
import { CadModelUpdateHandler, defaultDesktopCadModelBudget } from '../../cad-geometry-loaders';
import { ByScreenSizeSectorCuller } from '../../cad-geometry-loaders/src/sector/culling/ByScreenSizeSectorCuller';
import { StepPipelineExecutor } from '../src/pipeline-executors/StepPipelineExecutor';
import { CognitePointCloudModel, createPointCloudManager } from '../../pointclouds';
import { DefaultNodeAppearance, TreeIndexNodeCollection } from '@reveal/cad-styling';

revealEnv.publicPath = 'https://apps-cdn.cogniteapp.com/@cognite/reveal-parser-worker/1.2.0/';

init();

async function init() {
  const gui = new dat.GUI();

  const guiData = {
    drawCalls: 0,
    gpuFrameTime: 1.1,
    steps: 6,
    canvasColor: '#50728c',
    clearColor: '#444',
    clearAlpha: 1
  };

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const { metadataProvider, dataProvider, modelIdentifier } = await createModelProviders(urlParams);

  const materialManager = new CadMaterialManager();
  const cadModelFactory = new CadModelFactory(materialManager, metadataProvider, dataProvider);
  const cadModelUpdateHandler = new CadModelUpdateHandler(new ByScreenSizeSectorCuller(), false);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(guiData.clearColor);
  renderer.setClearAlpha(guiData.clearAlpha);

  const sceneHandler = new SceneHandler();

  const pointCloudManager = createPointCloudManager(metadataProvider, dataProvider, sceneHandler.scene, renderer);
  pointCloudManager.pointBudget = 1_000_000;
  const cadManager = new CadManager(materialManager, cadModelFactory, cadModelUpdateHandler);
  cadManager.budget = defaultDesktopCadModelBudget;

  const modelOutputs = (await metadataProvider.getModelOutputs(modelIdentifier)).map(outputs => outputs.format);

  let model: THREE.Object3D;
  let boundingBox: THREE.Box3;
  if (modelOutputs.includes('gltf-directory') || modelOutputs.includes('reveal-directory')) {
    const cadModel = await cadManager.addModel(modelIdentifier);
    sceneHandler.addCadModel(cadModel, cadModel.cadModelIdentifier);
    model = cadModel;
    boundingBox = (cadModel as any)._cadModelMetadata.scene.getBoundsOfMostGeometry().clone();
    boundingBox.applyMatrix4(model.children[0].matrix);

    const nodeAppearanceProvider = materialManager.getModelNodeAppearanceProvider('0');
    nodeAppearanceProvider.assignStyledNodeCollection(
      new TreeIndexNodeCollection(new NumericRange(0, 10)),
      DefaultNodeAppearance.Ghosted
    );

    nodeAppearanceProvider.assignStyledNodeCollection(
      new TreeIndexNodeCollection(new NumericRange(10, 20)),
      DefaultNodeAppearance.Highlighted
    );

    nodeAppearanceProvider.assignStyledNodeCollection(new TreeIndexNodeCollection(new NumericRange(40, 41)), {
      ...DefaultNodeAppearance.Default,
      outlineColor: 6
    });
  } else if (modelOutputs.includes('ept-pointcloud')) {
    const pointCloudNode = await pointCloudManager.addModel(modelIdentifier);
    const pointcloudModel = new CognitePointCloudModel(0, 0, pointCloudNode);
    boundingBox = pointcloudModel.getModelBoundingBox();
    sceneHandler.addCustomObject(pointCloudNode);
    model = pointCloudNode;
  } else {
    throw Error(`Unknown output format ${modelOutputs}`);
  }

  model.updateMatrix();
  model.updateWorldMatrix(true, true);

  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);

  let needsRedraw = false;

  const renderOptions = defaultRenderOptions;
  renderOptions.multiSampleCountHint = 4;

  const pipelineExecutor = new StepPipelineExecutor(renderer);

  let defaultRenderPipeline = new DefaultRenderPipelineProvider(materialManager, sceneHandler, defaultRenderOptions);

  setTimeout(() => {
    guiData.steps = pipelineExecutor.calcNumSteps(defaultRenderPipeline);
    pipelineExecutor.numberOfSteps = guiData.steps;
  }, 1000);

  const stepController = gui
    .add(guiData, 'steps', 1, pipelineExecutor.calcNumSteps(defaultRenderPipeline), 1)
    .onChange(async () => {
      pipelineExecutor.numberOfSteps = guiData.steps;
      renderer.setClearColor(guiData.clearColor);
      renderer.setClearAlpha(guiData.clearAlpha);
      needsRedraw = true;
    });

  const stats = gui.addFolder('frame stats');
  const drawCallController = stats.add(guiData, 'drawCalls');
  const gpuFrameTimeController = stats.add(guiData, 'gpuFrameTime');
  stats.open();

  const grid = new THREE.GridHelper(30, 40);
  grid.position.set(14, -1, -14);
  sceneHandler.addCustomObject(grid);

  const customBox = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 30),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(1, 0, 0),
      transparent: true,
      opacity: 0.5,
      depthTest: false
    })
  );

  customBox.position.set(15, 0, -15);
  sceneHandler.addCustomObject(customBox);

  const controlsTest = new TransformControls(camera, renderer.domElement);
  controlsTest.attach(customBox);
  sceneHandler.addCustomObject(controlsTest);

  renderer.domElement.style.backgroundColor = guiData.canvasColor;

  const controls = new OrbitControls(camera, renderer.domElement);

  fitCameraToBoundingBox(boundingBox, camera, controls);

  cadModelUpdateHandler.updateCamera(camera);

  document.body.appendChild(renderer.domElement);

  const updateRenderOptions = async () => {
    defaultRenderPipeline.dispose();
    defaultRenderPipeline = new DefaultRenderPipelineProvider(materialManager, sceneHandler, renderOptions);

    needsRedraw = true;
  };

  const renderOptionsGUI = gui.addFolder('Render Options');
  renderOptionsGUI.open();

  renderOptionsGUI.addColor(guiData, 'clearColor').onChange(async () => {
    renderer.setClearColor(guiData.clearColor);
    renderer.setClearAlpha(guiData.clearAlpha);
    needsRedraw = true;
  });

  renderOptionsGUI.add(guiData, 'clearAlpha', 0, 1).onChange(async () => {
    renderer.setClearColor(guiData.clearColor);
    renderer.setClearAlpha(guiData.clearAlpha);
    needsRedraw = true;
  });

  renderOptionsGUI.addColor(guiData, 'canvasColor').onChange(async () => {
    renderer.domElement.style.backgroundColor = guiData.canvasColor;
  });

  const edgeDetectionParametersGUI = renderOptionsGUI.addFolder('Edge Detection');
  edgeDetectionParametersGUI.add(renderOptions.edgeDetectionParameters, 'enabled').onChange(updateRenderOptions);
  edgeDetectionParametersGUI.open();

  const antiAliasingGui = renderOptionsGUI.addFolder('Anti Aliasing');
  antiAliasingGui
    .add(renderOptions, 'antiAliasing', { NoAA: AntiAliasingMode.NoAA, FXAA: AntiAliasingMode.FXAA })
    .onChange(updateRenderOptions);
  antiAliasingGui
    .add(renderOptions, 'multiSampleCountHint', [0, 2, 4, 8, 16])
    .name('MSAA count')
    .onChange(async () => {
      updateRenderOptions();
    });
  antiAliasingGui.open();

  const ssaoOptionsGui = renderOptionsGUI.addFolder('SSAO');
  ssaoOptionsGui.add(renderOptions.ssaoRenderParameters, 'sampleRadius', 0, 30).onChange(updateRenderOptions);
  ssaoOptionsGui.add(renderOptions.ssaoRenderParameters, 'sampleSize', 0, 256, 1).onChange(updateRenderOptions);
  ssaoOptionsGui.add(renderOptions.ssaoRenderParameters, 'depthCheckBias', 0, 1).onChange(updateRenderOptions);
  ssaoOptionsGui.open();

  controls.addEventListener('change', async () => {
    cadModelUpdateHandler.updateCamera(camera);
    pointCloudManager.updateCamera(camera);
    needsRedraw = true;
  });

  let timings: number[] = [];

  const render = () => {
    pipelineExecutor.render(defaultRenderPipeline, camera);
    guiData.drawCalls = renderer.info.render.calls;
    drawCallController.updateDisplay();
    if (pipelineExecutor.timings.length > 0) {
      if (timings.length >= 20) {
        guiData.gpuFrameTime = timings.reduce((sum, current) => sum + current, 0) / timings.length;
        gpuFrameTimeController.updateDisplay();
        timings = [];
      } else {
        timings.push(pipelineExecutor.timings[pipelineExecutor.timings.length - 1]);
      }
    }

    const numberOfSteps = pipelineExecutor.calcNumSteps(defaultRenderPipeline);
    stepController.max(numberOfSteps);
    guiData.steps = Math.min(numberOfSteps, guiData.steps);
    stepController.updateDisplay();
  };

  const animate = () => {
    controls.update();
    requestAnimationFrame(animate);
    if (!cadManager.needsRedraw && !needsRedraw) {
      return;
    }
    render();

    cadManager.resetRedraw();
    pointCloudManager.resetRedraw();
    needsRedraw = false;
  };

  animate();
}

function fitCameraToBoundingBox(
  box: THREE.Box3,
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  radiusFactor: number = 2
): void {
  const center = new THREE.Vector3().lerpVectors(box.min, box.max, 0.5);
  const radius = 0.5 * new THREE.Vector3().subVectors(box.max, box.min).length();
  const boundingSphere = new THREE.Sphere(center, radius);

  const target = boundingSphere.center;
  const distance = boundingSphere.radius * radiusFactor;
  const direction = new THREE.Vector3(0, 0, -1);
  direction.applyQuaternion(camera.quaternion);

  const position = new THREE.Vector3();
  position.copy(direction).multiplyScalar(-distance).add(target);

  camera.position.copy(position);
  controls.target.copy(target);
}

async function createModelProviders(urlParams: URLSearchParams): Promise<{
  metadataProvider: ModelMetadataProvider;
  dataProvider: ModelDataProvider;
  modelIdentifier: ModelIdentifier;
}> {
  if (urlParams.has('modelUrl')) {
    const modelUrl = urlParams.get('modelUrl')!;
    const modelIdentifier = new LocalModelIdentifier(modelUrl);
    const metadataProvider = new LocalModelMetadataProvider();
    const dataProvider = new LocalModelDataProvider();
    return { metadataProvider, dataProvider, modelIdentifier };
  } else {
    const client = await createApplicationSDK('reveal.example.simple', {
      project: '3d-test',
      cluster: 'greenfield',
      clientId: 'a03a8caf-7611-43ac-87f3-1d493c085579',
      tenantId: '20a88741-8181-4275-99d9-bd4451666d6e'
    });

    // Defaults to all-primitives model on 3d-test
    const modelId = parseInt(urlParams.get('modelId') ?? '1791160622840317');
    const revisionId = parseInt(urlParams.get('revisionId') ?? '498427137020189');

    const modelIdentifier = new CdfModelIdentifier(modelId, revisionId);
    const metadataProvider = new CdfModelMetadataProvider(client);
    const dataProvider = new CdfModelDataProvider(client);

    return { metadataProvider, dataProvider, modelIdentifier };
  }
}
