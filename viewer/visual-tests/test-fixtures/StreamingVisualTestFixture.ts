/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { CadManager, CadModelUpdateHandler } from '../../packages/cad-geometry-loaders';
import { ByScreenSizeSectorCuller } from '../../packages/cad-geometry-loaders/src/sector/culling/ByScreenSizeSectorCuller';
import { CadModelFactory, CadNode } from '../../packages/cad-model';
import {
  BasicPipelineExecutor,
  CadMaterialManager,
  defaultRenderOptions,
  DefaultRenderPipelineProvider,
  RenderPipelineExecutor,
  RenderPipelineProvider
} from '../../packages/rendering';
import { createDataProviders } from './utilities/createDataProviders';
import { VisualTestFixture } from './VisualTestFixture';
import { DeferredPromise, fitCameraToBoundingBox, SceneHandler } from '../../packages/utilities';
import { ModelIdentifier, ModelMetadataProvider } from '../../packages/modeldata-api';
import { LoadingState } from '../../packages/model-base';
import { PointCloudManager, PointCloudNode, PotreePointColorType } from '../../packages/pointclouds';
import { PointCloudMetadataRepository } from '../../packages/pointclouds/src/PointCloudMetadataRepository';
import { PointCloudFactory } from '../../packages/pointclouds/src/PointCloudFactory';
import dat from 'dat.gui';

export type StreamingTestFixtureComponents = {
  renderer: THREE.WebGLRenderer;
  sceneHandler: SceneHandler;
  model: {
    geometryNode: CadNode | PointCloudNode;
    boundingBox: THREE.Box3;
  };
  camera: THREE.PerspectiveCamera;
  cameraControls: OrbitControls;
  cadMaterialManager: CadMaterialManager;
};

export abstract class StreamingVisualTestFixture implements VisualTestFixture {
  private readonly _perspectiveCamera: THREE.PerspectiveCamera;
  private readonly _sceneHandler: SceneHandler;
  private readonly _renderer: THREE.WebGLRenderer;
  private readonly _controls: OrbitControls;
  private readonly _materialManager: CadMaterialManager;
  private readonly _gui: dat.GUI;

  protected readonly _frameStatisticsGUIData: { drawCalls: number; pointCount: number; triangleCount: number };
  protected readonly _frameStatsGUIFolder: dat.GUI;

  private _renderPipelineProvider: RenderPipelineProvider;
  private _pipelineExecutor: RenderPipelineExecutor;

  get gui(): dat.GUI {
    return this._gui;
  }

  set pipelineExecutor(pipelineExecutor: RenderPipelineExecutor) {
    this._pipelineExecutor = pipelineExecutor;
  }

  get pipelineExecutor(): RenderPipelineExecutor {
    return this._pipelineExecutor;
  }

  set pipelineProvider(pipelineProvider: RenderPipelineProvider) {
    this._renderPipelineProvider = pipelineProvider;
  }

  get pipelineProvider(): RenderPipelineProvider {
    return this._renderPipelineProvider;
  }

  constructor() {
    this._perspectiveCamera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);

    this._sceneHandler = new SceneHandler();

    this._renderer = new THREE.WebGLRenderer();
    this._renderer.setPixelRatio(window.devicePixelRatio);

    this._renderer.setPixelRatio(window.devicePixelRatio);

    this._controls = new OrbitControls(this._perspectiveCamera, this._renderer.domElement);

    this._materialManager = new CadMaterialManager();
    this._pipelineExecutor = new BasicPipelineExecutor(this._renderer);
    this._renderPipelineProvider = new DefaultRenderPipelineProvider(
      this._materialManager,
      this._sceneHandler,
      defaultRenderOptions
    );

    this._gui = new dat.GUI();

    this._frameStatisticsGUIData = {
      drawCalls: 0,
      pointCount: 0,
      triangleCount: 0
    };

    this._frameStatsGUIFolder = this._gui.addFolder('frameStats');
    this._frameStatsGUIFolder.open();
    this._frameStatsGUIFolder.name = 'Frame Statistics';
    this._frameStatsGUIFolder.add(this._frameStatisticsGUIData, 'drawCalls').listen();
    this._frameStatsGUIFolder.add(this._frameStatisticsGUIData, 'pointCount').listen();
    this._frameStatsGUIFolder.add(this._frameStatisticsGUIData, 'triangleCount').listen();
  }

  public async run(): Promise<void> {
    this.updateRenderer();
    const { modelDataProvider, modelIdentifier, modelMetadataProvider } = await createDataProviders();

    const cadModelFactory = new CadModelFactory(this._materialManager, modelMetadataProvider, modelDataProvider);
    const cadModelUpdateHandler = new CadModelUpdateHandler(new ByScreenSizeSectorCuller(), true);
    const cadManager = new CadManager(this._materialManager, cadModelFactory, cadModelUpdateHandler);

    const pointCloudMetadataRepository = new PointCloudMetadataRepository(modelMetadataProvider, modelDataProvider);
    const pointCloudFactory = new PointCloudFactory(modelDataProvider);
    const pointCloudManager = new PointCloudManager(
      pointCloudMetadataRepository,
      pointCloudFactory,
      this._sceneHandler.scene,
      this._renderer
    );

    const model = await this.addModel(modelIdentifier, modelMetadataProvider, cadManager, pointCloudManager);

    const modelLoadedPromise = this.getModelLoadedPromise(model, cadManager, pointCloudManager);

    const boundingBox = this.getModelBoundingBox(model);

    const { position, target } = fitCameraToBoundingBox(this._perspectiveCamera, boundingBox, 1.5);
    this._perspectiveCamera.position.copy(position);

    this._controls.target.copy(target);
    this._perspectiveCamera.updateMatrixWorld();

    cadManager.updateCamera(this._perspectiveCamera);
    pointCloudManager.updateCamera(this._perspectiveCamera);

    this._controls.addEventListener('change', () => {
      cadManager.updateCamera(this._perspectiveCamera);
      pointCloudManager.updateCamera(this._perspectiveCamera);
      this.render();
    });

    await modelLoadedPromise;

    await this.setup({
      renderer: this._renderer,
      sceneHandler: this._sceneHandler,
      model: {
        geometryNode: model,
        boundingBox
      },
      camera: this._perspectiveCamera,
      cameraControls: this._controls,
      cadMaterialManager: this._materialManager
    });

    this.render();
  }

  public abstract setup(testFixtureComponents: StreamingTestFixtureComponents): Promise<void>;

  public render(): void {
    this._pipelineExecutor.render(this._renderPipelineProvider, this._perspectiveCamera);
    this._frameStatisticsGUIData.drawCalls = this._renderer.info.render.calls;
    this._frameStatisticsGUIData.triangleCount = this._renderer.info.render.triangles;
    this._frameStatisticsGUIData.pointCount = this._renderer.info.render.points;
  }

  private updateRenderer(): void {
    document.body.style.margin = '0px 0px 0px 0px';
    this._renderer.setSize(window.innerWidth, window.innerHeight);
    this._renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(this._renderer.domElement);
  }

  private getModelLoadedPromise(
    model: CadNode | PointCloudNode,
    cadManager: CadManager,
    pointCloudManager: PointCloudManager
  ): Promise<void> {
    const modelLoadedPromise = new DeferredPromise<void>();

    if (model instanceof CadNode) {
      const subscriber = cadManager.getLoadingStateObserver().subscribe(onLoadingStateChange);
      modelLoadedPromise.then(() => subscriber.unsubscribe());
    } else if (model instanceof PointCloudNode) {
      const subscriber = pointCloudManager.getLoadingStateObserver().subscribe(onLoadingStateChange);
      modelLoadedPromise.then(() => subscriber.unsubscribe());

      // TODO: This is a workaround to deal with point cloud loading state currently not working as intended
      // remove this in the future
      setTimeout(() => modelLoadedPromise.resolve(), 1000);
    }

    return modelLoadedPromise;

    function onLoadingStateChange(loadingState: LoadingState) {
      if (loadingState.itemsRequested > 0 && loadingState.itemsRequested === loadingState.itemsLoaded) {
        modelLoadedPromise.resolve();
      }
    }
  }

  private getModelBoundingBox(model: CadNode | PointCloudNode): THREE.Box3 {
    if (model instanceof CadNode) {
      const boundingBox = model.sectorScene.getBoundsOfMostGeometry();
      const cadFromCdfToThreeMatrix = new THREE.Matrix4().set(1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1);
      boundingBox.applyMatrix4(cadFromCdfToThreeMatrix);
      return boundingBox;
    } else if (model instanceof PointCloudNode) {
      return model.potreeNode.boundingBox.clone();
    } else {
      throw new Error(`Unkown type of model(${model})`);
    }
  }

  private async addModel(
    modelIdentifier: ModelIdentifier,
    modelMetadataProvider: ModelMetadataProvider,
    cadManager: CadManager,
    pointCloudManager: PointCloudManager
  ): Promise<CadNode | PointCloudNode> {
    const modelOutputs = (await modelMetadataProvider.getModelOutputs(modelIdentifier)).map(outputs => outputs.format);

    if (modelOutputs.includes('gltf-directory') || modelOutputs.includes('reveal-directory')) {
      const cadModel = await cadManager.addModel(modelIdentifier);
      this._sceneHandler.addCadModel(cadModel, cadModel.cadModelIdentifier);
      return cadModel;
    } else if (modelOutputs.includes('ept-pointcloud')) {
      const pointCloudNode = await pointCloudManager.addModel(modelIdentifier);
      pointCloudNode.pointColorType = PotreePointColorType.Height;
      this._sceneHandler.addCustomObject(pointCloudNode);
      return pointCloudNode;
    } else {
      throw Error(`Unknown output format ${modelOutputs}`);
    }
  }
}
