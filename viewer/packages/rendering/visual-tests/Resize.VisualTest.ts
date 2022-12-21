/*!
 * Copyright 2022 Cognite AS
 */

import { StreamingTestFixtureComponents } from '../../../visual-tests/test-fixtures/StreamingVisualTestFixture';
import { StreamingVisualTestFixture } from '../../../visual-tests';
import { BasicPipelineExecutor } from '../src/pipeline-executors/BasicPipelineExecutor';
import { ResizeHandler } from '../src/ResizeHandler';
import { StationaryCameraManager } from '../../camera-manager';

export default class ResizeVisualTestFixture extends StreamingVisualTestFixture {
  public setup(testFixtureComponents: StreamingTestFixtureComponents): Promise<void> {
    const { renderer, camera } = testFixtureComponents;
    this.pipelineExecutor = new BasicPipelineExecutor(renderer);

    // Register a resize handler with a dummy camera manager, which will
    // ensure the viewport is resized appropriately
    new ResizeHandler(renderer, new StationaryCameraManager(renderer.domElement.parentElement!, camera), {
      renderResolutionThreshold: 100_000
    });
    const domElement = renderer.domElement.parentElement!;
    domElement.style.width = '50vw';
    domElement.style.height = '50vh';
    domElement.style.position = 'absolute';
    domElement.style.margin = 'auto';
    domElement.style.left = '0px';
    domElement.style.right = '0px';
    domElement.style.top = '0px';
    domElement.style.bottom = '0px';

    document.body.style.backgroundColor = 'gray';

    return Promise.resolve();
  }
}
