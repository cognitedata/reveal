/*!
 * Copyright 2022 Cognite AS
 */

import { GltfSectorRepository } from '../src/GltfSectorRepository';
import { createBinaryFileProviderMock, createWantedSectorMock } from './mockSectorUtils';

import { IMock } from 'moq.ts';

import { BinaryFileProvider } from '@reveal/modeldata-api';
import { CadMaterialManager } from '@reveal/rendering';

describe(GltfSectorRepository.name, () => {

  let binaryFileProvider: IMock<BinaryFileProvider>;
  let sectorRepository: GltfSectorRepository;

  const modelIdentifier = 'some_model_identifier';

  beforeEach(() => {
    binaryFileProvider = createBinaryFileProviderMock();

    const materialManager = new CadMaterialManager();
    materialManager.addModelMaterials(modelIdentifier, 1);

    sectorRepository = new GltfSectorRepository(binaryFileProvider.object(), materialManager);
  });

  test('previously fetched sector is cached by GltfSectorRepository', async () => {
    const wantedSectorMock = createWantedSectorMock();
    const loaderObserver = jest.spyOn(binaryFileProvider.object(), 'getBinaryFile');

    await sectorRepository.loadSector(wantedSectorMock.object());
    await sectorRepository.loadSector(wantedSectorMock.object());

    expect(loaderObserver.mock.calls).toHaveLength(1);
  });
});
