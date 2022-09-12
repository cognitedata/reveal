/*!
 * Copyright 2021 Cognite AS
 */

import { SectorCuller } from './sector/culling/SectorCuller';
import { CadModelUpdateHandler } from './CadModelUpdateHandler';

describe('CadModelUpdateHandler', () => {
  let mockCuller: SectorCuller;

  beforeEach(() => {
    jest.useFakeTimers();

    mockCuller = {
      determineSectors: jest.fn(),
      filterSectorsToLoad: jest.fn(),
      dispose: jest.fn()
    };
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test('dipose() disposes culler', () => {
    const updateHandler = new CadModelUpdateHandler(mockCuller);
    updateHandler.dispose();
    expect(mockCuller.dispose).toBeCalledTimes(1);
  });
});
