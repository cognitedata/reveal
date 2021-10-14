export const FILE_TYPE_KEY = 'type';
export const LAST_UPDATED_KEY = 'sourceFile.lastUpdatedTime';
export const LAST_CREATED_KEY = 'sourceFile.createdTime';
export const LABELS_KEY = 'labels';
export const SOURCE_KEY = 'sourceFile.source';

export const DOCUMENT_FALLBACK_SEARCH_LIMIT = 100;
export const DEFAULT_FILTER_ITEM_LIMIT = 7;

export const aggregates = [
  {
    name: 'labels',
    aggregate: 'count',
    groupBy: [LABELS_KEY],
  },
  {
    name: 'location',
    aggregate: 'count',
    groupBy: [SOURCE_KEY],
  },
  {
    name: 'filetype',
    aggregate: 'count',
    groupBy: [FILE_TYPE_KEY],
  },
  {
    name: 'lastcreated',
    aggregate: 'dateHistogram',
    field: LAST_CREATED_KEY,
    interval: 'year',
  },
  {
    // this is the backup value for 'lastmodified' and
    // this is used for the TOTAL count of results
    name: 'lastUpdatedTime',
    aggregate: 'dateHistogram',
    field: LAST_UPDATED_KEY,
    interval: 'year',
  },
];
