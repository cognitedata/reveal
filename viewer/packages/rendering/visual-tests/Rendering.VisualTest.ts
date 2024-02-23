/*!
 * Copyright 2022 Cognite AS
 */

import { DefaultNodeAppearance, TreeIndexNodeCollection } from '@reveal/cad-styling';
import { DeferredPromise, NumericRange, SceneHandler } from '@reveal/utilities';
import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { AntiAliasingMode, defaultRenderOptions, DefaultRenderPipelineProvider, PointCloudMaterialManager } from '..';

import {
  StreamingVisualTestFixture,
  StreamingTestFixtureComponents
} from '../../../visual-tests/test-fixtures/StreamingVisualTestFixture';
import { CadMaterialManager } from '../src/CadMaterialManager';
import { StepPipelineExecutor } from '../src/pipeline-executors/StepPipelineExecutor';

export default class RenderingVisualTestFixture extends StreamingVisualTestFixture {
  private readonly guiData = {
    frameTime: 0.1,
    steps: 0
  };

  public async setup(testFixtureComponents: StreamingTestFixtureComponents): Promise<void> {
    const { sceneHandler, model, camera, renderer, cadMaterialManager, pcMaterialManager } = testFixtureComponents;

    const stepPipelineExecutor = new StepPipelineExecutor(renderer);
    this.pipelineExecutor = stepPipelineExecutor;

    const grid = this.getGridFromBoundingBox(model.boundingBox);
    sceneHandler.addObject3D(grid);

    const customBox = this.getCustomBoxFromBoundingBox(model.boundingBox);
    sceneHandler.addObject3D(customBox);

    const transformControls = this.attachTransformControlsTo(customBox, camera, renderer.domElement);
    sceneHandler.addObject3D(transformControls);

    await this.setupMockCadStyling(cadMaterialManager, model.geometryNode.type);

    this.setupGui(stepPipelineExecutor, renderer, cadMaterialManager, pcMaterialManager, sceneHandler);
  }

  private setupGui(
    stepPipelineExecutor: StepPipelineExecutor,
    renderer: THREE.WebGLRenderer,
    cadMaterialManager: CadMaterialManager,
    pcMaterialManager: PointCloudMaterialManager,
    sceneHandler: SceneHandler
  ) {
    this._frameStatsGUIFolder.add(this.guiData, 'frameTime').listen();
    const executorOptions = this.gui.addFolder('Pipeline Executor Options');
    executorOptions.open();

    this.guiData.steps = stepPipelineExecutor.calcNumSteps(this.pipelineProvider);
    executorOptions.add(this.guiData, 'steps', 1, this.guiData.steps, 1).onChange(async () => {
      stepPipelineExecutor.numberOfSteps = this.guiData.steps;
      this.render();
    });

    const renderOptions = defaultRenderOptions;
    renderOptions.multiSampleCountHint = 4;

    const updateRenderOptions = () => {
      this.pipelineProvider.dispose();
      this.pipelineProvider = new DefaultRenderPipelineProvider(
        cadMaterialManager,
        pcMaterialManager,
        sceneHandler,
        renderOptions
      );
      this.render();
    };

    const edgeDetectionParametersGUI = this.gui.addFolder('Edge Detection');
    edgeDetectionParametersGUI.add(renderOptions.edgeDetectionParameters, 'enabled').onChange(updateRenderOptions);
    edgeDetectionParametersGUI.open();

    const antiAliasingGui = this.gui.addFolder('Anti Aliasing');
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

    const ssaoOptionsGui = this.gui.addFolder('SSAO');
    ssaoOptionsGui.add(renderOptions.ssaoRenderParameters, 'sampleRadius', 0, 30).onChange(updateRenderOptions);
    ssaoOptionsGui.add(renderOptions.ssaoRenderParameters, 'sampleSize', 0, 256, 1).onChange(updateRenderOptions);
    ssaoOptionsGui.add(renderOptions.ssaoRenderParameters, 'depthCheckBias', 0, 1).onChange(updateRenderOptions);
    ssaoOptionsGui.open();

    this.setupBackgroundColorGUI(renderer);
  }

  private timings: number[] = [];
  public render(): void {
    const stepPipelineExecutor = this.pipelineExecutor as StepPipelineExecutor;

    if (stepPipelineExecutor === undefined) {
      super.render();
      return;
    }

    if (stepPipelineExecutor.timings !== undefined && stepPipelineExecutor.timings.length > 0) {
      if (this.timings.length >= 20) {
        const frameTime = this.timings.reduce((sum, current) => sum + current, 0) / this.timings.length;
        this.guiData.frameTime = frameTime;
        this.timings = [];
      } else {
        this.timings.push(stepPipelineExecutor.timings[stepPipelineExecutor.timings.length - 1]);
      }
    }
    super.render();
  }

  private setupBackgroundColorGUI(renderer: THREE.WebGLRenderer) {
    const backgroundGuiData: {
      canvasColor: `#${string}`;
      clearColor: `#${string}`;
      clearAlpha: number;
    } = {
      canvasColor: '#50728c',
      clearColor: '#444',
      clearAlpha: 1
    };

    renderer.setClearColor(new THREE.Color(backgroundGuiData.clearColor).convertLinearToSRGB());
    renderer.setClearAlpha(backgroundGuiData.clearAlpha);
    renderer.domElement.style.backgroundColor = backgroundGuiData.canvasColor;

    const renderOptionsGUI = this.gui.addFolder('Render Options');
    renderOptionsGUI.open();

    renderOptionsGUI.addColor(backgroundGuiData, 'clearColor').onChange(async () => {
      renderer.setClearColor(new THREE.Color(backgroundGuiData.clearColor).convertLinearToSRGB());
      renderer.setClearAlpha(backgroundGuiData.clearAlpha);
      this.render();
    });

    renderOptionsGUI.add(backgroundGuiData, 'clearAlpha', 0, 1).onChange(async () => {
      renderer.setClearColor(new THREE.Color(backgroundGuiData.clearColor).convertLinearToSRGB());
      renderer.setClearAlpha(backgroundGuiData.clearAlpha);
      this.render();
    });

    renderOptionsGUI.addColor(backgroundGuiData, 'canvasColor').onChange(async () => {
      renderer.domElement.style.backgroundColor = backgroundGuiData.canvasColor;
    });
  }

  private setupMockCadStyling(materialManager: CadMaterialManager, modelType: string): Promise<void> {
    if (modelType !== 'CadNode') {
      return Promise.resolve();
    }

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

    return resolveOnNodeAppearanceChanged();

    function resolveOnNodeAppearanceChanged(): Promise<void> {
      const deferredPromise = new DeferredPromise<void>();
      nodeAppearanceProvider.on('changed', () => deferredPromise.resolve());
      return deferredPromise;
    }
  }

  private getGridFromBoundingBox(boundingBox: THREE.Box3): THREE.GridHelper {
    const gridSize = new THREE.Vector2(boundingBox.max.x - boundingBox.min.x, boundingBox.max.z - boundingBox.min.z);
    const grid = new THREE.GridHelper(
      gridSize.x,
      20,
      new THREE.Color('#444444').convertLinearToSRGB(),
      new THREE.Color('#888888').convertLinearToSRGB()
    ); //THIS IS WRONG
    grid.position.copy(boundingBox.getCenter(new THREE.Vector3()));
    grid.position.setY(boundingBox.min.y);

    return grid;
  }

  private getCustomBoxFromBoundingBox(boundingBox: THREE.Box3): THREE.Mesh {
    const customBox = new THREE.Mesh(
      new THREE.BoxGeometry(10, 10, 30),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(1, 0, 0),
        transparent: true,
        opacity: 0.5,
        depthTest: false
      })
    );

    const boxCenter = boundingBox.getCenter(new THREE.Vector3());
    customBox.position.copy(boxCenter);

    return customBox;
  }

  private attachTransformControlsTo(
    object: THREE.Object3D,
    camera: THREE.PerspectiveCamera,
    canvas: HTMLCanvasElement
  ) {
    const transformControls = new TransformControls(camera, canvas);
    transformControls.attach(object);
    return transformControls;
  }
}
