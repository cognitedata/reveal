import { DOCUMENT_KEYS } from 'dataLayers/documents/keys';

import { DocumentSortItem, DocumentFilterProperty } from '@cognite/sdk';

import { SortBy } from 'pages/types';

// This mapping is derived from toDocument util
export const sortByMap: Record<string, DocumentFilterProperty> = {
  'doc.filename': DOCUMENT_KEYS.FILE_NAME,
  'doc.location': DOCUMENT_KEYS.LOCATION,
  'doc.fileCategory': DOCUMENT_KEYS.FILE_CATEGORY,
  'doc.author': DOCUMENT_KEYS.AUTHOR,
  'doc.title': DOCUMENT_KEYS.TITLE,
  // 'doc.topfolder': 'metadata.path', Not supported yet
  // size: 'metadata.size', Not supported yet
  created: DOCUMENT_KEYS.CREATED_TIME,
  modified: DOCUMENT_KEYS.MODIFIED_TIME,
};

export const toSort = ({ id, desc }: SortBy): DocumentSortItem => {
  return {
    property: sortByMap[id],
    order: desc ? 'desc' : 'asc',
  };
};
