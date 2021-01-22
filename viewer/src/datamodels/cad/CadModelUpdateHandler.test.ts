/*!
 * Copyright 2021 Cognite AS
 */

import { CadModelMetadata, CadNode } from '.';
import { SectorCuller } from '../../internal';
import { BinaryFileProvider } from '../../utilities/networking/types';
import { createCadModelMetadata } from '../../__testutilities__/createCadModelMetadata';
import { generateSectorTree } from '../../__testutilities__/createSectorMetadata';
import { CadModelUpdateHandler } from './CadModelUpdateHandler';
import { MaterialManager } from './MaterialManager';
import { CachedRepository } from './sector/CachedRepository';
import { CadSectorParser } from './sector/CadSectorParser';
import { SimpleAndDetailedToSector3D } from './sector/SimpleAndDetailedToSector3D';

describe('CadModelUpdateHandler', () => {
  let repository: CachedRepository;
  let mockCuller: SectorCuller;
  let cadModelMetadata: CadModelMetadata;
  let cadModel: CadNode;

  beforeEach(() => {
    jest.useFakeTimers();

    const modelSectorProvider: BinaryFileProvider = {
      getBinaryFile: jest.fn()
    };
    const materialManager = new MaterialManager();
    const modelDataParser = new CadSectorParser();
    const modelDataTransformer = new SimpleAndDetailedToSector3D(materialManager);

    repository = new CachedRepository(modelSectorProvider, modelDataParser, modelDataTransformer);
    mockCuller = {
      determineSectors: jest.fn(),
      dispose: jest.fn()
    };
    cadModelMetadata = createCadModelMetadata(generateSectorTree(5));
    cadModel = new CadNode(cadModelMetadata, materialManager);
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
