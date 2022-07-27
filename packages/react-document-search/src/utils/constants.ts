export const FILE_TYPE_KEY = 'type';
export const LABELS_KEY = 'labels';
export const SOURCE_KEY = ['sourceFile', 'source'];
export const PAGE_COUNT_KEY = 'pageCount';
export const TOTAL_COUNT_KEY = 'total';

export const DOCUMENT_SEARCH_PAGE_LIMIT = 20;
export const DEFAULT_FILTER_ITEM_LIMIT = 7;

export const DEFAULT_ERROR_MESSAGE =
  'An error occured while doing your search. Please try again later.';

export const SOURCE_FILE_KEY = 'sourceFile';

export const DOCUMENT_KEYS = {
  FILE_NAME: [SOURCE_FILE_KEY, 'name'],
  LOCATION: [SOURCE_FILE_KEY, 'source'],
  FILE_CATEGORY: ['type'],
  AUTHOR: ['author'],
  TITLE: ['title'],
  CREATED_TIME: ['createdTime'],
  MODIFIED_TIME: ['modifiedTime'],
};
