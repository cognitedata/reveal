/*!
 * Copyright 2020 Cognite AS
 */

import { Cognite3DViewer } from './Cognite3DViewer';
import { CogniteClient } from '@cognite/sdk';

describe('Cognite3DViewer', () => {
  const sdk = new CogniteClient({ appId: 'cognite.reveal.unittest' });
  test('constructor throws error when unsupported options are set', () => {
    expect(() => new Cognite3DViewer({ sdk, enableCache: true })).toThrowError();
    expect(() => new Cognite3DViewer({ sdk, enableCache: false, logMetrics: true })).toThrowError();
    expect(() => new Cognite3DViewer({ sdk, enableCache: false, viewCube: 'topleft' })).toThrowError();
    expect(() => new Cognite3DViewer({ sdk, enableCache: false })).toThrowError();
  });
});
