import { LAST_CREATED_KEY, LAST_UPDATED_KEY } from 'dataLayers/documents/keys';

import { DocumentSortItem, DocumentFilterProperty } from '@cognite/sdk';

import { SortBy } from 'pages/types';

// This mapping is derived from toDocument util
export const sortByMap: { [key: string]: DocumentFilterProperty } = {
  'doc.filename': ['sourceFile', 'name'],
  'doc.location': ['sourceFile', 'source'],
  'doc.fileCategory': ['type'],
  'doc.author': ['author'],
  'doc.title': ['title'],
  // 'doc.topfolder': 'metadata.path', Not supported yet
  // size: 'metadata.size', Not supported yet
  created: [LAST_CREATED_KEY],
  modified: [LAST_UPDATED_KEY],
};

export const toSort = ({ id, desc }: SortBy): DocumentSortItem => {
  return {
    property: sortByMap[id],
    order: desc ? 'desc' : 'asc',
  };
};
