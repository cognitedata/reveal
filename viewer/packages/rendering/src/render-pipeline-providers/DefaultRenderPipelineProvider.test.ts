/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { IMock, It, Mock } from 'moq.ts';
import { DefaultRenderPipelineProvider } from './DefaultRenderPipelineProvider';
import { CadMaterialManager } from '../CadMaterialManager';
import { IndexSet, SceneHandler } from '@reveal/utilities';
import { defaultRenderOptions } from '../rendering/types';
import { CadNode } from '@reveal/cad-model';
import { PointCloudNode } from '@reveal/pointclouds';
import { createCadModel, createPointCloudModel } from '../../../../test-utilities';
import { PointCloudMaterialManager } from '../PointCloudMaterialManager';

describe(DefaultRenderPipelineProvider.name, () => {
  let rendererMock: IMock<THREE.WebGLRenderer>;
  let cadNodeMock: CadNode;
  let pointCloudNodeMock: PointCloudNode;

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
      .setup(p => p.getDrawingBufferSize(It.IsAny()))
      .returns(new THREE.Vector2())
      .setup(p => p.setRenderTarget(It.IsAny()))
      .returns()
      .setup(p => p.clear())
      .returns()
      .setup(p => p.clearColor())
      .returns();

    const cadModelMock = createCadModel(1, 2);
    cadNodeMock = cadModelMock.cadNode;

    const pointCloudModelMock = createPointCloudModel(1, 0);
    pointCloudNodeMock = pointCloudModelMock.pointCloudNode;
  });

  test('Pipeline with one cad model with back styling should return 4 passes', () => {
    const materialManagerMock = new Mock<CadMaterialManager>()
      .setup(p => p.getModelBackTreeIndices('0'))
      .returns(new IndexSet([0]))
      .setup(p => p.getModelGhostedTreeIndices('0'))
      .returns(new IndexSet([]))
      .setup(p => p.getModelInFrontTreeIndices('0'))
      .returns(new IndexSet([]))
      .setup(p => p.getModelVisibleTreeIndices('0'))
      .returns(new IndexSet([0]));
    const pcMaterialManagerMock = new Mock<PointCloudMaterialManager>()
      .setup(p => p.setModelsMaterialParameters({}))
      .returns();

    const sceneHandler = new SceneHandler();

    sceneHandler.addCadModel(cadNodeMock, '0');

    const defaultRenderPipelineProvider = new DefaultRenderPipelineProvider(
      materialManagerMock.object(),
      pcMaterialManagerMock.object(),
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
      .returns(new IndexSet([0]))
      .setup(p => p.getModelVisibleTreeIndices('0'))
      .returns(new IndexSet([0]));
    const pcMaterialManagerMock = new Mock<PointCloudMaterialManager>()
      .setup(p => p.setModelsMaterialParameters({}))
      .returns();

    const sceneHandler = new SceneHandler();

    sceneHandler.addCadModel(cadNodeMock, '0');

    const defaultRenderPipelineProvider = new DefaultRenderPipelineProvider(
      materialManagerMock.object(),
      pcMaterialManagerMock.object(),
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
    const pcMaterialManagerMock = new Mock<PointCloudMaterialManager>()
      .setup(p => p.setModelsMaterialParameters({}))
      .returns();

    const sceneHandler = new SceneHandler();

    sceneHandler.addObject3D(new THREE.Object3D());

    const defaultRenderPipelineProvider = new DefaultRenderPipelineProvider(
      materialManagerMock.object(),
      pcMaterialManagerMock.object(),
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
      .returns(new IndexSet([]))
      .setup(p => p.getModelVisibleTreeIndices('0'))
      .returns(new IndexSet([0]));
    const pcMaterialManagerMock = new Mock<PointCloudMaterialManager>()
      .setup(p => p.setModelsMaterialParameters({}))
      .returns();

    const sceneHandler = new SceneHandler();

    sceneHandler.addCadModel(cadNodeMock, '0');

    const renderOptions = defaultRenderOptions;
    renderOptions.ssaoRenderParameters.sampleSize = 0;

    const defaultRenderPipelineProvider = new DefaultRenderPipelineProvider(
      materialManagerMock.object(),
      pcMaterialManagerMock.object(),
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

  test('Pipeline with one point cloud model returns 3 passes', () => {
    const materialManagerMock = new Mock<CadMaterialManager>();
    const pcMaterialManagerMock = new Mock<PointCloudMaterialManager>()
      .setup(p => p.setModelsMaterialParameters({}))
      .returns();

    const sceneHandler = new SceneHandler();

    sceneHandler.addPointCloudModel(pointCloudNodeMock, Symbol(0));

    const defaultRenderPipelineProvider = new DefaultRenderPipelineProvider(
      materialManagerMock.object(),
      pcMaterialManagerMock.object(),
      sceneHandler,
      defaultRenderOptions
    );

    const pipeline = defaultRenderPipelineProvider.pipeline(rendererMock.object());

    let numberOfRenderPasses = 0;
    for (const _ of pipeline) {
      numberOfRenderPasses++;
    }

    expect(numberOfRenderPasses).toBe(3); // Point cloud, Post, BlitToCanvas
  });

  test('Pipeline with one point cloud model and point blending enabled returns 4 passes', () => {
    const materialManagerMock = new Mock<CadMaterialManager>();
    const pcMaterialManagerMock = new Mock<PointCloudMaterialManager>()
      .setup(p => p.setModelsMaterialParameters({}))
      .returns();

    const sceneHandler = new SceneHandler();

    sceneHandler.addPointCloudModel(pointCloudNodeMock, Symbol(0));

    const defaultRenderPipelineProvider = new DefaultRenderPipelineProvider(
      materialManagerMock.object(),
      pcMaterialManagerMock.object(),
      sceneHandler,
      {
        ...defaultRenderOptions,
        pointCloudParameters: {
          pointBlending: true,
          edlOptions: { radius: 0, strength: 0 }
        }
      }
    );

    const pipeline = defaultRenderPipelineProvider.pipeline(rendererMock.object());

    let numberOfRenderPasses = 0;
    for (const _ of pipeline) {
      numberOfRenderPasses++;
    }

    expect(numberOfRenderPasses).toBe(4); // Point cloud, Post, BlitToCanvas
  });
});
