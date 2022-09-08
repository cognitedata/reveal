/*!
 * Copyright 2022 Cognite AS
 */

import { StreamingTestFixtureComponents } from '../../../visual-tests/test-fixtures/StreamingVisualTestFixture';
import { StreamingVisualTestFixture } from '../../../visual-tests';
import { BasicPipelineExecutor } from '../src/pipeline-executors/BasicPipelineExecutor';

export default class ResizeVisualTestFixture extends StreamingVisualTestFixture {
  public setup(testFixtureComponents: StreamingTestFixtureComponents): Promise<void> {
    const { renderer } = testFixtureComponents;
    this.pipelineExecutor = new BasicPipelineExecutor(renderer, {
      autoResizeRenderer: true,
      resolutionThreshold: 100_000
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
