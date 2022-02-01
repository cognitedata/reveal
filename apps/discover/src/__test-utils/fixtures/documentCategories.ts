import { DocumentCategories } from '@cognite/discover-api-types';

export const getMockDocumentCategories = (
  extras?: Partial<DocumentCategories>
): DocumentCategories => ({
  documentType: [
    {
      name: 'one',
      count: 1,
      id: 'documentType',
    },
  ],
  fileCategory: [
    {
      name: 'one',
      count: 1,
      id: 'fileCategory',
    },
  ],
  fileType: [
    {
      name: 'one',
      count: 1,
      id: 'fileType',
    },
  ],
  labels: [
    {
      name: 'one',
      count: 1,
      id: 'labels',
    },
  ],
  location: [
    {
      name: 'one',
      count: 1,
      id: 'location',
    },
  ],
  pageCount: [
    {
      name: 'one',
      count: 1,
      id: 'pageCount',
    },
  ],
  ...extras,
});
