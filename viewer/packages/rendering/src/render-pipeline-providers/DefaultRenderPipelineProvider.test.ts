/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { IMock, It, Mock } from 'moq.ts';
import { DefaultRenderPipelineProvider } from './DefaultRenderPipelineProvider';
import { CadMaterialManager } from '../CadMaterialManager';
import { IndexSet, SceneHandler } from '@reveal/utilities';
import { defaultRenderOptions } from '../rendering/types';

describe(DefaultRenderPipelineProvider.name, () => {
  let rendererMock: IMock<THREE.WebGLRenderer>;

  beforeEach(() => {
    rendererMock = new Mock<THREE.WebGLRenderer>()
      .setup(p => (p.info.autoReset = It.IsAny()))
      .callback(() => true)
      .setup(p => p.info.reset())
      .returns()
      .setup(p => p.getClearColor(It.IsAny()))
      .returns(new THREE.Color())
      .setup(p => p.getClearAlpha())
      .returns(0)
      .setup(p => p.setClearColor(It.IsAny(), It.IsAny()))
      .returns()
      .setup(p => p.getSize(It.IsAny()))
      .returns(new THREE.Vector2())
      .setup(p => p.setRenderTarget(It.IsAny()))
      .returns()
      .setup(p => p.clear())
      .returns();
  });

  test('Pipeline with one cad model with back styling should return 4 passes', () => {
    const materialManagerMock = new Mock<CadMaterialManager>()
      .setup(p => p.getModelBackTreeIndices('0'))
      .returns(new IndexSet([0]))
      .setup(p => p.getModelGhostedTreeIndices('0'))
      .returns(new IndexSet([]))
      .setup(p => p.getModelInFrontTreeIndices('0'))
      .returns(new IndexSet([]));

    const sceneHandler = new SceneHandler();

    sceneHandler.addCadModel(new THREE.Object3D(), '0');

    const defaultRenderPipelineProvider = new DefaultRenderPipelineProvider(
      materialManagerMock.object(),
      sceneHandler,
      defaultRenderOptions
    );

    const pipeline = defaultRenderPipelineProvider.pipeline(rendererMock.object());

    let numberOfRenderPasses = 0;
    for (const _ of pipeline) {
      numberOfRenderPasses++;
    }

    expect(numberOfRenderPasses).toBe(4); //Back, SSAO, Post, BlitToCanvas
  });

  test('Pipeline with one cad model with all styling should return 6 passes', () => {
    const materialManagerMock = new Mock<CadMaterialManager>()
      .setup(p => p.getModelBackTreeIndices('0'))
      .returns(new IndexSet([0]))
      .setup(p => p.getModelGhostedTreeIndices('0'))
      .returns(new IndexSet([0]))
      .setup(p => p.getModelInFrontTreeIndices('0'))
      .returns(new IndexSet([0]));

    const sceneHandler = new SceneHandler();

    sceneHandler.addCadModel(new THREE.Object3D(), '0');

    const defaultRenderPipelineProvider = new DefaultRenderPipelineProvider(
      materialManagerMock.object(),
      sceneHandler,
      defaultRenderOptions
    );

    const pipeline = defaultRenderPipelineProvider.pipeline(rendererMock.object());

    let numberOfRenderPasses = 0;
    for (const _ of pipeline) {
      numberOfRenderPasses++;
    }

    expect(numberOfRenderPasses).toBe(6); //Back, Ghost, In-front SSAO, Post, BlitToCanvas
  });

  test('Pipeline with one custom object return two passes', () => {
    const materialManagerMock = new Mock<CadMaterialManager>();

    const sceneHandler = new SceneHandler();

    sceneHandler.addCustomObject(new THREE.Object3D());

    const defaultRenderPipelineProvider = new DefaultRenderPipelineProvider(
      materialManagerMock.object(),
      sceneHandler,
      defaultRenderOptions
    );

    const pipeline = defaultRenderPipelineProvider.pipeline(rendererMock.object());

    let numberOfRenderPasses = 0;
    for (const _ of pipeline) {
      numberOfRenderPasses++;
    }

    expect(numberOfRenderPasses).toBe(2); // Post, BlitToCanvas
  });

  test('Pipeline with one cad model with back styling and no ssao samples should return 3 passes', () => {
    const materialManagerMock = new Mock<CadMaterialManager>()
      .setup(p => p.getModelBackTreeIndices('0'))
      .returns(new IndexSet([0]))
      .setup(p => p.getModelGhostedTreeIndices('0'))
      .returns(new IndexSet([]))
      .setup(p => p.getModelInFrontTreeIndices('0'))
      .returns(new IndexSet([]));

    const sceneHandler = new SceneHandler();

    sceneHandler.addCadModel(new THREE.Object3D(), '0');

    const renderOptions = defaultRenderOptions;
    renderOptions.ssaoRenderParameters.sampleSize = 0;

    const defaultRenderPipelineProvider = new DefaultRenderPipelineProvider(
      materialManagerMock.object(),
      sceneHandler,
      renderOptions
    );

    const pipeline = defaultRenderPipelineProvider.pipeline(rendererMock.object());

    let numberOfRenderPasses = 0;
    for (const _ of pipeline) {
      numberOfRenderPasses++;
    }

    expect(numberOfRenderPasses).toBe(3); //Back, Post, BlitToCanvas
  });
});
