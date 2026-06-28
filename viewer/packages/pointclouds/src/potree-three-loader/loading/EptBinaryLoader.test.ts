/*!
 * Copyright 2026 Cognite AS
 */

import { vi } from 'vitest';
import { EptBinaryLoader } from './EptBinaryLoader';
import type { ModelDataProvider } from '@reveal/data-providers';
import { CdfModelIdentifier, DMModelIdentifier } from '@reveal/data-providers';
import type { PointCloudEptGeometryNode } from '../geometry/PointCloudEptGeometryNode';

vi.mock('../workers/eptBinaryDecoder.worker?worker&inline', () => ({
  default: class MockWorker extends EventTarget {
    postMessage() {}
    terminate() {}
    onmessage = null;
    onmessageerror = null;
    onerror = null;
  }
}));

function createMockDataProvider(overrides: Partial<ModelDataProvider> = {}): ModelDataProvider {
  return {
    getBinaryFile: vi.fn<ModelDataProvider['getBinaryFile']>(async () => new ArrayBuffer(8)),
    getJsonFile: vi.fn<ModelDataProvider['getJsonFile']>(),
    getSignedBinaryFile: vi.fn<ModelDataProvider['getSignedBinaryFile']>(async () => new ArrayBuffer(16)),
    getSignedJsonFile: vi.fn<ModelDataProvider['getSignedJsonFile']>(),
    getDMSJsonFile: vi.fn<ModelDataProvider['getDMSJsonFile']>(),
    getDMSJsonFileFromFileName: vi.fn<ModelDataProvider['getDMSJsonFileFromFileName']>(),
    ...overrides
  };
}

function createMockNode(options: {
  modelIdentifier?: InstanceType<typeof CdfModelIdentifier>;
  signedUrl?: string;
  nodeFileName?: string;
  nodeBaseUrl?: string;
}): PointCloudEptGeometryNode {
  return {
    modelIdentifier: options.modelIdentifier ?? new CdfModelIdentifier(1, 2),
    signedUrl: options.signedUrl,
    fileName: vi.fn<PointCloudEptGeometryNode['fileName']>(() => options.nodeFileName ?? '0-0-0-0'),
    baseUrl: vi.fn<PointCloudEptGeometryNode['baseUrl']>(() => options.nodeBaseUrl ?? 'https://example.com/ept-data'),
    loaded: false,
    getNumPoints: vi.fn<PointCloudEptGeometryNode['getNumPoints']>(() => 0),
    markAsNotLoading: vi.fn<PointCloudEptGeometryNode['markAsNotLoading']>()
  } as unknown as PointCloudEptGeometryNode;
}

const dmIdentifier = new DMModelIdentifier({
  modelId: 1,
  revisionId: 2,
  revisionExternalId: 'ext-id',
  revisionSpace: 'my-space'
});

describe(EptBinaryLoader.name, () => {
  test('DM model with signedUrl calls getSignedBinaryFile; classic model calls getBinaryFile', async () => {
    const signedUrl = 'https://cdn.example.com/0-0-0-0.bin';
    const dataProvider = createMockDataProvider();
    const loader = new EptBinaryLoader(dataProvider, []);

    await loader.getBinaryFile(createMockNode({ modelIdentifier: dmIdentifier, signedUrl }));
    expect(dataProvider.getSignedBinaryFile).toHaveBeenCalledWith(signedUrl);
    expect(dataProvider.getBinaryFile).not.toHaveBeenCalled();

    vi.clearAllMocks();

    await loader.getBinaryFile(
      createMockNode({ modelIdentifier: new CdfModelIdentifier(10, 20), nodeFileName: '1-1-0-0', nodeBaseUrl: 'https://example.com/ept-data' })
    );
    expect(dataProvider.getBinaryFile).toHaveBeenCalledWith('https://example.com/ept-data', '1-1-0-0.bin');
    expect(dataProvider.getSignedBinaryFile).not.toHaveBeenCalled();
  });

  test('DM model without signedUrl falls back to getBinaryFile', async () => {
    const dataProvider = createMockDataProvider();
    const loader = new EptBinaryLoader(dataProvider, []);

    await loader.getBinaryFile(
      createMockNode({ modelIdentifier: dmIdentifier, signedUrl: undefined, nodeFileName: '0-0-0-0' })
    );

    expect(dataProvider.getBinaryFile).toHaveBeenCalledWith(expect.any(String), '0-0-0-0.bin');
    expect(dataProvider.getSignedBinaryFile).not.toHaveBeenCalled();
  });

  test('load skips binary fetch when node has zero points', async () => {
    const dataProvider = createMockDataProvider();
    const loader = new EptBinaryLoader(dataProvider, []);

    await loader.load(createMockNode({ nodeFileName: '0-0-0-0' }));

    expect(dataProvider.getBinaryFile).not.toHaveBeenCalled();
    expect(dataProvider.getSignedBinaryFile).not.toHaveBeenCalled();
  });
});
