/*!
 * Copyright 2021 Cognite AS
 */

import { V8SectorRepository } from '../../sector-loader/src/V8SectorRepository';
import { SectorCuller } from './sector/culling/SectorCuller';
import { CadModelUpdateHandler } from './CadModelUpdateHandler';

import { CadMaterialManager } from '@reveal/rendering';
import { BinaryFileProvider } from '@reveal/modeldata-api';

describe('CadModelUpdateHandler', () => {
  let repository: V8SectorRepository;
  let mockCuller: SectorCuller;
  let modelSectorProvider: BinaryFileProvider;
  let materialManager: CadMaterialManager;

  beforeEach(() => {
    jest.useFakeTimers();

    modelSectorProvider = {
      getBinaryFile: jest.fn()
    };
    materialManager = new CadMaterialManager();

    repository = new V8SectorRepository(modelSectorProvider, materialManager);
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
