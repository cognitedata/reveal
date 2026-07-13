/*!
 * Copyright 2026 Cognite AS
 */

import { vi } from 'vitest';
import { EptBinaryLoader } from './EptBinaryLoader';
import type { EptJson } from './EptJson';
import type { ModelDataProvider } from '@reveal/data-providers';
import { CdfModelIdentifier } from '@reveal/data-providers';
import { PointCloudEptGeometryNode } from '../geometry/PointCloudEptGeometryNode';
import {
  createMockEptGeometry,
  createMockModelDataProvider,
  mockDMModelIdentifier
} from '../../../../../test-utilities';

const EPT_URL = 'https://example.com/';

function createMockNode(options: {
  modelIdentifier?: InstanceType<typeof CdfModelIdentifier>;
  signedUrl?: string;
  signedFilesBaseUrl?: string;
  nodeFileName?: string;
}): PointCloudEptGeometryNode {
  const [d, x, y, z] = (options.nodeFileName ?? '0-0-0-0').split('-').map(Number);
  const node = new PointCloudEptGeometryNode(
    createMockEptGeometry(EPT_URL),
    createMockModelDataProvider(),
    options.modelIdentifier ?? new CdfModelIdentifier(1, 2),
    { fileData: {} as Partial<EptJson> as EptJson },
    options.signedFilesBaseUrl,
    undefined,
    d,
    x,
    y,
    z
  );
  node.signedUrl = options.signedUrl;
  return node;
}

describe(EptBinaryLoader.name, () => {
  const BASE_URL = 'https://example.com/ept-data';
  const SIGNED_URL = 'https://cdn.example.com/0-0-0-0.bin';

  test.each<[string, Parameters<typeof createMockNode>[0], [string, string]]>([
    ['DM model with signedUrl', { modelIdentifier: mockDMModelIdentifier, signedUrl: SIGNED_URL }, ['', SIGNED_URL]],
    [
      'classic model without signedUrl',
      { modelIdentifier: new CdfModelIdentifier(10, 20), nodeFileName: '1-1-0-0' },
      [BASE_URL, '1-1-0-0.bin']
    ],
    [
      'DM model without signedUrl',
      { modelIdentifier: mockDMModelIdentifier, nodeFileName: '2-2-0-0' },
      [BASE_URL, '2-2-0-0.bin']
    ]
  ])('%s calls getBinaryFile with the expected base URL and file name', async (_, nodeOptions, expectedArgs) => {
    const getBinaryFileMock = vi.fn<ModelDataProvider['getBinaryFile']>(async () => new ArrayBuffer(16));
    const dataProvider = createMockModelDataProvider({ getBinaryFile: getBinaryFileMock });
    const loader = new EptBinaryLoader(dataProvider, []);

    await loader.getBinaryFile(createMockNode(nodeOptions));

    expect(getBinaryFileMock).toHaveBeenCalledWith(...expectedArgs);
  });

  test('DM model without cached signedUrl resolves it via getFileUrlsForModel, and caches it on the node', async () => {
    const signedFilesBaseUrl = 'https://signed.example.com';
    const resolvedSignedUrl = 'https://cdn.example.com/0-0-0-0.bin';
    const getFileUrlsForModelMock = vi.fn<NonNullable<ModelDataProvider['getFileUrlsForModel']>>(async () => [
      { fileName: '0-0-0-0.bin', signedUrl: resolvedSignedUrl, subPath: '' }
    ]);
    const getBinaryFileMock = vi.fn<ModelDataProvider['getBinaryFile']>(async () => new ArrayBuffer(16));
    const dataProvider = createMockModelDataProvider({
      getFileUrlsForModel: getFileUrlsForModelMock,
      getBinaryFile: getBinaryFileMock
    });
    const loader = new EptBinaryLoader(dataProvider, []);
    const node = createMockNode({
      modelIdentifier: mockDMModelIdentifier,
      signedFilesBaseUrl,
      nodeFileName: '0-0-0-0'
    });

    await loader.getBinaryFile(node);

    expect(getFileUrlsForModelMock).toHaveBeenCalledWith(
      signedFilesBaseUrl,
      mockDMModelIdentifier,
      'ept-data/0-0-0-0.bin'
    );
    expect(getBinaryFileMock).toHaveBeenCalledWith('', resolvedSignedUrl);
    expect(node.signedUrl).toBe(resolvedSignedUrl);
  });

  test('DM model falls back to baseUrl when getFileUrlsForModel finds no matching item', async () => {
    const getBinaryFileMock = vi.fn<ModelDataProvider['getBinaryFile']>(async () => new ArrayBuffer(16));
    const dataProvider = createMockModelDataProvider({
      getFileUrlsForModel: vi.fn<NonNullable<ModelDataProvider['getFileUrlsForModel']>>(async () => []),
      getBinaryFile: getBinaryFileMock
    });
    const loader = new EptBinaryLoader(dataProvider, []);
    const node = createMockNode({
      modelIdentifier: mockDMModelIdentifier,
      signedFilesBaseUrl: 'https://signed.example.com',
      nodeFileName: '0-0-0-0'
    });

    await loader.getBinaryFile(node);

    expect(getBinaryFileMock).toHaveBeenCalledWith('https://example.com/ept-data', '0-0-0-0.bin');
    expect(node.signedUrl).toBeUndefined();
  });
});
