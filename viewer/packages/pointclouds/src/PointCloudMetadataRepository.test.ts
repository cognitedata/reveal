/*!
 * Copyright 2026 Cognite AS
 */

import { vi } from 'vitest';
import { Matrix4, Vector3 } from 'three';
import { PointCloudMetadataRepository } from './PointCloudMetadataRepository';
import type {
  BlobOutputMetadata,
  ModelDataProvider,
  ModelMetadataProvider,
  SignedFileItem
} from '@reveal/data-providers';
import { CdfModelIdentifier, DMModelIdentifier, File3dFormat } from '@reveal/data-providers';
import type { EptJson } from './potree-three-loader/loading/EptJson';

const minimalEptJson: EptJson = {
  schema: [
    { name: 'X', type: 'float', size: 8, scale: 1, offset: 0 },
    { name: 'Y', type: 'float', size: 8, scale: 1, offset: 0 },
    { name: 'Z', type: 'float', size: 8, scale: 1, offset: 0 }
  ],
  bounds: [0, 0, 0, 100, 100, 100],
  boundsConforming: [0, 0, 0, 100, 100, 100],
  ticks: 128,
  dataType: 'binary'
};

const eptOutput: BlobOutputMetadata = { blobId: 1, format: File3dFormat.EptPointCloud, version: 1 };

const dmIdentifier = new DMModelIdentifier({
  modelId: 1,
  revisionId: 2,
  revisionExternalId: 'ext-id',
  revisionSpace: 'my-space'
});

const eptJsonItem: SignedFileItem = {
  signedUrl: 'https://cdn.example.com/ept.json',
  fileName: 'ept.json',
  subPath: ''
};
const rootHierarchyItem: SignedFileItem = {
  signedUrl: 'https://cdn.example.com/ept-hierarchy/0-0-0-0.json',
  fileName: 'ept-hierarchy/0-0-0-0.json',
  subPath: 'ept-hierarchy'
};
const rootBinaryItem: SignedFileItem = {
  signedUrl: 'https://cdn.example.com/ept-data/0-0-0-0.bin',
  fileName: 'ept-data/0-0-0-0.bin',
  subPath: 'ept-data'
};
const otherBinaryItem: SignedFileItem = {
  signedUrl: 'https://cdn.example.com/ept-data/1-0-0-0.bin',
  fileName: 'ept-data/1-0-0-0.bin',
  subPath: 'ept-data'
};

function createMockedMetadataProvider(signedFilesBaseUrl = ''): ModelMetadataProvider {
  return {
    getModelOutputs: vi.fn<ModelMetadataProvider['getModelOutputs']>(async () => [eptOutput]),
    getModelUri: vi.fn<ModelMetadataProvider['getModelUri']>(async () => 'https://example.com/model'),
    getModelMatrix: vi.fn<ModelMetadataProvider['getModelMatrix']>(async () => new Matrix4()),
    getModelCamera: vi.fn<ModelMetadataProvider['getModelCamera']>(async () => ({
      position: new Vector3(),
      target: new Vector3()
    })),
    getModelUriForSignedFiles: vi.fn<NonNullable<ModelMetadataProvider['getModelUriForSignedFiles']>>(
      () => signedFilesBaseUrl
    )
  };
}

function createDMDataProvider(options: {
  filteredResponses?: Record<string, SignedFileItem[]>;
  fullList?: SignedFileItem[] | { promise: Promise<SignedFileItem[]> } | Error;
}): ModelDataProvider {
  const filtered = options.filteredResponses ?? {};
  return {
    getBinaryFile: vi.fn(async () => new ArrayBuffer(16)),
    getJsonFile: vi.fn(async () => minimalEptJson),
    getFileUrlsForModel: vi.fn(async (_baseUrl: string, _id: unknown, fileNameFilter?: string) => {
      if (fileNameFilter !== undefined) return filtered[fileNameFilter] ?? [];
      const full = options.fullList;
      if (full === undefined) return [];
      if (full instanceof Error) throw full;
      if (Array.isArray(full)) return full;
      return full.promise;
    })
  };
}

describe(PointCloudMetadataRepository.name, () => {
  test('classic model uses getJsonFile and returns empty signedFiles', async () => {
    const dataProvider = createDMDataProvider({});
    const repo = new PointCloudMetadataRepository(createMockedMetadataProvider(), dataProvider);

    const result = await repo.loadData(new CdfModelIdentifier(10, 20));

    expect(dataProvider.getJsonFile).toHaveBeenCalledWith('https://example.com/model', 'ept.json');
    expect(dataProvider.getFileUrlsForModel).not.toHaveBeenCalled();
    expect(result.signedFiles?.items).toEqual([]);
  });

  test('DM model resolves via filtered ept.json and root-hierarchy calls, then streams the full list into signedFiles.items in the background', async () => {
    const signedFilesBaseUrl = 'https://api.example.com/3d/output/files';
    let releaseFullList!: () => void;
    const fullListPromise = new Promise<SignedFileItem[]>(resolve => {
      releaseFullList = () => resolve([eptJsonItem, rootHierarchyItem, rootBinaryItem, otherBinaryItem]);
    });
    const dataProvider = createDMDataProvider({
      filteredResponses: {
        'ept.json': [eptJsonItem],
        'ept-hierarchy/0-0-0-0.json': [rootHierarchyItem]
      },
      fullList: { promise: fullListPromise }
    });

    const repo = new PointCloudMetadataRepository(createMockedMetadataProvider(signedFilesBaseUrl), dataProvider);
    const result = await repo.loadData(dmIdentifier);

    expect(dataProvider.getFileUrlsForModel).toHaveBeenCalledWith(signedFilesBaseUrl, dmIdentifier, 'ept.json');
    expect(dataProvider.getFileUrlsForModel).toHaveBeenCalledWith(
      signedFilesBaseUrl,
      dmIdentifier,
      'ept-hierarchy/0-0-0-0.json'
    );
    expect(dataProvider.getFileUrlsForModel).toHaveBeenCalledWith(signedFilesBaseUrl, dmIdentifier);
    expect(dataProvider.getFileUrlsForModel).not.toHaveBeenCalledWith(
      signedFilesBaseUrl,
      dmIdentifier,
      'ept-data/0-0-0-0.bin'
    );
    expect(dataProvider.getJsonFile).toHaveBeenCalledWith('', eptJsonItem.signedUrl);
    expect(dataProvider.getJsonFile).toHaveBeenCalledWith('', rootHierarchyItem.signedUrl);
    expect(result.signedFiles?.items).toEqual([]);
    expect(result.signedFilesBaseUrl).toBe(signedFilesBaseUrl);

    releaseFullList();
    await new Promise(resolve => setImmediate(resolve));
    expect(result.signedFiles?.items).toEqual([eptJsonItem, rootHierarchyItem, rootBinaryItem, otherBinaryItem]);
  });

  test.each([
    [
      'background full-list fetch fails',
      { fullList: new Error('backend exploded'), filtered: { 'ept.json': [eptJsonItem] } },
      /backend exploded/
    ],
    [
      'root hierarchy signed URL is not listed',
      { fullList: [] as SignedFileItem[], filtered: { 'ept.json': [eptJsonItem] } },
      undefined
    ]
  ])('DM model still returns metadata when %s', async (_label, options, expectedWarnPattern) => {
    const signedFilesBaseUrl = 'https://api.example.com/3d/output/files';
    const dataProvider = createDMDataProvider({
      filteredResponses: options.filtered,
      fullList: options.fullList
    });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const repo = new PointCloudMetadataRepository(createMockedMetadataProvider(signedFilesBaseUrl), dataProvider);
    const result = await repo.loadData(dmIdentifier);
    await new Promise(resolve => setImmediate(resolve));

    expect(result.signedFiles?.items).toEqual([]);
    if (expectedWarnPattern) {
      expect(warnSpy).toHaveBeenCalledWith(expect.stringMatching(expectedWarnPattern));
    }
    warnSpy.mockRestore();
  });
});
