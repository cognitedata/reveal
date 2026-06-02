/*!
 * Copyright 2021 Cognite AS
 */

import type { DisposedDelegate } from '@reveal/utilities';
import { Cognite3DViewerToolBase } from './Cognite3DViewerToolBase';

import { vi } from 'vitest';

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
    const handler: DisposedDelegate = vi.fn();
    tool.on('disposed', handler);

    tool.dispose();

    expect(handler).toHaveBeenCalledTimes(1);
  });

  test('dispose() twice, throws error', () => {
    tool.dispose();
    expect(tool.dispose).toThrow();
  });
});
