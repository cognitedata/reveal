import { type FileInfo } from '@cognite/sdk';

export function createFileMock(params?: {
  id?: number;
  metadata?: Record<string, string>;
}): FileInfo {
  const fileId = params?.id ?? Math.random();
  return {
    id: fileId,
    name: `file-${fileId}`,
    createdTime: new Date(),
    lastUpdatedTime: new Date(),
    uploaded: true,
    externalId: 'external-id-123',
    metadata: params?.metadata,
    source: 'source',
    dataSetId: 0,
    labels: []
  };
}
