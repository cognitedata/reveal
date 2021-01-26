/*!
 * Copyright 2021 Cognite AS
 */

import { DisposedDelegate } from '../public/migration/Cognite3DViewerTool';
import { Cognite3DViewerToolBase } from './Cognite3DViewerToolBase';

describe('Cognite3DViewerToolBase', () => {
  class MockedCognite3DViewerToolBase extends Cognite3DViewerToolBase {
    notifyRendered() {
      throw new Error();
    }
  }

  let tool: Cognite3DViewerToolBase;
  beforeEach(() => {
    tool = new MockedCognite3DViewerToolBase();
  });
  test('dispose() triggers disposed event', () => {
    const handler: DisposedDelegate = jest.fn();
    tool.on('disposed', handler);

    tool.dispose();

    expect(handler).toBeCalledTimes(1);
  });

  test('dispose() twice, throws error', () => {
    tool.dispose();
    expect(tool.dispose).toThrowError();
  });
});
