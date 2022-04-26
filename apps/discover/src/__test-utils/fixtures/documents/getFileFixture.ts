import { FileInfo } from '@cognite/sdk';

import { getMockGeometry } from '../geometry';

export const getFileFixture = (extras = {}): FileInfo => ({
  id: 123,
  externalId: 'aa123aa',
  sourceCreatedTime: new Date(1396357617000),
  sourceModifiedTime: new Date(1396357617334),
  name: 'Chapter 5 pressure tests.xlsx',
  uploaded: true,
  createdTime: new Date(1396357617000),
  lastUpdatedTime: new Date(1396357617334),
  geoLocation: getMockGeometry() as any, // Remove any once its fixed in sdk
  labels: [{ externalId: 'Unknown' }, { externalId: 'Label-1-ID' }],
  assetIds: [1, 2, 3],
  directory: '/folder1/folder2',
  metadata: {
    parentPath: '/folder1/folder2',
    path: '/folder1/folder2/Pressure tests.pdf',
    fileName: 'Pressure tests.pdf',
  },
  ...extras,
});
