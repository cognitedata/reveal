/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { SectorCuller } from './sector/culling/SectorCuller';
import { CadModelUpdateHandler } from './CadModelUpdateHandler';
import { SectorLoadingSpent } from './sector/culling/types';
import { File3dFormat } from '@reveal/data-providers';
import { createCadNode } from '../../../test-utilities';

import { jest } from '@jest/globals';

const emptyBudgetSpent: SectorLoadingSpent = {
  downloadSize: 0,
  accumulatedPriority: 0,
  detailedSectorCount: 0,
  drawCalls: 0,
  renderCost: 0,
  forcedDetailedSectorCount: 0,
  loadedSectorCount: 0,
  simpleSectorCount: 0,
  totalSectorCount: 0
};

async function flushPipeline(): Promise<void> {
  jest.advanceTimersByTime(300);
  jest.runAllTimers();
  for (let i = 0; i < 6; i++) {
    await Promise.resolve();
  }
}

describe(CadModelUpdateHandler.name, () => {
  let mockCuller: jest.Mocked<SectorCuller>;

  beforeEach(() => {
    jest.useFakeTimers();

    mockCuller = {
      determineSectors: jest
        .fn<SectorCuller['determineSectors']>()
        .mockReturnValue({ wantedSectors: [], spentBudget: emptyBudgetSpent }),
      filterSectorsToLoad: jest.fn<SectorCuller['filterSectorsToLoad']>().mockResolvedValue([]),
      dispose: jest.fn<SectorCuller['dispose']>()
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

  describe('createDetermineSectorsInput', () => {
    test('GltfPrioritizedNodes model revealInternalId is included in lockedModelIdentifiers', async () => {
      const cadNode = createCadNode(2, 2, { format: File3dFormat.GltfPrioritizedNodes });

      const updateHandler = new CadModelUpdateHandler(mockCuller);
      updateHandler.addModel(cadNode);
      updateHandler.updateCamera(new THREE.PerspectiveCamera(), false);

      await flushPipeline();

      expect(mockCuller.determineSectors).toHaveBeenCalled();
      const input = mockCuller.determineSectors.mock.calls[0][0];
      expect(input.lockedModelIdentifiers.has(cadNode.cadModelMetadata.modelIdentifier.revealInternalId)).toBe(true);
    });

    test('GltfCadModel is not included in lockedModelIdentifiers', async () => {
      const cadNode = createCadNode(2, 2);

      const updateHandler = new CadModelUpdateHandler(mockCuller);
      updateHandler.addModel(cadNode);
      updateHandler.updateCamera(new THREE.PerspectiveCamera(), false);

      await flushPipeline();

      expect(mockCuller.determineSectors).toHaveBeenCalled();
      const input = mockCuller.determineSectors.mock.calls[0][0];
      expect(input.lockedModelIdentifiers.size).toBe(0);
    });

    test('model with locked sector IDs is included in lockedSectorIdsByModel', async () => {
      const cadNode = createCadNode(2, 2);
      // Lock a tree index and simulate sector discovery so lockedSectorIds is populated
      cadNode.lockTreeIndices([1]);
      cadNode.onTreeIndexSectorDiscovered(1, 5);
      cadNode.onTreeIndexSectorDiscovered(1, 10);

      const updateHandler = new CadModelUpdateHandler(mockCuller);
      updateHandler.addModel(cadNode);
      updateHandler.updateCamera(new THREE.PerspectiveCamera(), false);

      await flushPipeline();

      expect(mockCuller.determineSectors).toHaveBeenCalled();
      const input = mockCuller.determineSectors.mock.calls[0][0];
      const modelId = cadNode.cadModelMetadata.modelIdentifier.revealInternalId;
      expect(input.lockedSectorIdsByModel.has(modelId)).toBe(true);
      expect(input.lockedSectorIdsByModel.get(modelId)).toEqual(new Set([5, 10]));
    });

    test('model with no locked sectors is not included in lockedSectorIdsByModel', async () => {
      const cadNode = createCadNode(2, 2);

      const updateHandler = new CadModelUpdateHandler(mockCuller);
      updateHandler.addModel(cadNode);
      updateHandler.updateCamera(new THREE.PerspectiveCamera(), false);

      await flushPipeline();

      expect(mockCuller.determineSectors).toHaveBeenCalled();
      const input = mockCuller.determineSectors.mock.calls[0][0];
      expect(input.lockedSectorIdsByModel.size).toBe(0);
    });
  });
});
