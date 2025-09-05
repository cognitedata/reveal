/*!
 * Copyright 2022 Cognite AS
 */

import { GltfSectorRepository } from '../src/GltfSectorRepository';
import { createBinaryFileProviderMock, createWantedSectorMock } from './mockSectorUtils';

import { IMock } from 'moq.ts';

import { BinaryFileProvider } from '@reveal/data-providers';
import { WantedSector } from '@reveal/cad-parsers';
import { Log } from '@reveal/logger';

import { jest } from '@jest/globals';

describe(GltfSectorRepository.name, () => {
  let binaryFileProvider: IMock<BinaryFileProvider>;
  let sectorRepository: GltfSectorRepository;
  let wantedSectorMock: IMock<WantedSector>;

  beforeEach(() => {
    binaryFileProvider = createBinaryFileProviderMock();

    wantedSectorMock = createWantedSectorMock();

    sectorRepository = new GltfSectorRepository(binaryFileProvider.object());
  });

  test('loadSector returns sector metadata with right id and modelidentifier', async () => {
    const consumedSector = await sectorRepository.loadSector(wantedSectorMock.object());

    expect(consumedSector.metadata.id).toEqual(wantedSectorMock.object().metadata.id);
    expect(consumedSector.modelIdentifier).toEqual(wantedSectorMock.object().modelIdentifier);
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

    const sectorRepository = new GltfSectorRepository(binaryFileProvider.object());

    //Sector loader will throw since there is no valid materials for given object
    await expect(sectorRepository.loadSector(wantedSectorMock.object())).resolves.not.toThrow();

    Log.setLevel(currentLogLevel);
  });
});
