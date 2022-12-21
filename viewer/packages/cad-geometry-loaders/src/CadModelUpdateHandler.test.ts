/*!
 * Copyright 2021 Cognite AS
 */

import { SectorCuller } from './sector/culling/SectorCuller';
import { WantedSector } from '@reveal/cad-parsers';
import { CadModelUpdateHandler } from './CadModelUpdateHandler';
import { DetermineSectorsInput, SectorLoadingSpent } from './sector/culling/types';

import { Mock } from 'moq.ts';

import { jest } from '@jest/globals';

describe('CadModelUpdateHandler', () => {
  let mockCuller: SectorCuller;

  beforeEach(() => {
    jest.useFakeTimers();

    mockCuller = new Mock<SectorCuller>()
      .setup(p => p.dispose)
      .returns(jest.fn())
      .object();

    mockCuller = {
      determineSectors: jest.fn<
        (input: DetermineSectorsInput) => {
          wantedSectors: WantedSector[];
          spentBudget: SectorLoadingSpent;
        }
      >(),
      filterSectorsToLoad:
        jest.fn<(input: DetermineSectorsInput, wantedSectorsBatch: WantedSector[]) => Promise<WantedSector[]>>(),
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
