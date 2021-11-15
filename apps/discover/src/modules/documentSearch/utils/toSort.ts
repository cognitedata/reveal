import { SortBy } from 'pages/types';

import { LAST_CREATED_KEY_VALUE, LAST_UPDATED_KEY_VALUE } from '../constants';

// This mapping is derived from toDocument util
export const sortByMap: { [key: string]: string } = {
  'doc.filename': 'sourceFile.name',
  'doc.location': 'sourceFile.source',
  'doc.filetype': 'type',
  'doc.author': 'author',
  'doc.title': 'title',
  // 'doc.topfolder': 'metadata.path', Not supported yet
  // size: 'metadata.size', Not supported yet
  created: `sourceFile.${LAST_CREATED_KEY_VALUE}`,
  modified: `sourceFile.${LAST_UPDATED_KEY_VALUE}`,
};

export const toSort = ({ id, desc }: SortBy) =>
  `${sortByMap[id]}:${desc ? 'desc' : 'asc'}`;
