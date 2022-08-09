/*!
 * Copyright 2022 Cognite AS
 */

import { GltfSectorRepository } from '../src/GltfSectorRepository';
import { createBinaryFileProviderMock, createWantedSectorMock } from './mockSectorUtils';

import { IMock, Mock } from 'moq.ts';

import { BinaryFileProvider } from '@reveal/modeldata-api';
import { CadMaterialManager } from '@reveal/rendering';
import { WantedSector } from '@reveal/cad-parsers';
import Log from '@reveal/logger';

describe(GltfSectorRepository.name, () => {
  let binaryFileProvider: IMock<BinaryFileProvider>;
  let sectorRepository: GltfSectorRepository;
  let wantedSectorMock: IMock<WantedSector>;

  const modelIdentifier = 'some_model_identifier';

  beforeEach(() => {
    binaryFileProvider = createBinaryFileProviderMock();

    const materialManager = new CadMaterialManager();
    materialManager.addModelMaterials(modelIdentifier, 1);

    sectorRepository = new GltfSectorRepository(binaryFileProvider.object(), materialManager);
    wantedSectorMock = createWantedSectorMock();
  });

  test('loadSector returns sector metadata with right id and modelidentifier', async () => {
    const consumedSector = await sectorRepository.loadSector(wantedSectorMock.object());

    expect(consumedSector._unsafeUnwrap().metadata.id).toEqual(wantedSectorMock.object().metadata.id);
    expect(consumedSector._unsafeUnwrap().modelIdentifier).toEqual(wantedSectorMock.object().modelIdentifier);
  });

  test('previously fetched sector is cached by GltfSectorRepository', async () => {
    const loaderObserver = jest.spyOn(binaryFileProvider.object(), 'getBinaryFile');

    await sectorRepository.loadSector(wantedSectorMock.object());
    await sectorRepository.loadSector(wantedSectorMock.object());

    expect(loaderObserver.mock.calls).toHaveLength(1);
  });

  test('loadSector should gracefully handle errors from sectorLoader', async () => {
    const currentLogLevel = Log.getLevel();
    Log.setLevel('silent');

    const binaryFileProvider = createBinaryFileProviderMock();
    const materialManager = new Mock<CadMaterialManager>();

    const sectorRepository = new GltfSectorRepository(binaryFileProvider.object(), materialManager.object());

    //Sector loader will throw since there is no valid materials for given object
    expect(sectorRepository.loadSector(wantedSectorMock.object())).resolves.not.toThrow();

    Log.setLevel(currentLogLevel);
  });
});
