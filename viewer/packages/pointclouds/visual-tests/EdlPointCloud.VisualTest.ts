/*!
 * Copyright 2022 Cognite AS
 */

import { PointCloudNode } from '../src/PointCloudNode';
import {
  CadMaterialManager,
  defaultRenderOptions,
  DefaultRenderPipelineProvider,
  PointCloudMaterialManager,
  PointColorType
} from '@reveal/rendering';
import assert from 'assert';
import {
  StreamingTestFixtureComponents,
  StreamingVisualTestFixture
} from '../../../visual-tests/test-fixtures/StreamingVisualTestFixture';
import { SceneHandler } from '@reveal/utilities';

export default class EdlPointCloudVisualTest extends StreamingVisualTestFixture {
  constructor() {
    super('pointcloud-bunny');
  }

  createDefaultRenderPipelineProvider(
    materialManager: CadMaterialManager,
    pointCloudMaterialManager: PointCloudMaterialManager,
    sceneHandler: SceneHandler
  ): DefaultRenderPipelineProvider {
    return new DefaultRenderPipelineProvider(
      materialManager,
      pointCloudMaterialManager,
      sceneHandler,
      { ...defaultRenderOptions } // Default rendering options includes EDL turned on
    );
  }

  public setup(testFixtureComponents: StreamingTestFixtureComponents): Promise<void> {
    const { model } = testFixtureComponents;

    assert(model.geometryNode instanceof PointCloudNode);

    model.geometryNode.pointSize = 5;
    model.geometryNode.pointColorType = PointColorType.Height;

    return Promise.resolve();
  }
}
