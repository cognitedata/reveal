/*!
 * Copyright 2022 Cognite AS
 */

import { GltfSectorRepository } from '../src/GltfSectorRepository';
import { createBinaryFileProviderMock, createWantedSectorMock } from './mockSectorUtils';

import { IMock, Mock, It } from 'moq.ts';

import { BinaryFileProvider, LocalModelIdentifier, ModelIdentifier } from '@reveal/data-providers';
import { WantedSector, SectorMetadata, LevelOfDetail, ConsumedSector } from '@reveal/cad-parsers';
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

  describe('Empty sector handling', () => {
    test.each([
      ['sectorFileName is undefined', { id: 1, sectorFileName: undefined, downloadSize: 100 }, LevelOfDetail.Detailed],
      ['downloadSize is 0', { id: 2, sectorFileName: 'test.glb', downloadSize: 0 }, LevelOfDetail.Detailed],
      ['levelOfDetail is Discarded', { id: 3, sectorFileName: 'test.glb', downloadSize: 100 }, LevelOfDetail.Discarded]
    ])('should return empty sector when %s', async (_, metadata, expectedLod) => {
      const wantedSector = createWantedSectorWithMetadata(metadata, expectedLod);
      const result = await sectorRepository.loadSector(wantedSector.object());
      expectEmptySector(result, expectedLod, wantedSector.object().modelIdentifier);
    });
  });

  describe('Cache management', () => {
    test('setCacheSize should update cache size', () => {
      expect(() => sectorRepository.setCacheSize(500)).not.toThrow();
    });

    test('clearCache should clear the cache', async () => {
      const loaderSpy = jest.spyOn(binaryFileProvider.object(), 'getBinaryFile');

      await sectorRepository.loadSector(wantedSectorMock.object());
      sectorRepository.clearCache();
      await sectorRepository.loadSector(wantedSectorMock.object());

      expect(loaderSpy).toHaveBeenCalledTimes(2);
    });

    test('cache should work with different model identifiers', async () => {
      const [modelId1, modelId2] = ['model1', 'model2'].map(id => new LocalModelIdentifier(id));
      const testMetadata = { id: 1, sectorFileName: 'test.glb', downloadSize: 100 };

      const [sector1, sector2] = [modelId1, modelId2].map(modelId =>
        createWantedSectorWithMetadata(testMetadata, LevelOfDetail.Detailed, modelId)
      );

      const loaderSpy = jest.spyOn(binaryFileProvider.object(), 'getBinaryFile');

      await Promise.all([sector1, sector2].map(sector => sectorRepository.loadSector(sector.object())));

      expect(loaderSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('AbortSignal and error handling', () => {
    test('should pass abort signal to sector loader', async () => {
      const abortController = new AbortController();
      const mockProvider = new Mock<BinaryFileProvider>()
        .setup(p => p.getBinaryFile(It.IsAny(), It.IsAny(), abortController.signal))
        .returnsAsync(new ArrayBuffer(0));

      const testRepository = new GltfSectorRepository(mockProvider.object());
      const wantedSector = createWantedSectorWithMetadata({ id: 1, sectorFileName: 'test.glb', downloadSize: 100 });

      await expect(testRepository.loadSector(wantedSector.object(), abortController.signal)).resolves.toBeDefined();
    });

    test('should return empty discarded sector when loader fails', async () => {
      const failingProvider = new Mock<BinaryFileProvider>()
        .setup(p => p.getBinaryFile(It.IsAny(), It.IsAny(), It.IsAny()))
        .throws(new Error('Network error'));

      const testRepository = new GltfSectorRepository(failingProvider.object());
      const wantedSector = createWantedSectorWithMetadata({ id: 1, sectorFileName: 'test.glb', downloadSize: 100 });
      const result = await testRepository.loadSector(wantedSector.object());

      expectEmptySector(result, LevelOfDetail.Discarded);
    });

    test('should handle cached sector with different model identifier correctly', async () => {
      const [originalId, newId] = ['original', 'new'].map(id => new LocalModelIdentifier(id));
      const testMetadata = { id: 1, sectorFileName: 'test.glb', downloadSize: 100 };

      const [originalSector, newSector] = [originalId, newId].map(modelId =>
        createWantedSectorWithMetadata(testMetadata, LevelOfDetail.Detailed, modelId)
      );

      await sectorRepository.loadSector(originalSector.object());
      const result = await sectorRepository.loadSector(newSector.object());

      expect(result.modelIdentifier).toBe(newId);
    });
  });

  // Helper functions
  const createWantedSectorWithMetadata = (
    metadata: Partial<SectorMetadata>,
    levelOfDetail = LevelOfDetail.Detailed,
    modelIdentifier = new LocalModelIdentifier('test_model')
  ) => {
    const mockMetadata = new Mock<SectorMetadata>();
    Object.entries(metadata).forEach(([key, value]) => {
      mockMetadata.setup((p: any) => p[key]).returns(value);
    });

    return new Mock<WantedSector>()
      .setup(p => p.modelBaseUrl)
      .returns('https://test.com')
      .setup(p => p.modelIdentifier)
      .returns(modelIdentifier)
      .setup(p => p.metadata)
      .returns(mockMetadata.object())
      .setup(p => p.levelOfDetail)
      .returns(levelOfDetail);
  };

  const expectEmptySector = (result: ConsumedSector, expectedLod: LevelOfDetail, expectedModelId?: ModelIdentifier) => {
    expect(result.levelOfDetail).toBe(expectedLod);
    expect(result.instancedMeshes).toEqual([]);
    if (expectedModelId) expect(result.modelIdentifier).toBe(expectedModelId);
  };
});
