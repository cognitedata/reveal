import { Document } from '@cognite/sdk-playground';

import { getMockGeometry } from '../geometry';

export const getDocumentFixture = (
  extras = {},
  derivedExtras = {}
): Document => ({
  id: 123,
  externalId: 'aa123aa',
  createdTime: 1592472506240,
  language: 'en',
  type: 'PDF',
  title: 'Chapter 5 pressure tests.xlsx',
  geoLocation: getMockGeometry() as any, // Remove any once its fixed in sdk
  labels: [{ externalId: 'Unknown' }, { externalId: 'Label-1-ID' }],
  ...extras,

  sourceFile: {
    name: 'Pressure tests.pdf',
    assetIds: [1, 2, 3],
    directory: '/folder1/folder2',
    sourceCreatedTime: new Date(1396357617000),
    sourceModifiedTime: new Date(1396357617334),
    lastUpdatedTime: new Date(1396357617334),
    metadata: {
      parentPath: '/folder1/folder2',
      path: '/folder1/folder2/Pressure tests.pdf',
      fileName: 'Pressure tests.pdf',
    },
    ...derivedExtras,
  },
});
