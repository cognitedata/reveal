import { sortByDate } from 'utils/sort/sortByDate';

import { IconType, Icon } from '@cognite/cogs.js';

import { DocumentType } from 'modules/documentSearch/types';
import { ColumnMap } from 'modules/documentSearch/utils/getAvailableColumns';

export const columns: ColumnMap<DocumentType> = {
  fileName: {
    Header: 'File Name',
    accessor: 'doc.filename',
    width: '250px',
    maxWidth: '0.5fr',
  },
  author: {
    Header: 'Author',
    accessor: 'doc.author',
    width: '250px',
  },
  fileType: {
    title: 'File type',
    Header: <Icon type={'Document' as IconType} />,
    accessor: 'doc.fileCategory',
    width: '250px',
    maxWidth: '0.5fr',
  },
  source: {
    Header: 'Source',
    accessor: 'doc.location',
    width: '250px',
  },
  topFolder: {
    Header: 'Top Folder',
    accessor: 'doc.topfolder',
    width: '140px',
  },
  category: {
    Header: 'Category',
    accessor: (row) => row.doc.labels?.map((o) => o.externalId).join(', '),
    width: '140px',
  },
  created: {
    Header: 'Created',
    accessor: (doc) => doc.createdDisplay,
    sortType: (rowA, rowB) =>
      sortByDate(rowA.original.created, rowB.original.created),
    width: '140px',
  },
  modified: {
    Header: 'Modified',
    accessor: (doc) => doc.modifiedDisplay,
    sortType: (rowA, rowB) =>
      sortByDate(rowA.original.modified, rowB.original.modified),
    width: '140px',
  },
};

export const LIMITATION_WARNING =
  'We are only showing related documents for the first hundred selected wellbores from the left panel';
