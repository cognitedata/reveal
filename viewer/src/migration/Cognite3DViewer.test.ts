/*!
 * Copyright 2020 Cognite AS
 */

import { Cognite3DViewer } from './Cognite3DViewer';

describe('Cognite3DViewer', () => {
  test('constructor throws error when unsupported options are set', () => {
    expect(() => new Cognite3DViewer({ enableCache: true })).toThrowError();
    expect(() => new Cognite3DViewer({ enableCache: false, logMetrics: true })).toThrowError();
    expect(() => new Cognite3DViewer({ enableCache: false, viewCube: 'topleft' })).toThrowError();
    expect(() => new Cognite3DViewer({ enableCache: false })).toThrowError();
  });
});
