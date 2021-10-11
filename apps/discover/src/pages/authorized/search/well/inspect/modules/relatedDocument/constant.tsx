import { AllIconTypes, Icon } from '@cognite/cogs.js';

import { getDateOrDefaultText } from '_helpers/date';
import { sortDates } from '_helpers/dateConversion';
import { DocumentTypeDataModel } from 'modules/documentSearch/types';
import { ColumnMap } from 'modules/documentSearch/utils/columns';

export const columns: ColumnMap<DocumentTypeDataModel> = {
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
    Header: <Icon type={'Document' as AllIconTypes} />,
    accessor: 'doc.filetype',
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
    accessor: (row) => getDateOrDefaultText(row.created),
    sortType: (rowA, rowB) =>
      sortDates(rowA.original.created, rowB.original.created),
    width: '140px',
  },
  modified: {
    Header: 'Modified',
    accessor: (row) => getDateOrDefaultText(row.modified),
    sortType: (rowA, rowB) =>
      sortDates(rowA.original.modified, rowB.original.modified),
    width: '140px',
  },
};
