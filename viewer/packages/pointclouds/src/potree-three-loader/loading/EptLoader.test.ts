/*!
 * Copyright 2026 Cognite AS
 */

import { vi } from 'vitest';
import { EptLoader } from './EptLoader';
import { PointCloudEptGeometryNode } from '../geometry/PointCloudEptGeometryNode';
import type { ModelDataProvider } from '@reveal/data-providers';
import { CdfModelIdentifier } from '@reveal/data-providers';
import type { EptJson } from './EptJson';
import type { MetadataWithSignedFiles } from '@reveal/data-providers/src/metadata-providers/types';
import { createMockModelDataProvider } from '../../../../../test-utilities/src/createMockModelDataProvider';
import { mockDMModelIdentifier as dmIdentifier } from '../../../../../test-utilities/src/mockModelIdentifiers';

const eptJson: EptJson = {
  schema: [
    { name: 'X', type: 'signed', size: 4, scale: 1, offset: 0 },
    { name: 'Y', type: 'signed', size: 4, scale: 1, offset: 0 },
    { name: 'Z', type: 'signed', size: 4, scale: 1, offset: 0 }
  ],
  bounds: [0, 0, 0, 100, 100, 100],
  boundsConforming: [0, 0, 0, 100, 100, 100],
  ticks: 1,
  dataType: 'binary'
};

describe(EptLoader.name, () => {
  beforeEach(() => {
    vi.spyOn(PointCloudEptGeometryNode.prototype, 'load').mockResolvedValue(undefined);
  });

  test('load() fetches ept.json from baseUrl and builds root node without signed files', async () => {
    const dataProvider = createMockModelDataProvider({
      getJsonFile: vi.fn(async () => eptJson) as ModelDataProvider['getJsonFile']
    });

    const geometry = await EptLoader.load(
      'https://example.com/model',
      'ept.json',
      dataProvider,
      new CdfModelIdentifier(10, 20),
      []
    );

    expect(dataProvider.getJsonFile).toHaveBeenCalledWith('https://example.com/model', 'ept.json');
    expect(geometry.url).toBe('https://example.com/model/');
    expect(geometry.root).toBeInstanceOf(PointCloudEptGeometryNode);
    expect(geometry.root?.signedUrl).toBeUndefined();
    expect(geometry.root?.signedFilesBaseUrl).toBeUndefined();
  });

  test('dmsLoad() builds geometry from preloaded data and resolves signedUrl without fetching JSON', async () => {
    const dataProvider = createMockModelDataProvider();
    const preloadedData: MetadataWithSignedFiles<EptJson> = {
      signedFiles: {
        items: [{ fileName: '0-0-0-0.bin', signedUrl: 'https://cdn.example.com/0-0-0-0.bin', subPath: '' }]
      },
      fileData: eptJson
    };

    const geometry = await EptLoader.dmsLoad(
      'https://signed.example.com',
      dataProvider,
      [],
      dmIdentifier,
      preloadedData
    );

    expect(dataProvider.getJsonFile).not.toHaveBeenCalled();
    expect(geometry.url).toBe('https://signed.example.com/');
    expect(geometry.root?.signedUrl).toBe('https://cdn.example.com/0-0-0-0.bin');
    expect(geometry.root?.signedFilesBaseUrl).toBe('https://signed.example.com');
  });
});
