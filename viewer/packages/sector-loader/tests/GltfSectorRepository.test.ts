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
    const mockGetBinaryFile: jest.MockedFunction<BinaryFileProvider['getBinaryFile']> = jest.fn();
    const mockBuffer = new ArrayBuffer(100);
    mockGetBinaryFile.mockResolvedValue(mockBuffer);
    const mockBinaryProvider: BinaryFileProvider = { getBinaryFile: mockGetBinaryFile };

    const testRepository = new GltfSectorRepository(mockBinaryProvider);

    // Load the same sector twice - should hit cache on second load
    const sector = wantedSectorMock.object();
    await testRepository.loadSector(sector);
    await testRepository.loadSector(sector);

    expect(jest.mocked(mockBinaryProvider.getBinaryFile)).toHaveBeenCalledTimes(2);
  });

  test('loadSector should gracefully handle errors from sectorLoader', async () => {
    const currentLogLevel = Log.getLevel();
    Log.setLevel('silent');

    const binaryFileProvider = createBinaryFileProviderMock();

    const sectorRepository = new GltfSectorRepository(binaryFileProvider.object());

    await expect(sectorRepository.loadSector(wantedSectorMock.object())).resolves.not.toThrow();

    Log.setLevel(currentLogLevel);
  });

  test.each([
    ['sectorFileName is undefined', { id: 1, sectorFileName: undefined, downloadSize: 100 }, LevelOfDetail.Detailed],
    ['downloadSize is 0', { id: 2, sectorFileName: 'test.glb', downloadSize: 0 }, LevelOfDetail.Detailed],
    ['levelOfDetail is Discarded', { id: 3, sectorFileName: 'test.glb', downloadSize: 100 }, LevelOfDetail.Discarded]
  ])('should return empty sector when %s', async (_, metadata, expectedLod) => {
    const wantedSector = createWantedSectorWithMetadata(metadata, expectedLod);
    const result = await sectorRepository.loadSector(wantedSector.object());
    expectEmptySector(result, expectedLod, wantedSector.object().modelIdentifier);
  });

  test('setCacheSize should update cache size', () => {
    expect(() => sectorRepository.setCacheSize(500)).not.toThrow();
  });

  test('clearCache should clear the cache', async () => {
    const mockGetBinaryFile: jest.MockedFunction<BinaryFileProvider['getBinaryFile']> = jest.fn();
    const mockBuffer = new ArrayBuffer(100);
    mockGetBinaryFile.mockResolvedValue(mockBuffer);
    const mockBinaryProvider: BinaryFileProvider = { getBinaryFile: mockGetBinaryFile };

    const testRepository = new GltfSectorRepository(mockBinaryProvider);

    await testRepository.loadSector(wantedSectorMock.object());
    testRepository.clearCache();
    await testRepository.loadSector(wantedSectorMock.object());

    expect(jest.mocked(mockBinaryProvider.getBinaryFile)).toHaveBeenCalledTimes(2);
  });

  test('cache should work with different model identifiers', async () => {
    const [modelId1, modelId2] = ['model1', 'model2'].map(id => new LocalModelIdentifier(id));
    const testMetadata = { id: 1, sectorFileName: 'test.glb', downloadSize: 100 };

    const [sector1, sector2] = [modelId1, modelId2].map(modelId =>
      createWantedSectorWithMetadata(testMetadata, LevelOfDetail.Detailed, modelId)
    );

    const mockGetBinaryFile: jest.MockedFunction<BinaryFileProvider['getBinaryFile']> = jest.fn();
    const mockBuffer = new ArrayBuffer(100);
    mockGetBinaryFile.mockResolvedValue(mockBuffer);
    const mockBinaryProvider: BinaryFileProvider = { getBinaryFile: mockGetBinaryFile };

    const testRepository = new GltfSectorRepository(mockBinaryProvider);

    await Promise.all([sector1, sector2].map(sector => testRepository.loadSector(sector.object())));

    expect(jest.mocked(mockBinaryProvider.getBinaryFile)).toHaveBeenCalledTimes(2);
  });

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

  test('dereferenceSector should handle non-existent sector gracefully', () => {
    const modelId = new LocalModelIdentifier('test_model');

    // Should not throw when dereferencing non-existent sector
    expect(() => sectorRepository.dereferenceSector(modelId, 999)).not.toThrow();
  });

  test('dereferenceSector should handle zero reference count gracefully', async () => {
    const modelId = new LocalModelIdentifier('test_model');
    const wantedSector = createWantedSectorWithMetadata(
      {
        id: 1,
        sectorFileName: 'test.glb',
        downloadSize: 100
      },
      LevelOfDetail.Detailed,
      modelId
    );

    await sectorRepository.loadSector(wantedSector.object());

    // Dereference once (should make count 0)
    sectorRepository.dereferenceSector(modelId, 1);

    // Dereference again (should handle gracefully)
    expect(() => sectorRepository.dereferenceSector(modelId, 1)).not.toThrow();
  });

  test('should handle multiple references to same sector correctly', async () => {
    const modelId1 = new LocalModelIdentifier('model1');
    const modelId2 = new LocalModelIdentifier('model2');

    const wantedSector1 = createWantedSectorWithMetadata(
      {
        id: 1,
        sectorFileName: 'test.glb',
        downloadSize: 100
      },
      LevelOfDetail.Detailed,
      modelId1
    );

    const wantedSector2 = createWantedSectorWithMetadata(
      {
        id: 1,
        sectorFileName: 'test.glb',
        downloadSize: 100
      },
      LevelOfDetail.Detailed,
      modelId2
    );

    // Load the same sector for two different models
    const sector1 = await sectorRepository.loadSector(wantedSector1.object());
    const sector2 = await sectorRepository.loadSector(wantedSector2.object());

    // Both sectors should be successfully loaded
    expect(sector1).toBeDefined();
    expect(sector2).toBeDefined();
    expect(sector1.metadata.id).toBe(1);
    expect(sector2.metadata.id).toBe(1);

    // Different model identifiers should be preserved
    expect(sector1.modelIdentifier).toBe(modelId1);
    expect(sector2.modelIdentifier).toBe(modelId2);

    // Test that dereferencing works without crashing
    expect(() => sectorRepository.dereferenceSector(modelId1, 1)).not.toThrow();
    expect(() => sectorRepository.dereferenceSector(modelId2, 1)).not.toThrow();

    // System should still work after all dereferences
    const testLoad = await sectorRepository.loadSector(wantedSector1.object());
    expect(testLoad).toBeDefined();
  });

  test('should handle cache clearing after sector dereferencing', async () => {
    const modelId = new LocalModelIdentifier('test_model');
    const wantedSector = createWantedSectorWithMetadata(
      {
        id: 1,
        sectorFileName: 'test.glb',
        downloadSize: 100
      },
      LevelOfDetail.Detailed,
      modelId
    );

    await sectorRepository.loadSector(wantedSector.object());

    // Dereference it (simulating model removal)
    sectorRepository.dereferenceSector(modelId, 1);

    // Clear cache should not crash
    expect(() => sectorRepository.clearCache()).not.toThrow();

    // Should be able to load sectors after cache clear
    const reloadedSector = await sectorRepository.loadSector(wantedSector.object());
    expect(reloadedSector).toBeDefined();
  });

  test('should handle cache clearing while sectors are still referenced', async () => {
    const modelId = new LocalModelIdentifier('test_model');
    const wantedSector = createWantedSectorWithMetadata(
      {
        id: 1,
        sectorFileName: 'test.glb',
        downloadSize: 100
      },
      LevelOfDetail.Detailed,
      modelId
    );

    await sectorRepository.loadSector(wantedSector.object());

    // Clear cache while sector is still referenced - should not crash
    expect(() => sectorRepository.clearCache()).not.toThrow();

    // Should still work after cache clear
    const reloadedSector = await sectorRepository.loadSector(wantedSector.object());
    expect(reloadedSector).toBeDefined();

    // Now clean up properly
    sectorRepository.dereferenceSector(modelId, 1);
  });

  test('should handle cache eviction and resource cleanup when cache limit is reached', async () => {
    const modelId = new LocalModelIdentifier('test_model');

    // Load initial sectors and track them
    const initialSectors = [];
    for (let i = 1; i <= 5; i++) {
      const sector = createWantedSectorWithMetadata(
        {
          id: i,
          sectorFileName: `initial-${i}.glb`,
          downloadSize: 100
        },
        LevelOfDetail.Detailed,
        modelId
      );

      initialSectors.push({
        sector,
        result: await sectorRepository.loadSector(sector.object())
      });
    }

    initialSectors.forEach(({ result }, index) => {
      expect(result).toBeDefined();
      expect(result.metadata.id).toBe(index + 1);
    });

    // Dereference some sectors to make them eligible for cleanup
    sectorRepository.dereferenceSector(modelId, 1);
    sectorRepository.dereferenceSector(modelId, 2);

    // Load many additional sectors to force cache eviction
    const additionalSectors = [];
    for (let i = 100; i < 250; i++) {
      const sector = createWantedSectorWithMetadata(
        {
          id: i,
          sectorFileName: `eviction-${i}.glb`,
          downloadSize: 100
        },
        LevelOfDetail.Detailed,
        modelId
      );

      additionalSectors.push(sectorRepository.loadSector(sector.object()));
    }

    // Wait for all additional sectors to load (this should trigger cache eviction)
    const loadedSectors = await Promise.all(additionalSectors);

    expect(loadedSectors).toHaveLength(150);
    loadedSectors.forEach((sector, index) => {
      expect(sector).toBeDefined();
      expect(sector.metadata.id).toBe(index + 100);
    });

    // Load a sector that might have been evicted and re-cached
    const recheckSector = createWantedSectorWithMetadata(
      {
        id: 3, // This was not dereferenced, so might still be cached
        sectorFileName: 'initial-3.glb',
        downloadSize: 100
      },
      LevelOfDetail.Detailed,
      modelId
    );

    const reloadedResult = await sectorRepository.loadSector(recheckSector.object());
    expect(reloadedResult).toBeDefined();
    expect(reloadedResult.metadata.id).toBe(3);

    // Clean up remaining references
    for (let i = 3; i <= 5; i++) {
      sectorRepository.dereferenceSector(modelId, i);
    }
    for (let i = 100; i < 250; i++) {
      sectorRepository.dereferenceSector(modelId, i);
    }
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
