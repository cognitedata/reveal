/*!
 * Copyright 2021 Cognite AS
 */

import { CadSectorParser } from '@reveal/cad-parsers';
import { CachedRepository } from '../../sector-loader/src/CachedRepository';
import { SectorCuller } from './sector/culling/SectorCuller';
import { CadModelUpdateHandler } from './CadModelUpdateHandler';
import { CadMaterialManager } from './material-manager/CadMaterialManager';

import { BinaryFileProvider } from '@reveal/modeldata-api';

describe('CadModelUpdateHandler', () => {
  let repository: CachedRepository;
  let mockCuller: SectorCuller;

  beforeEach(() => {
    jest.useFakeTimers();

    const modelSectorProvider: BinaryFileProvider = {
      getBinaryFile: jest.fn()
    };
    const materialManager = new CadMaterialManager();
    const modelDataParser = new CadSectorParser();

    repository = new CachedRepository(modelSectorProvider, modelDataParser, materialManager);
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
    const updateHandler = new CadModelUpdateHandler(repository, mockCuller);
    updateHandler.dispose();
    expect(mockCuller.dispose).toBeCalledTimes(1);
  });
});
