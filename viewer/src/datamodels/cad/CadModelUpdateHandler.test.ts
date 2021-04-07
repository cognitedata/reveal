/*!
 * Copyright 2021 Cognite AS
 */

import { SectorCuller } from '../../internal';
import { BinaryFileProvider } from '../../utilities/networking/types';
import { CadModelUpdateHandler } from './CadModelUpdateHandler';
import { CadMaterialManager } from './CadMaterialManager';
import { CachedRepository } from './sector/CachedRepository';
import { CadSectorParser } from './sector/CadSectorParser';
import { SimpleAndDetailedToSector3D } from './sector/SimpleAndDetailedToSector3D';

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
    const modelDataTransformer = new SimpleAndDetailedToSector3D(materialManager);

    repository = new CachedRepository(modelSectorProvider, modelDataParser, modelDataTransformer);
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
