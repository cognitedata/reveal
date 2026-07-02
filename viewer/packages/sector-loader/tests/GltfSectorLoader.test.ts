/*!
 * Copyright 2022 Cognite AS
 */
import { GltfSectorLoader } from '../src/GltfSectorLoader';

import { vi } from 'vitest';
import type { Mock as ViMock } from 'vitest';
import type { IMock } from 'moq.ts';
import { Mock } from 'moq.ts';
import type { WantedSector, SectorMetadata } from '@reveal/cad-parsers';
import { RevealGeometryCollectionType } from '@reveal/sector-parser';
import type { ModelDataProvider } from '@reveal/data-providers';
import { DMModelIdentifier, LocalModelIdentifier } from '@reveal/data-providers';
import { createModelDataProviderMock, createWantedSectorMock } from './mockSectorUtils';

function makeMockProvider(overrides: Partial<ModelDataProvider> = {}): ModelDataProvider {
  const base = {
    getBinaryFile: vi.fn<ModelDataProvider['getBinaryFile']>(),
    getJsonFile: vi.fn(),
    getFileUrlsForModel: vi.fn(async () => [])
  } as Partial<ModelDataProvider> as ModelDataProvider;
  Object.assign(base, overrides);
  return base;
}

describe(GltfSectorLoader.name, () => {
  let loader: GltfSectorLoader;
  let wantedSectorMock: IMock<WantedSector>;

  beforeEach(() => {
    const providerMock = createModelDataProviderMock();
    wantedSectorMock = createWantedSectorMock();

    loader = new GltfSectorLoader(providerMock.object());
  });

  test('loadSector returns consumed sector with right id and modelIdentifier', async () => {
    const consumedSector = await loader.loadSector(wantedSectorMock.object());

    expect(consumedSector.modelIdentifier.revealInternalId).toBe(
      wantedSectorMock.object().modelIdentifier.revealInternalId
    );
    expect(consumedSector.metadata.id).toBe(wantedSectorMock.object().metadata.id);
  });

  test('loadSector returns sector with geometryBatchingQueue that contains all geometry types', async () => {
    const consumedSector = await loader.loadSector(wantedSectorMock.object());

    expect(consumedSector.geometryBatchingQueue).toBeTruthy();

    const typeSet = new Set<RevealGeometryCollectionType>();

    for (const geometry of consumedSector.geometryBatchingQueue!) {
      typeSet.add(geometry.type);
    }

    // Filter away numeric keys from enum, and subtract the three mesh types
    const numberOfPrimitives = Object.keys(RevealGeometryCollectionType).filter(k => isNaN(Number(k))).length - 3;

    expect(typeSet.size).toBe(numberOfPrimitives);
  });

  test('getSectorByteBuffer calls getBinaryFile with empty baseUrl for DM model with signedUrl', async () => {
    const signedUrl = 'https://signed.cdn.example.com/sector.glb';
    const expectedBuffer = new ArrayBuffer(32);

    const dmIdentifier = new DMModelIdentifier({
      modelId: 1,
      revisionId: 1,
      revisionExternalId: 'rev',
      revisionSpace: 'space'
    });
    const getBinaryFileMock: ViMock<ModelDataProvider['getBinaryFile']> = vi
      .fn<ModelDataProvider['getBinaryFile']>()
      .mockResolvedValue(expectedBuffer);
    const mockProvider = makeMockProvider({ getBinaryFile: getBinaryFileMock });

    const dmLoader = new GltfSectorLoader(mockProvider);

    const metadata = new Mock<SectorMetadata>()
      .setup(p => p.signedUrl)
      .returns(signedUrl)
      .setup(p => p.sectorFileName)
      .returns('sector.glb')
      .object();

    const sector = new Mock<WantedSector>()
      .setup(p => p.modelIdentifier)
      .returns(dmIdentifier)
      .setup(p => p.metadata)
      .returns(metadata)
      .setup(p => p.modelBaseUrl)
      .returns('https://example.com')
      .object();

    const result = await dmLoader.getSectorByteBuffer(sector);

    expect(getBinaryFileMock).toHaveBeenCalledWith('', signedUrl, undefined);
    expect(result).toBe(expectedBuffer);
  });

  test('getSectorByteBuffer calls getBinaryFile for Classic model', async () => {
    const expectedBuffer = new ArrayBuffer(64);
    const classicIdentifier = new LocalModelIdentifier('classic-model');
    const getBinaryFileMock: ViMock<ModelDataProvider['getBinaryFile']> = vi
      .fn<ModelDataProvider['getBinaryFile']>()
      .mockResolvedValue(expectedBuffer);
    const mockProvider = makeMockProvider({ getBinaryFile: getBinaryFileMock });

    const classicLoader = new GltfSectorLoader(mockProvider);

    const metadata = new Mock<SectorMetadata>()
      .setup(p => p.signedUrl)
      .returns(undefined)
      .setup(p => p.sectorFileName)
      .returns('sector.glb')
      .object();

    const sector = new Mock<WantedSector>()
      .setup(p => p.modelIdentifier)
      .returns(classicIdentifier)
      .setup(p => p.metadata)
      .returns(metadata)
      .setup(p => p.modelBaseUrl)
      .returns('https://example.com')
      .object();

    const result = await classicLoader.getSectorByteBuffer(sector);

    expect(getBinaryFileMock).toHaveBeenCalledWith('https://example.com', 'sector.glb', undefined);
    expect(result).toBe(expectedBuffer);
  });

  test('getSectorByteBuffer throws when neither DM+signedUrl nor Classic baseUrl+fileName is available', async () => {
    const classicIdentifier = new LocalModelIdentifier('classic-model');
    const mockProvider = makeMockProvider();

    const noFileLoader = new GltfSectorLoader(mockProvider);

    const metadata = new Mock<SectorMetadata>()
      .setup(p => p.signedUrl)
      .returns(undefined)
      .setup(p => p.sectorFileName)
      .returns(null)
      .object();

    const sector = new Mock<WantedSector>()
      .setup(p => p.modelIdentifier)
      .returns(classicIdentifier)
      .setup(p => p.metadata)
      .returns(metadata)
      .object();

    await expect(noFileLoader.getSectorByteBuffer(sector)).rejects.toThrow('Model must be a DM model');
  });
});
