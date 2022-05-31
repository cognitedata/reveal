import { Document, DocumentHighlight } from '@cognite/sdk';

import { getMockGeometry } from '../geometry';

export const getDocumentFixture = (
  extras = {},
  derivedExtras = {}
): Document => ({
  id: 123,
  externalId: 'aa123aa',
  createdTime: 1396357617000,
  modifiedTime: 1396357617334,
  language: 'en',
  type: 'PDF',
  title: 'Chapter 5 pressure tests.xlsx',
  geoLocation: getMockGeometry(),
  labels: [{ externalId: 'Unknown' }, { externalId: 'Label-1-ID' }],
  ...extras,

  sourceFile: {
    name: 'Pressure tests.pdf',
    assetIds: [1, 2, 3],
    directory: '/folder1/folder2',
    metadata: {
      parentPath: '/folder1/folder2',
      path: '/folder1/folder2/Pressure tests.pdf',
      fileName: 'Pressure tests.pdf',
    },
    ...derivedExtras,
  },
});

export const getHighlightContentFixture = (): DocumentHighlight => ({
  name: [''],
  content: ['content 1', 'content 2'],
});
