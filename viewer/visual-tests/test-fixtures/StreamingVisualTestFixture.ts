/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import TWEEN from '@tweenjs/tween.js';

import { CadManager, CadModelUpdateHandler } from '../../packages/cad-geometry-loaders';
import { CadModelFactory, CadNode } from '../../packages/cad-model';
import {
  BasicPipelineExecutor,
  CadGeometryRenderModePipelineProvider,
  CadMaterialManager,
  defaultRenderOptions,
  DefaultRenderPipelineProvider,
  RenderMode,
  RenderPipelineExecutor,
  RenderPipelineProvider,
  PointCloudMaterialManager
} from '../../packages/rendering';
import { createDataProviders } from './utilities/createDataProviders';
import { VisualTestFixture } from './VisualTestFixture';
import {
  BeforeSceneRenderedDelegate,
  DeferredPromise,
  EventTrigger,
  fitCameraToBoundingBox,
  SceneHandler
} from '../../packages/utilities';

import {
  ModelIdentifier,
  ModelMetadataProvider,
  DummyPointCloudStylableObjectProvider,
  ModelDataProvider,
  DummyPointCloudDMStylableObjectProvider
} from '../../packages/data-providers';
import { LoadingState } from '../../packages/model-base';

import { LocalPointClassificationsProvider, PointCloudManager, PointCloudNode } from '../../packages/pointclouds';

import { Potree } from '../../packages/pointclouds/src/potree-three-loader';

import { PointCloudMetadataRepository } from '../../packages/pointclouds/src/PointCloudMetadataRepository';
import { PointCloudFactory } from '../../packages/pointclouds/src/PointCloudFactory';
import dat from 'dat.gui';
import Stats from 'stats.js';
import { ByScreenSizeSectorCuller } from '../../packages/cad-geometry-loaders/src/sector/culling/ByScreenSizeSectorCuller';
import { CogniteClient } from '@cognite/sdk';
import { getDistanceToMeterConversionFactor } from '../../packages/cad-parsers';

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
  pcMaterialManager: PointCloudMaterialManager;
  cadModelUpdateHandler: CadModelUpdateHandler;
  cadManager: CadManager;
  cogniteClient?: CogniteClient;
  onBeforeRender: EventTrigger<BeforeSceneRenderedDelegate>;
};

export abstract class StreamingVisualTestFixture implements VisualTestFixture {
  private readonly _perspectiveCamera: THREE.PerspectiveCamera;
  private readonly _sceneHandler: SceneHandler;
  private readonly _renderer: THREE.WebGLRenderer;
  private readonly _controls: OrbitControls;
  private readonly _materialManager: CadMaterialManager;
  protected readonly _pcMaterialManager: PointCloudMaterialManager;
  private readonly _localModelUrl: string;
  private readonly _statsJs = new Stats();
  private readonly _cadNodes: Array<CadNode>;
  private _gui!: dat.GUI;

  protected readonly _frameStatisticsGUIData = {
    drawCalls: 0,
    pointCount: 0,
    triangleCount: 0
  };
  protected _frameStatsGUIFolder!: dat.GUI;

  private _renderPipelineProvider: RenderPipelineProvider;
  private _pipelineExecutor: RenderPipelineExecutor;
  private _cadManager!: CadManager;
  private _potreeInstance!: Potree;
  private _modelDataProvider!: ModelDataProvider;

  private readonly _depthRenderPipeline: CadGeometryRenderModePipelineProvider;
  private readonly _resizeObserver: ResizeObserver;
  private readonly _onBeforeRender: EventTrigger<BeforeSceneRenderedDelegate>;

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
    if (pipelineProvider !== this._renderPipelineProvider) {
      this._renderPipelineProvider.dispose();
    }

    this._renderPipelineProvider = pipelineProvider;
  }

  get pipelineProvider(): RenderPipelineProvider {
    return this._renderPipelineProvider;
  }

  get potreeInstance(): Potree {
    return this._potreeInstance;
  }

  get modelDataProvider(): ModelDataProvider {
    return this._modelDataProvider;
  }

  /*
   * Overridable field creation methods
   */
  createPointCloudFactory(): PointCloudFactory {
    return new PointCloudFactory(
      this.potreeInstance,
      new DummyPointCloudStylableObjectProvider(),
      new DummyPointCloudDMStylableObjectProvider(),
      new LocalPointClassificationsProvider(),
      this._pcMaterialManager
    );
  }

  createCamera(): THREE.PerspectiveCamera {
    return new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
  }

  createDefaultRenderPipelineProvider(
    materialManager: CadMaterialManager,
    pointCloudMaterialManager: PointCloudMaterialManager,
    sceneHandler: SceneHandler
  ): DefaultRenderPipelineProvider {
    return new DefaultRenderPipelineProvider(materialManager, pointCloudMaterialManager, sceneHandler, {
      ...defaultRenderOptions,
      pointCloudParameters: { pointBlending: false, edlOptions: { radius: 0, strength: 0 } }
    });
  }

  constructor(localModelUrl = 'primitives') {
    this._localModelUrl = localModelUrl;

    this._perspectiveCamera = this.createCamera();

    this._cadNodes = new Array<CadNode>();
    this._sceneHandler = new SceneHandler();

    this._renderer = new THREE.WebGLRenderer();
    this._renderer.setPixelRatio(window.devicePixelRatio);
    this._renderer.localClippingEnabled = true;

    this._controls = new OrbitControls(this._perspectiveCamera, this._renderer.domElement);

    this._materialManager = new CadMaterialManager();
    this._pcMaterialManager = new PointCloudMaterialManager();
    this._pipelineExecutor = new BasicPipelineExecutor(this._renderer);

    this._renderPipelineProvider = this.createDefaultRenderPipelineProvider(
      this._materialManager,
      this._pcMaterialManager,
      this._sceneHandler
    );

    this._depthRenderPipeline = new CadGeometryRenderModePipelineProvider(
      RenderMode.DepthBufferOnly,
      this._materialManager,
      this._sceneHandler
    );

    this._resizeObserver = new ResizeObserver(() => this.render());
    this._onBeforeRender = new EventTrigger<BeforeSceneRenderedDelegate>();

    this._statsJs = new Stats();
    this._statsJs.dom.style.position = 'absolute';
    this._statsJs.dom.style.top = this._statsJs.dom.style.left = '';
    this._statsJs.dom.style.right = this._statsJs.dom.style.bottom = '0px';
    this._statsJs.dom.style.visibility = 'hidden';
    document.body.appendChild(this._statsJs.dom);
  }

  public async run(): Promise<void> {
    this.setupDatGui();

    this.updateRenderer();

    const { modelDataProvider, modelIdentifier, modelMetadataProvider, cogniteClient } = await createDataProviders(
      this._localModelUrl
    );

    this._modelDataProvider = modelDataProvider;

    const pointCloudMetadataRepository = new PointCloudMetadataRepository(modelMetadataProvider, modelDataProvider);
    this._potreeInstance = new Potree(modelDataProvider, this._pcMaterialManager);
    const pointCloudFactory = this.createPointCloudFactory();
    const pointCloudManager = new PointCloudManager(
      pointCloudMetadataRepository,
      this._pcMaterialManager,
      pointCloudFactory,
      this._potreeInstance,
      this._sceneHandler.scene,
      this._renderer
    );
    const sectorCuller = new ByScreenSizeSectorCuller();
    const cadModelFactory = new CadModelFactory(this._materialManager, modelMetadataProvider, modelDataProvider);
    const cadModelUpdateHandler = new CadModelUpdateHandler(sectorCuller, false);
    this._cadManager = new CadManager(this._materialManager, cadModelFactory, cadModelUpdateHandler);

    const model = await this.addModel(modelIdentifier, modelMetadataProvider, this._cadManager, pointCloudManager);

    const modelLoadedPromise = this.getModelLoadedPromise(model, this._cadManager, pointCloudManager);

    const boundingBox = this.getModelBoundingBox(model);

    const { position, target } = fitCameraToBoundingBox(this._perspectiveCamera, boundingBox, 1.5);
    this._perspectiveCamera.position.copy(position);

    this._controls.target.copy(target);
    this._perspectiveCamera.updateMatrixWorld();

    this._cadManager.updateCamera(this._perspectiveCamera, false);
    pointCloudManager.updateCamera(this._perspectiveCamera);

    this._controls.addEventListener('change', () => {
      this._cadManager.updateCamera(this._perspectiveCamera, true);
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
      cadMaterialManager: this._materialManager,
      pcMaterialManager: this._pcMaterialManager,
      cadModelUpdateHandler,
      cadManager: this._cadManager,
      cogniteClient,
      onBeforeRender: this._onBeforeRender
    });

    this._gui.close();

    this.render();
  }

  private setupDatGui() {
    this._gui = new dat.GUI({ autoPlace: false });
    this._gui.domElement.style.position = 'absolute';
    this._gui.domElement.style.right = '0px';
    document.body.appendChild(this._gui.domElement);

    const statsJsState = { visible: false };
    this._frameStatsGUIFolder = this._gui.addFolder('frameStats');
    this._frameStatsGUIFolder.open();
    this._frameStatsGUIFolder.name = 'Frame Statistics';
    this._frameStatsGUIFolder.add(this._frameStatisticsGUIData, 'drawCalls').listen();
    this._frameStatsGUIFolder.add(this._frameStatisticsGUIData, 'pointCount').listen();
    this._frameStatsGUIFolder.add(this._frameStatisticsGUIData, 'triangleCount').listen();
    this._frameStatsGUIFolder
      .add(statsJsState, 'visible')
      .name('Show Stats.js')
      .onChange(() => {
        const { visible } = statsJsState;
        this._statsJs.dom.style.visibility = visible ? 'visible' : 'hidden';
      });
  }

  public abstract setup(testFixtureComponents: StreamingTestFixtureComponents): Promise<void>;

  public render(): void {
    TWEEN.update(TWEEN.now());
    this._onBeforeRender.fire({ frameNumber: 0, renderer: this._renderer, camera: this._perspectiveCamera });
    this._statsJs.begin();
    this._pipelineExecutor.render(this._renderPipelineProvider, this._perspectiveCamera);
    this._statsJs.end();
    this._frameStatisticsGUIData.drawCalls = this._renderer.info.render.calls;
    this._frameStatisticsGUIData.triangleCount = this._renderer.info.render.triangles;
    this._frameStatisticsGUIData.pointCount = this._renderer.info.render.points;
  }

  protected updateRenderer(): void {
    const domElement = document.createElement('div');

    document.body.style.margin = '0px 0px 0px 0px';

    domElement.style.width = '100vw';
    domElement.style.height = '100vh';

    this._renderer.domElement.style.minHeight = '100%';
    this._renderer.domElement.style.minWidth = '100%';
    this._renderer.domElement.style.maxHeight = '100%';
    this._renderer.domElement.style.maxWidth = '100%';

    domElement.appendChild(this._renderer.domElement);
    document.body.appendChild(domElement);

    this._renderer.setSize(domElement.clientWidth, domElement.clientHeight);

    this._resizeObserver.observe(domElement);
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

      // TODO: This is a workaround to deal with point cloud loading state currently not working as intended.
      // Remove this in the future.
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
      const unit = model.cadModelMetadata.scene.unit;
      const scaleFactor = getDistanceToMeterConversionFactor(unit);
      if (scaleFactor) {
        boundingBox.max.multiplyScalar(scaleFactor);
        boundingBox.min.multiplyScalar(scaleFactor);
      }
      return boundingBox;
    } else if (model instanceof PointCloudNode) {
      return model.getBoundingBox().clone();
    } else {
      throw new Error(`Unknown type of model(${model})`);
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

      this._cadNodes.push(cadModel);

      this._sceneHandler.addCadModel(cadModel, cadModel.cadModelIdentifier);
      return cadModel;
    } else if (modelOutputs.includes('ept-pointcloud')) {
      const pointCloudNode = await pointCloudManager.addModel(modelIdentifier);
      this._sceneHandler.addPointCloudModel(pointCloudNode, modelIdentifier.revealInternalId);
      return pointCloudNode;
    } else {
      throw Error(`Unknown output format ${modelOutputs}`);
    }
  }

  public dispose(): void {
    this._resizeObserver.disconnect();
    this._controls.dispose();
    this._cadNodes.forEach(cadNode => cadNode.dispose());
    this._sceneHandler.dispose();
    this._depthRenderPipeline.dispose();
    this.pipelineProvider.dispose();
    this.pipelineExecutor.dispose();
    this._cadManager.dispose();
    this._renderer.dispose();
    this._renderer.forceContextLoss();
  }
}
