/*!
 * Copyright 2026 Cognite AS
 */

import { vi } from 'vitest';
import { EptBinaryLoader } from './EptBinaryLoader';
import type { EptJson } from './EptJson';
import type { ModelDataProvider } from '@reveal/data-providers';
import { CdfModelIdentifier } from '@reveal/data-providers';
import { PointCloudEptGeometryNode } from '../geometry/PointCloudEptGeometryNode';
import { createMockModelDataProvider } from '../../../../../test-utilities/src/createMockModelDataProvider';
import { createMockEptGeometry } from '../../../../../test-utilities/src/createMockEptGeometry';
import { mockDMModelIdentifier as dmIdentifier } from '../../../../../test-utilities/src/mockModelIdentifiers';

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
  test('DM model with signedUrl calls getBinaryFile with empty baseUrl; classic model and DM without signedUrl call getBinaryFile with baseUrl', async () => {
    const signedUrl = 'https://cdn.example.com/0-0-0-0.bin';
    const getBinaryFileMock = vi.fn<ModelDataProvider['getBinaryFile']>(async () => new ArrayBuffer(16));
    const dataProvider = createMockModelDataProvider({ getBinaryFile: getBinaryFileMock });
    const loader = new EptBinaryLoader(dataProvider, []);

    await loader.getBinaryFile(createMockNode({ modelIdentifier: dmIdentifier, signedUrl }));
    expect(getBinaryFileMock).toHaveBeenCalledWith('', signedUrl);

    vi.clearAllMocks();

    await loader.getBinaryFile(
      createMockNode({
        modelIdentifier: new CdfModelIdentifier(10, 20),
        nodeFileName: '1-1-0-0'
      })
    );
    expect(getBinaryFileMock).toHaveBeenCalledWith('https://example.com/ept-data', '1-1-0-0.bin');

    vi.clearAllMocks();

    await loader.getBinaryFile(
      createMockNode({ modelIdentifier: dmIdentifier, signedUrl: undefined, nodeFileName: '0-0-0-0' })
    );
    expect(getBinaryFileMock).toHaveBeenCalledWith(expect.any(String), '0-0-0-0.bin');
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
    const node = createMockNode({ modelIdentifier: dmIdentifier, signedFilesBaseUrl, nodeFileName: '0-0-0-0' });

    await loader.getBinaryFile(node);

    expect(getFileUrlsForModelMock).toHaveBeenCalledWith(signedFilesBaseUrl, dmIdentifier, 'ept-data/0-0-0-0.bin');
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
      modelIdentifier: dmIdentifier,
      signedFilesBaseUrl: 'https://signed.example.com',
      nodeFileName: '0-0-0-0'
    });

    await loader.getBinaryFile(node);

    expect(getBinaryFileMock).toHaveBeenCalledWith('https://example.com/ept-data', '0-0-0-0.bin');
    expect(node.signedUrl).toBeUndefined();
  });
});
