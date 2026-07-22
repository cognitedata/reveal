/*!
 * Copyright 2022 Cognite AS
 */
import { GltfSectorLoader } from '../src/GltfSectorLoader';

import { vi } from 'vitest';
import type { IMock } from 'moq.ts';
import { Mock } from 'moq.ts';
import type { WantedSector, SectorMetadata } from '@reveal/cad-parsers';
import { RevealGeometryCollectionType } from '@reveal/sector-parser';
import type { ModelDataProvider } from '@reveal/data-providers';
import { DMModelIdentifier, LocalModelIdentifier } from '@reveal/data-providers';
import { HttpError } from '@cognite/sdk';
import { createModelDataProviderMock, createWantedSectorMock } from './mockSectorUtils';

function makeMockProvider(overrides: Partial<ModelDataProvider> = {}): ModelDataProvider {
  return {
    getBinaryFile: vi.fn<ModelDataProvider['getBinaryFile']>(),
    getJsonFile: vi.fn(),
    getFileUrlsForModel: vi.fn(async () => []),
    ...overrides
  };
}

const MODEL_BASE_URL = 'https://example.com';
const DM_IDENTIFIER = new DMModelIdentifier({
  modelId: 1,
  revisionId: 1,
  revisionExternalId: 'rev',
  revisionSpace: 'space'
});
const CLASSIC_IDENTIFIER = new LocalModelIdentifier('classic-model');

function buildMetadataMock(overrides: { signedUrl?: string; sectorFileName: string | null }): SectorMetadata {
  return new Mock<SectorMetadata>()
    .setup(p => p.signedUrl)
    .returns(overrides.signedUrl)
    .setup(p => p.sectorFileName)
    .returns(overrides.sectorFileName)
    .object();
}

function buildSectorMock(overrides: {
  modelIdentifier: WantedSector['modelIdentifier'];
  metadata: SectorMetadata;
  modelBaseUrl?: string;
  signedFilesBaseUrl?: string;
}): WantedSector {
  const mock = new Mock<WantedSector>()
    .setup(p => p.modelIdentifier)
    .returns(overrides.modelIdentifier)
    .setup(p => p.metadata)
    .returns(overrides.metadata)
    .setup(p => p.signedFilesBaseUrl)
    .returns(overrides.signedFilesBaseUrl);
  if (overrides.modelBaseUrl !== undefined) {
    mock.setup(p => p.modelBaseUrl).returns(overrides.modelBaseUrl);
  }
  return mock.object();
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
    const getBinaryFileMock = vi.fn<ModelDataProvider['getBinaryFile']>().mockResolvedValue(expectedBuffer);
    const dmLoader = new GltfSectorLoader(makeMockProvider({ getBinaryFile: getBinaryFileMock }));

    const sector = buildSectorMock({
      modelIdentifier: DM_IDENTIFIER,
      metadata: buildMetadataMock({ signedUrl, sectorFileName: 'sector.glb' }),
      modelBaseUrl: MODEL_BASE_URL
    });

    const result = await dmLoader.getSectorByteBuffer(sector);

    expect(getBinaryFileMock).toHaveBeenCalledWith('', signedUrl, undefined);
    expect(result).toBe(expectedBuffer);
  });

  test('getSectorByteBuffer calls getBinaryFile for Classic model', async () => {
    const expectedBuffer = new ArrayBuffer(64);
    const getBinaryFileMock = vi.fn<ModelDataProvider['getBinaryFile']>().mockResolvedValue(expectedBuffer);
    const classicLoader = new GltfSectorLoader(makeMockProvider({ getBinaryFile: getBinaryFileMock }));

    const sector = buildSectorMock({
      modelIdentifier: CLASSIC_IDENTIFIER,
      metadata: buildMetadataMock({ sectorFileName: 'sector.glb' }),
      modelBaseUrl: MODEL_BASE_URL
    });

    const result = await classicLoader.getSectorByteBuffer(sector);

    expect(getBinaryFileMock).toHaveBeenCalledWith(MODEL_BASE_URL, 'sector.glb', undefined);
    expect(result).toBe(expectedBuffer);
  });

  test('getSectorByteBuffer refreshes and retries after a 403, then reuses the refreshed URL on a later call', async () => {
    const staleSignedUrl = 'https://signed.cdn.example.com/sector.glb';
    const freshSignedUrl = 'https://signed.cdn.example.com/sector-fresh.glb';
    const expectedBuffer = new ArrayBuffer(32);
    const getBinaryFileMock = vi
      .fn<ModelDataProvider['getBinaryFile']>()
      .mockRejectedValueOnce(new HttpError(403, { error: { code: 403, message: 'Forbidden' } }, {}))
      .mockResolvedValue(expectedBuffer);
    const getFileUrlsForModelMock = vi.fn<NonNullable<ModelDataProvider['getFileUrlsForModel']>>(async () => [
      { fileName: 'sector.glb', signedUrl: freshSignedUrl, subPath: '' }
    ]);
    const dmLoader = new GltfSectorLoader(
      makeMockProvider({ getBinaryFile: getBinaryFileMock, getFileUrlsForModel: getFileUrlsForModelMock })
    );
    const sector = buildSectorMock({
      modelIdentifier: DM_IDENTIFIER,
      metadata: buildMetadataMock({ signedUrl: staleSignedUrl, sectorFileName: 'sector.glb' }),
      modelBaseUrl: MODEL_BASE_URL,
      signedFilesBaseUrl: 'https://signed-files.example.com'
    });

    const result = await dmLoader.getSectorByteBuffer(sector);

    expect(result).toBe(expectedBuffer);
    expect(getBinaryFileMock).toHaveBeenLastCalledWith('', freshSignedUrl, undefined);

    await dmLoader.getSectorByteBuffer(sector);
    expect(getFileUrlsForModelMock).toHaveBeenCalledTimes(1);
  });

  test('getSectorByteBuffer throws when neither DM+signedUrl nor Classic baseUrl+fileName is available', () => {
    const noFileLoader = new GltfSectorLoader(makeMockProvider());

    const sector = buildSectorMock({
      modelIdentifier: CLASSIC_IDENTIFIER,
      metadata: buildMetadataMock({ sectorFileName: null })
    });

    expect(() => noFileLoader.getSectorByteBuffer(sector)).toThrow('Model must be a DM model');
  });
});
