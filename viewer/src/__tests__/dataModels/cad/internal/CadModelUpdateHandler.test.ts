/*!
 * Copyright 2021 Cognite AS
 */

import { CadModelMetadata, CadNode } from '../../../../datamodels/cad';
import { MaterialManager } from '../../../../datamodels/cad/MaterialManager';
import { CadSectorParser } from '../../../../datamodels/cad/sector/CadSectorParser';
import { SimpleAndDetailedToSector3D } from '../../../../datamodels/cad/sector/SimpleAndDetailedToSector3D';
import { CachedRepository } from '../../../../datamodels/cad/sector/CachedRepository';
import { SectorCuller } from '../../../../datamodels/cad/sector/culling/SectorCuller';

import { createCadModelMetadata } from '../../../testutils/createCadModelMetadata';
import { generateSectorTree } from '../../../testutils/createSectorMetadata';
import { CadModelUpdateHandler } from '../../../../datamodels/cad/CadModelUpdateHandler';
import { BinaryFileProvider } from '../../../../utilities/networking/types';

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
