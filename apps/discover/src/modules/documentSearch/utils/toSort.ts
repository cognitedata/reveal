import { SortBy } from 'pages/types';

// This mapping is derived from toDocument util
export const sortByMap: { [key: string]: string } = {
  'doc.filename': 'sourceFile.name',
  'doc.location': 'sourceFile.source',
  'doc.filetype': 'type',
  'doc.author': 'author',
  'doc.title': 'title',
  // 'doc.topfolder': 'metadata.path', Not supported yet
  // size: 'metadata.size', Not supported yet
  created: 'sourceFile.createdTime',
  modified: 'sourceFile.lastUpdatedTime',
};

export const toSort = ({ id, desc }: SortBy) =>
  `${sortByMap[id]}:${desc ? 'desc' : 'asc'}`;
