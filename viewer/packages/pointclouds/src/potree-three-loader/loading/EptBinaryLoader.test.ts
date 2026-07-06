/*!
 * Copyright 2026 Cognite AS
 */

import { vi } from 'vitest';
import { EptBinaryLoader } from './EptBinaryLoader';
import type { ModelDataProvider } from '@reveal/data-providers';
import { CdfModelIdentifier, DMModelIdentifier } from '@reveal/data-providers';
import type { PointCloudEptGeometryNode } from '../geometry/PointCloudEptGeometryNode';
import { createMockModelDataProvider } from '../../../../../test-utilities/src/createMockModelDataProvider';

vi.mock('../workers/eptBinaryDecoder.worker?worker&inline', () => ({
  default: class MockWorker extends EventTarget {
    postMessage() {}
    terminate() {}
    onmessage = null;
    onmessageerror = null;
    onerror = null;
  }
}));

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
  } as Partial<PointCloudEptGeometryNode> as PointCloudEptGeometryNode;
}

const dmIdentifier = new DMModelIdentifier({
  modelId: 1,
  revisionId: 2,
  revisionExternalId: 'ext-id',
  revisionSpace: 'my-space'
});

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
        nodeFileName: '1-1-0-0',
        nodeBaseUrl: 'https://example.com/ept-data'
      })
    );
    expect(getBinaryFileMock).toHaveBeenCalledWith('https://example.com/ept-data', '1-1-0-0.bin');

    vi.clearAllMocks();

    await loader.getBinaryFile(
      createMockNode({ modelIdentifier: dmIdentifier, signedUrl: undefined, nodeFileName: '0-0-0-0' })
    );
    expect(getBinaryFileMock).toHaveBeenCalledWith(expect.any(String), '0-0-0-0.bin');
  });
});
